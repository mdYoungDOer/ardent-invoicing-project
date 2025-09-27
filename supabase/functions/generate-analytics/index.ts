import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsData {
  tenant_id: string
  metric_type: string
  period: string
  data: any
  calculated_at: string
  expires_at: string
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

    console.log('Starting analytics generation...')

    const results = {
      processed: 0,
      generated: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    }

    // Get all active tenants
    const { data: tenants, error: tenantsError } = await supabaseClient
      .from('tenants')
      .select('id, business_name, created_at')

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tenants' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${tenants?.length || 0} tenants to process`)

    // Process analytics for each tenant
    for (const tenant of tenants || []) {
      try {
        results.processed++

        // Generate daily analytics
        await generateTenantAnalytics(supabaseClient, tenant.id, 'daily', results)
        
        // Generate weekly analytics (only on Sundays)
        const today = new Date()
        if (today.getDay() === 0) { // Sunday
          await generateTenantAnalytics(supabaseClient, tenant.id, 'weekly', results)
        }

        // Generate monthly analytics (only on 1st of month)
        if (today.getDate() === 1) {
          await generateTenantAnalytics(supabaseClient, tenant.id, 'monthly', results)
        }

        // Generate yearly analytics (only on January 1st)
        if (today.getMonth() === 0 && today.getDate() === 1) {
          await generateTenantAnalytics(supabaseClient, tenant.id, 'yearly', results)
        }

      } catch (error) {
        console.error(`Error processing tenant ${tenant.id}:`, error)
        results.errors++
        results.details.push({
          tenant_id: tenant.id,
          error: error.message
        })
      }
    }

    // Generate system-wide analytics
    try {
      await generateSystemAnalytics(supabaseClient, results)
    } catch (error) {
      console.error('Error generating system analytics:', error)
      results.errors++
    }

    console.log('Analytics generation completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Analytics generation completed. Processed: ${results.processed} tenants`,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in analytics generation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateTenantAnalytics(
  supabaseClient: any, 
  tenantId: string, 
  period: string, 
  results: any
) {
  try {
    const now = new Date()
    const analyticsData: any = {}

    // Set date range based on period
    let startDate: Date
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay()) // Start of week
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now)
    }

    // 1. Invoice Analytics
    const { data: invoices } = await supabaseClient
      .from('invoices')
      .select('amount, currency, status, created_at, due_date')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())

    if (invoices) {
      const totalInvoices = invoices.length
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount), 0)
      
      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'overdue' || 
        (inv.status === 'sent' && new Date(inv.due_date) < now)
      ).length

      const paidInvoices = invoices.filter(inv => inv.status === 'paid').length
      const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0

      analyticsData.invoices = {
        total: totalInvoices,
        total_revenue: totalRevenue,
        overdue_count: overdueInvoices,
        paid_count: paidInvoices,
        payment_rate: Math.round(paymentRate * 100) / 100,
        average_invoice_value: totalInvoices > 0 ? Math.round((totalRevenue / paidInvoices) * 100) / 100 : 0
      }
    }

    // 2. Expense Analytics
    const { data: expenses } = await supabaseClient
      .from('expenses')
      .select('amount, currency, category, expense_date')
      .eq('tenant_id', tenantId)
      .gte('expense_date', startDate.toISOString().split('T')[0])

    if (expenses) {
      const totalExpenses = expenses.length
      const totalExpenseAmount = expenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0)
      
      const categoryBreakdown = expenses.reduce((acc: any, exp: any) => {
        acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount)
        return acc
      }, {})

      analyticsData.expenses = {
        total: totalExpenses,
        total_amount: totalExpenseAmount,
        category_breakdown: categoryBreakdown,
        average_expense: totalExpenses > 0 ? Math.round((totalExpenseAmount / totalExpenses) * 100) / 100 : 0
      }
    }

    // 3. Customer Analytics
    const { data: customers } = await supabaseClient
      .from('clients')
      .select('id, name, email, created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())

    if (customers) {
      analyticsData.customers = {
        total: customers.length,
        new_customers: customers.filter(c => new Date(c.created_at) >= startDate).length
      }
    }

    // 4. Cash Flow Analysis
    if (analyticsData.invoices && analyticsData.expenses) {
      const netCashFlow = analyticsData.invoices.total_revenue - analyticsData.expenses.total_amount
      analyticsData.cash_flow = {
        net_cash_flow: Math.round(netCashFlow * 100) / 100,
        revenue: analyticsData.invoices.total_revenue,
        expenses: analyticsData.expenses.total_amount,
        profit_margin: analyticsData.invoices.total_revenue > 0 ? 
          Math.round((netCashFlow / analyticsData.invoices.total_revenue) * 100 * 100) / 100 : 0
      }
    }

    // 5. Growth Metrics (compare with previous period)
    const previousStartDate = new Date(startDate)
    const periodLength = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365
    previousStartDate.setDate(previousStartDate.getDate() - periodLength)

    const { data: previousInvoices } = await supabaseClient
      .from('invoices')
      .select('amount, status, created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    if (previousInvoices && analyticsData.invoices) {
      const previousRevenue = previousInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount), 0)
      
      const revenueGrowth = previousRevenue > 0 ? 
        ((analyticsData.invoices.total_revenue - previousRevenue) / previousRevenue) * 100 : 0

      analyticsData.growth = {
        revenue_growth: Math.round(revenueGrowth * 100) / 100,
        invoice_count_growth: previousInvoices.length > 0 ? 
          ((analyticsData.invoices.total - previousInvoices.length) / previousInvoices.length) * 100 : 0
      }
    }

    // Store analytics in cache
    const expiresAt = new Date(now)
    switch (period) {
      case 'daily':
        expiresAt.setDate(expiresAt.getDate() + 1)
        break
      case 'weekly':
        expiresAt.setDate(expiresAt.getDate() + 7)
        break
      case 'monthly':
        expiresAt.setMonth(expiresAt.getMonth() + 1)
        break
      case 'yearly':
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        break
    }

    const analyticsRecord = {
      tenant_id: tenantId,
      metric_type: 'tenant_analytics',
      period: period,
      data: analyticsData,
      calculated_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    }

    // Upsert analytics cache
    const { error: upsertError } = await supabaseClient
      .from('analytics_cache')
      .upsert(analyticsRecord, {
        onConflict: 'tenant_id,metric_type,period,calculated_at'
      })

    if (!upsertError) {
      results.generated++
      results.details.push({
        tenant_id: tenantId,
        period: period,
        metrics: Object.keys(analyticsData)
      })
      console.log(`Generated ${period} analytics for tenant ${tenantId}`)
    } else {
      console.error('Error storing analytics:', upsertError)
      results.errors++
    }

  } catch (error) {
    console.error(`Error generating analytics for tenant ${tenantId}:`, error)
    results.errors++
  }
}

