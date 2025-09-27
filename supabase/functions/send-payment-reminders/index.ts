import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OverdueInvoice {
  id: string
  invoice_number: string
  client_name: string
  client_email: string | null
  amount: number
  currency: string
  due_date: string
  reminder_count: number
  last_reminder_sent: string | null
  tenants?: {
    business_name: string
  }
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

    console.log('Starting payment reminder processing...')

    const today = new Date()
    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    }

    // Get overdue invoices with different reminder strategies
    const reminderStrategies = [
      {
        name: '1_day_overdue',
        daysOverdue: 1,
        maxReminders: 1,
        template: 'payment_reminder_1'
      },
      {
        name: '7_days_overdue',
        daysOverdue: 7,
        maxReminders: 2,
        template: 'payment_reminder_7'
      },
      {
        name: '14_days_overdue',
        daysOverdue: 14,
        maxReminders: 3,
        template: 'payment_reminder_14'
      },
      {
        name: '30_days_overdue',
        daysOverdue: 30,
        maxReminders: 5,
        template: 'payment_reminder_30'
      }
    ]

    for (const strategy of reminderStrategies) {
      const cutoffDate = new Date(today)
      cutoffDate.setDate(cutoffDate.getDate() - strategy.daysOverdue)
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

      // Get overdue invoices for this strategy
      const { data: overdueInvoices, error: fetchError } = await supabaseClient
        .from('invoices')
        .select(`
          *,
          tenants (
            business_name
          )
        `)
        .eq('status', 'sent')
        .lte('due_date', cutoffDateStr)
        .lt('reminder_count', strategy.maxReminders)

      if (fetchError) {
        console.error(`Error fetching ${strategy.name} invoices:`, fetchError)
        continue
      }

      console.log(`Found ${overdueInvoices?.length || 0} invoices for ${strategy.name}`)

      // Process each overdue invoice
      for (const invoice of overdueInvoices || []) {
        try {
          results.processed++

          // Skip if no client email
          if (!invoice.client_email) {
            console.log(`Skipping invoice ${invoice.invoice_number} - no client email`)
            results.skipped++
            continue
          }

          // Check if reminder was already sent recently (within 24 hours)
          if (invoice.last_reminder_sent) {
            const lastReminderDate = new Date(invoice.last_reminder_sent)
            const hoursSinceLastReminder = (today.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60)
            
            if (hoursSinceLastReminder < 24) {
              console.log(`Skipping invoice ${invoice.invoice_number} - reminder sent recently`)
              results.skipped++
              continue
            }
          }

          // Calculate days overdue
          const dueDate = new Date(invoice.due_date)
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

          // Send reminder email
          const emailData = {
            type: 'invoice_reminder',
            data: {
              businessName: invoice.tenants?.business_name || 'Ardent Invoicing',
              clientName: invoice.client_email,
              invoiceNumber: invoice.invoice_number,
              amount: invoice.amount.toString(),
              currency: invoice.currency,
              dueDate: invoice.due_date,
              daysOverdue: daysOverdue,
              reminderCount: invoice.reminder_count + 1,
              template: strategy.template
            }
          }

          // Send email via API route
          try {
            const emailResponse = await fetch(`${Deno.env.get('NEXT_PUBLIC_APP_URL')}/api/email/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify(emailData)
            })

            if (!emailResponse.ok) {
              throw new Error(`Email API returned ${emailResponse.status}`)
            }

            // Update invoice reminder count and timestamp
            const { error: updateError } = await supabaseClient
              .from('invoices')
              .update({
                reminder_count: invoice.reminder_count + 1,
                last_reminder_sent: today.toISOString(),
                updated_at: today.toISOString()
              })
              .eq('id', invoice.id)

            if (updateError) {
              console.error('Error updating reminder count:', updateError)
              // Continue processing even if update fails
            }

            results.sent++
            results.details.push({
              invoice_id: invoice.id,
              invoice_number: invoice.invoice_number,
              client_email: invoice.client_email,
              days_overdue: daysOverdue,
              reminder_count: invoice.reminder_count + 1,
              template: strategy.template
            })

            console.log(`Sent reminder for invoice ${invoice.invoice_number} (${daysOverdue} days overdue)`)

            // Log activity
            try {
              await supabaseClient
                .from('activity_log')
                .insert({
                  user_id: null, // System action
                  tenant_id: invoice.tenant_id,
                  action: 'payment_reminder_sent',
                  resource_type: 'invoice',
                  resource_id: invoice.id,
                  details: {
                    invoice_number: invoice.invoice_number,
                    client_email: invoice.client_email,
                    days_overdue: daysOverdue,
                    reminder_count: invoice.reminder_count + 1,
                    template: strategy.template
                  }
                })
            } catch (logError) {
              console.error('Error logging activity:', logError)
            }

            // Mark as overdue if not already
            if (invoice.status === 'sent' && daysOverdue > 0) {
              const { error: statusError } = await supabaseClient
                .from('invoices')
                .update({ status: 'overdue' })
                .eq('id', invoice.id)

              if (statusError) {
                console.error('Error updating invoice status to overdue:', statusError)
              }
            }

          } catch (emailError) {
            console.error(`Error sending email for invoice ${invoice.invoice_number}:`, emailError)
            results.errors++
            results.details.push({
              invoice_id: invoice.id,
              invoice_number: invoice.invoice_number,
              error: emailError.message
            })
          }

        } catch (error) {
          console.error(`Error processing invoice ${invoice.id}:`, error)
          results.errors++
          results.details.push({
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            error: error.message
          })
        }
      }
    }

    // Send summary notification to admin
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
            type: 'admin_summary',
            data: {
              businessName: 'Ardent Invoicing',
              clientName: adminUsers[0].email,
              summary: `Payment reminder processing completed`,
              details: {
                processed: results.processed,
                sent: results.sent,
                skipped: results.skipped,
                errors: results.errors
              }
            }
          })
        })
      }
    } catch (adminEmailError) {
      console.error('Error sending admin summary:', adminEmailError)
    }

    console.log('Payment reminder processing completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} overdue invoices`,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
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
