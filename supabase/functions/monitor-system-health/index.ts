import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthMetric {
  metric_name: string
  metric_value: number
  status: 'healthy' | 'warning' | 'critical'
  details: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting system health monitoring...')

    const healthMetrics: HealthMetric[] = []
    const alerts: any[] = []

    // 1. Database Connection Health
    try {
      const startTime = Date.now()
      const { data, error } = await supabaseClient
        .from('users')
        .select('id')
        .limit(1)
      
      const responseTime = Date.now() - startTime
      
      healthMetrics.push({
        metric_name: 'database_response_time',
        metric_value: responseTime,
        status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'critical',
        details: { error: error?.message || null }
      })

      if (error) {
        alerts.push({
          type: 'database_error',
          severity: 'critical',
          message: `Database connection error: ${error.message}`,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      healthMetrics.push({
        metric_name: 'database_connection',
        metric_value: 0,
        status: 'critical',
        details: { error: error.message }
      })
      
      alerts.push({
        type: 'database_connection_failed',
        severity: 'critical',
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString()
      })
    }

    // 2. User Count Monitoring
    try {
      const { count: totalUsers, error: usersError } = await supabaseClient
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (!usersError) {
        healthMetrics.push({
          metric_name: 'total_users',
          metric_value: totalUsers || 0,
          status: 'healthy',
          details: { timestamp: new Date().toISOString() }
        })
      }
    } catch (error) {
      console.error('Error counting users:', error)
    }

    // 3. Tenant Count Monitoring
    try {
      const { count: totalTenants, error: tenantsError } = await supabaseClient
        .from('tenants')
        .select('*', { count: 'exact', head: true })

      if (!tenantsError) {
        healthMetrics.push({
          metric_name: 'total_tenants',
          metric_value: totalTenants || 0,
          status: 'healthy',
          details: { timestamp: new Date().toISOString() }
        })
      }
    } catch (error) {
      console.error('Error counting tenants:', error)
    }

    // 4. Invoice Status Monitoring
    try {
      const { data: invoiceStats, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('status')

      if (!invoiceError && invoiceStats) {
        const statusCounts = invoiceStats.reduce((acc: any, invoice: any) => {
          acc[invoice.status] = (acc[invoice.status] || 0) + 1
          return acc
        }, {})

        const totalInvoices = invoiceStats.length
        const overdueInvoices = statusCounts.overdue || 0
        const overduePercentage = totalInvoices > 0 ? (overdueInvoices / totalInvoices) * 100 : 0

        healthMetrics.push({
          metric_name: 'total_invoices',
          metric_value: totalInvoices,
          status: 'healthy',
          details: { status_breakdown: statusCounts }
        })

        healthMetrics.push({
          metric_name: 'overdue_invoice_percentage',
          metric_value: overduePercentage,
          status: overduePercentage < 20 ? 'healthy' : overduePercentage < 40 ? 'warning' : 'critical',
          details: { overdue_count: overdueInvoices, total_count: totalInvoices }
        })

        if (overduePercentage > 30) {
          alerts.push({
            type: 'high_overdue_invoices',
            severity: overduePercentage > 50 ? 'critical' : 'warning',
            message: `${overduePercentage.toFixed(1)}% of invoices are overdue (${overdueInvoices}/${totalInvoices})`,
            timestamp: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Error monitoring invoices:', error)
    }

    // 5. Storage Usage Monitoring
    try {
      const { data: storageFiles, error: storageError } = await supabaseClient
        .from('storage_files')
        .select('size, bucket')

      if (!storageError && storageFiles) {
        const totalSize = storageFiles.reduce((sum: number, file: any) => sum + (file.size || 0), 0)
        const totalFiles = storageFiles.length
        const bucketCounts = storageFiles.reduce((acc: any, file: any) => {
          acc[file.bucket] = (acc[file.bucket] || 0) + 1
          return acc
        }, {})

        healthMetrics.push({
          metric_name: 'storage_total_size',
          metric_value: totalSize,
          status: 'healthy',
          details: { 
            total_files: totalFiles,
            bucket_breakdown: bucketCounts,
            size_mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
          }
        })

        healthMetrics.push({
          metric_name: 'storage_total_files',
          metric_value: totalFiles,
          status: 'healthy',
          details: { bucket_breakdown: bucketCounts }
        })
      }
    } catch (error) {
      console.error('Error monitoring storage:', error)
    }

    // 6. Active Users (last 24 hours)
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { count: activeUsers, error: activeUsersError } = await supabaseClient
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

      if (!activeUsersError) {
        healthMetrics.push({
          metric_name: 'active_users_24h',
          metric_value: activeUsers || 0,
          status: 'healthy',
          details: { period: '24_hours' }
        })
      }
    } catch (error) {
      console.error('Error counting active users:', error)
    }

    // 7. Error Rate Monitoring (last hour)
    try {
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)

      const { data: recentErrors, error: errorsError } = await supabaseClient
        .from('activity_log')
        .select('action')
        .gte('created_at', oneHourAgo.toISOString())

      if (!errorsError && recentErrors) {
        const errorActions = recentErrors.filter(log => 
          log.action.includes('error') || log.action.includes('failed')
        ).length
        
        const totalActions = recentErrors.length
        const errorRate = totalActions > 0 ? (errorActions / totalActions) * 100 : 0

        healthMetrics.push({
          metric_name: 'error_rate_1h',
          metric_value: errorRate,
          status: errorRate < 5 ? 'healthy' : errorRate < 15 ? 'warning' : 'critical',
          details: { 
            error_count: errorActions, 
            total_count: totalActions,
            period: '1_hour'
          }
        })

        if (errorRate > 10) {
          alerts.push({
            type: 'high_error_rate',
            severity: errorRate > 20 ? 'critical' : 'warning',
            message: `High error rate: ${errorRate.toFixed(1)}% in the last hour (${errorActions}/${totalActions})`,
            timestamp: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Error monitoring error rate:', error)
    }

    // 8. External API Health Check
    try {
      // Test exchange rate API
      const exchangeRateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/GHS', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      const exchangeRateStatus = exchangeRateResponse.ok ? 'healthy' : 'warning'
      
      healthMetrics.push({
        metric_name: 'exchange_rate_api_health',
        metric_value: exchangeRateResponse.status,
        status: exchangeRateStatus,
        details: { 
          status_code: exchangeRateResponse.status,
          response_time: Date.now() - Date.now()
        }
      })

      if (!exchangeRateResponse.ok) {
        alerts.push({
          type: 'exchange_rate_api_error',
          severity: 'warning',
          message: `Exchange rate API returned status ${exchangeRateResponse.status}`,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      healthMetrics.push({
        metric_name: 'exchange_rate_api_health',
        metric_value: 0,
        status: 'critical',
        details: { error: error.message }
      })

      alerts.push({
        type: 'exchange_rate_api_failed',
        severity: 'warning',
        message: `Exchange rate API health check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      })
    }

    // Store health metrics in database
    try {
      if (healthMetrics.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('system_health')
          .insert(healthMetrics.map(metric => ({
            ...metric,
            recorded_at: new Date().toISOString()
          })))

        if (insertError) {
          console.error('Error storing health metrics:', insertError)
        }
      }
    } catch (error) {
      console.error('Error storing health metrics:', error)
    }

    // Send alerts if any critical issues
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
    const warningAlerts = alerts.filter(alert => alert.severity === 'warning')

    if (criticalAlerts.length > 0 || warningAlerts.length > 0) {
      try {
        // Get admin users for notifications
        const { data: adminUsers } = await supabaseClient
          .from('users')
          .select('email')
          .eq('role', 'super')
          .limit(1)

        if (adminUsers && adminUsers.length > 0) {
          await fetch(`${Deno.env.get('NEXT_PUBLIC_APP_URL')}/api/email/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              type: 'system_health_alert',
              data: {
                businessName: 'Ardent Invoicing',
                clientName: adminUsers[0].email,
                summary: `System Health Alert - ${criticalAlerts.length} critical, ${warningAlerts.length} warnings`,
                details: {
                  critical_alerts: criticalAlerts,
                  warning_alerts: warningAlerts,
                  health_metrics: healthMetrics.filter(m => m.status !== 'healthy')
                }
              }
            })
          })
        }
      } catch (emailError) {
        console.error('Error sending health alert email:', emailError)
      }
    }

    // Clean up old health metrics (keep last 7 days)
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      await supabaseClient
        .from('system_health')
        .delete()
        .lt('recorded_at', sevenDaysAgo.toISOString())
    } catch (cleanupError) {
      console.error('Error cleaning up old health metrics:', cleanupError)
    }

    const overallStatus = criticalAlerts.length > 0 ? 'critical' : 
                         warningAlerts.length > 0 ? 'warning' : 'healthy'

    console.log(`System health check completed. Status: ${overallStatus}`)

    return new Response(
      JSON.stringify({
        success: true,
        status: overallStatus,
        timestamp: new Date().toISOString(),
        metrics: healthMetrics,
        alerts: alerts,
        summary: {
          total_metrics: healthMetrics.length,
          critical_alerts: criticalAlerts.length,
          warning_alerts: warningAlerts.length,
          healthy_metrics: healthMetrics.filter(m => m.status === 'healthy').length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in health monitoring:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