async function generateSystemAnalytics(supabaseClient: any, results: any) {
  try {
    const now = new Date()
    const analyticsData: any = {}

    // 1. System-wide metrics
    const { count: totalUsers } = await supabaseClient
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: totalTenants } = await supabaseClient
      .from('tenants')
      .select('*', { count: 'exact', head: true })

    const { count: totalInvoices } = await supabaseClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })

    const { data: subscriptionStats } = await supabaseClient
      .from('users')
      .select('subscription_tier')
      .not('subscription_tier', 'is', null)

    const subscriptionBreakdown = subscriptionStats?.reduce((acc: any, user: any) => {
      acc[user.subscription_tier] = (acc[user.subscription_tier] || 0) + 1
      return acc
    }, {}) || {}

    // 2. Revenue metrics
    const { data: paidInvoices } = await supabaseClient
      .from('invoices')
      .select('amount, currency')
      .eq('status', 'paid')

    const totalRevenue = paidInvoices?.reduce((sum: number, inv: any) => sum + parseFloat(inv.amount), 0) || 0

    // 3. Monthly recurring revenue calculation
    const { data: activeSubscriptions } = await supabaseClient
      .from('subscriptions')
      .select('amount, interval')
      .eq('status', 'active')

    const monthlyRecurringRevenue = activeSubscriptions?.reduce((sum: number, sub: any) => {
      const monthlyAmount = sub.interval === 'monthly' ? sub.amount : 
                           sub.interval === 'quarterly' ? sub.amount / 3 :
                           sub.amount / 12
      return sum + monthlyAmount
    }, 0) || 0

    analyticsData.system = {
      total_users: totalUsers || 0,
      total_tenants: totalTenants || 0,
      total_invoices: totalInvoices || 0,
      subscription_breakdown: subscriptionBreakdown,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      monthly_recurring_revenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      average_revenue_per_tenant: totalTenants > 0 ? Math.round((totalRevenue / totalTenants) * 100) / 100 : 0
    }

    // 4. Performance metrics
    const { data: recentActivity } = await supabaseClient
      .from('activity_log')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    analyticsData.performance = {
      active_users_24h: new Set(recentActivity?.map(a => a.created_at) || []).size,
      system_uptime: '99.9%', // This would come from monitoring
      average_response_time: '150ms' // This would come from monitoring
    }

    // Store system analytics
    const expiresAt = new Date(now)
    expiresAt.setHours(expiresAt.getHours() + 1) // Expire after 1 hour

    const analyticsRecord = {
      tenant_id: null, // System-wide analytics
      metric_type: 'system_analytics',
      period: 'daily',
      data: analyticsData,
      calculated_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    }

    const { error: upsertError } = await supabaseClient
      .from('analytics_cache')
      .upsert(analyticsRecord)

    if (!upsertError) {
      results.generated++
      console.log('Generated system analytics')
    } else {
      console.error('Error storing system analytics:', upsertError)
      results.errors++
    }

  } catch (error) {
    console.error('Error generating system analytics:', error)
    results.errors++
  }
}
