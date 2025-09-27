import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Starting data cleanup process...')

    const results = {
      processed: 0,
      cleaned: 0,
      archived: 0,
      errors: 0,
      details: [] as any[]
    }

    // 1. Clean up expired analytics cache
    try {
      const { data: expiredCache, error: cacheError } = await supabaseClient
        .from('analytics_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select()

      if (!cacheError) {
        results.cleaned += expiredCache?.length || 0
        results.details.push({
          operation: 'expired_analytics_cache',
          count: expiredCache?.length || 0
        })
        console.log(`Cleaned ${expiredCache?.length || 0} expired analytics cache entries`)
      } else {
        console.error('Error cleaning analytics cache:', cacheError)
        results.errors++
      }
    } catch (error) {
      console.error('Error in analytics cache cleanup:', error)
      results.errors++
    }

    // 2. Clean up old system health metrics (keep last 30 days)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: oldHealthMetrics, error: healthError } = await supabaseClient
        .from('system_health')
        .delete()
        .lt('recorded_at', thirtyDaysAgo.toISOString())
        .select()

      if (!healthError) {
        results.cleaned += oldHealthMetrics?.length || 0
        results.details.push({
          operation: 'old_health_metrics',
          count: oldHealthMetrics?.length || 0
        })
        console.log(`Cleaned ${oldHealthMetrics?.length || 0} old health metrics`)
      } else {
        console.error('Error cleaning health metrics:', healthError)
        results.errors++
      }
    } catch (error) {
      console.error('Error in health metrics cleanup:', error)
      results.errors++
    }

    // 3. Clean up old activity logs (keep last 90 days)
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data: oldActivityLogs, error: activityError } = await supabaseClient
        .from('activity_log')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString())
        .select()

      if (!activityError) {
        results.cleaned += oldActivityLogs?.length || 0
        results.details.push({
          operation: 'old_activity_logs',
          count: oldActivityLogs?.length || 0
        })
        console.log(`Cleaned ${oldActivityLogs?.length || 0} old activity logs`)
      } else {
        console.error('Error cleaning activity logs:', activityError)
        results.errors++
      }
    } catch (error) {
      console.error('Error in activity logs cleanup:', error)
      results.errors++
    }

    // 4. Clean up old email logs (keep last 60 days)
    try {
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const { data: oldEmailLogs, error: emailError } = await supabaseClient
        .from('email_logs')
        .delete()
        .lt('created_at', sixtyDaysAgo.toISOString())
        .select()

      if (!emailError) {
        results.cleaned += oldEmailLogs?.length || 0
        results.details.push({
          operation: 'old_email_logs',
          count: oldEmailLogs?.length || 0
        })
        console.log(`Cleaned ${oldEmailLogs?.length || 0} old email logs`)
      } else {
        console.error('Error cleaning email logs:', emailError)
        results.errors++
      }
    } catch (error) {
      console.error('Error in email logs cleanup:', error)
      results.errors++
    }

    // 5. Clean up old backup logs (keep last 30 days)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: oldBackupLogs, error: backupError } = await supabaseClient
        .from('backup_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .select()

      if (!backupError) {
        results.cleaned += oldBackupLogs?.length || 0
        results.details.push({
          operation: 'old_backup_logs',
          count: oldBackupLogs?.length || 0
        })
        console.log(`Cleaned ${oldBackupLogs?.length || 0} old backup logs`)
      } else {
        console.error('Error cleaning backup logs:', backupError)
        results.errors++
      }
    } catch (error) {
      console.error('Error in backup logs cleanup:', error)
      results.errors++
    }

    // 6. Archive old invoices (older than 7 years) - mark as archived instead of deleting
    try {
      const sevenYearsAgo = new Date()
      sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7)

      const { data: oldInvoices, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('id, invoice_number, created_at')
        .lt('created_at', sevenYearsAgo.toISOString())
        .neq('status', 'archived')
        .limit(100) // Process in batches to avoid timeouts

      if (!invoiceError && oldInvoices && oldInvoices.length > 0) {
        // Update invoices to archived status instead of deleting
        const { error: archiveError } = await supabaseClient
          .from('invoices')
          .update({ 
            status: 'archived',
            updated_at: new Date().toISOString()
          })
          .in('id', oldInvoices.map(inv => inv.id))

        if (!archiveError) {
          results.archived += oldInvoices.length
          results.details.push({
            operation: 'archived_old_invoices',
            count: oldInvoices.length,
            period: '7_years'
          })
          console.log(`Archived ${oldInvoices.length} old invoices`)
        } else {
          console.error('Error archiving invoices:', archiveError)
          results.errors++
        }
      }
    } catch (error) {
      console.error('Error in invoice archiving:', error)
      results.errors++
    }

    // 7. Clean up old notifications (keep last 30 days)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: oldNotifications, error: notificationError } = await supabaseClient
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('read', true) // Only delete read notifications
        .select()

      if (!notificationError) {
        results.cleaned += oldNotifications?.length || 0
        results.details.push({
          operation: 'old_read_notifications',
          count: oldNotifications?.length || 0
        })
        console.log(`Cleaned ${oldNotifications?.length || 0} old read notifications`)
      } else {
        console.error('Error cleaning notifications:', notificationError)
        results.errors++
      }
    } catch (error) {
      console.error('Error in notifications cleanup:', error)
      results.errors++
    }

    // 8. Clean up old collaboration sessions (inactive for more than 24 hours)
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: oldSessions, error: sessionError } = await supabaseClient
        .from('collaboration_sessions')
        .delete()
        .lt('last_activity', twentyFourHoursAgo.toISOString())
        .eq('is_active', false)
        .select()

      if (!sessionError) {
        results.cleaned += oldSessions?.length || 0
        results.details.push({
          operation: 'old_collaboration_sessions',
          count: oldSessions?.length || 0
        })
        console.log(`Cleaned ${oldSessions?.length || 0} old collaboration sessions`)
      } else {
        console.error('Error cleaning collaboration sessions:', sessionError)
        results.errors++
      }
    } catch (error) {
      console.error('Error in collaboration sessions cleanup:', error)
      results.errors++
    }

    // 9. Clean up orphaned storage file references
    try {
      // Find storage files that reference non-existent invoices/expenses
      const { data: orphanedFiles, error: orphanedError } = await supabaseClient
        .from('storage_files')
        .select('id, name, path, bucket')
        .not('path', 'like', '%invoices%')
        .not('path', 'like', '%expenses%')
        .not('path', 'like', '%receipts%')
        .not('path', 'like', '%business-logos%')
        .not('path', 'like', '%user-avatars%')

      if (!orphanedError && orphanedFiles && orphanedFiles.length > 0) {
        // Mark as orphaned instead of deleting (for safety)
        const { error: markError } = await supabaseClient
          .from('storage_files')
          .update({ 
            metadata: { status: 'orphaned', cleaned_at: new Date().toISOString() }
          })
          .in('id', orphanedFiles.map(file => file.id))

        if (!markError) {
          results.cleaned += orphanedFiles.length
          results.details.push({
            operation: 'orphaned_storage_files',
            count: orphanedFiles.length
          })
          console.log(`Marked ${orphanedFiles.length} orphaned storage files`)
        } else {
          console.error('Error marking orphaned files:', markError)
          results.errors++
        }
      }
    } catch (error) {
      console.error('Error in orphaned files cleanup:', error)
      results.errors++
    }

    results.processed = results.cleaned + results.archived

    // Log cleanup activity
    try {
      await supabaseClient
        .from('activity_log')
        .insert({
          user_id: null, // System action
          tenant_id: null, // System action
          action: 'data_cleanup_completed',
          resource_type: 'system',
          resource_id: null,
          details: {
            total_processed: results.processed,
            cleaned: results.cleaned,
            archived: results.archived,
            errors: results.errors,
            operations: results.details
          }
        })
    } catch (logError) {
      console.error('Error logging cleanup activity:', logError)
    }

    // Send summary to admin if there were significant changes
    if (results.processed > 0) {
      try {
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
              type: 'data_cleanup_summary',
              data: {
                businessName: 'Ardent Invoicing',
                clientName: adminUsers[0].email,
                summary: `Weekly data cleanup completed`,
                details: {
                  total_processed: results.processed,
                  cleaned: results.cleaned,
                  archived: results.archived,
                  errors: results.errors,
                  operations: results.details
                }
              }
            })
          })
        }
      } catch (emailError) {
        console.error('Error sending cleanup summary:', emailError)
      }
    }

    console.log('Data cleanup process completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Data cleanup completed. Processed: ${results.processed}, Cleaned: ${results.cleaned}, Archived: ${results.archived}`,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in data cleanup:', error)
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
