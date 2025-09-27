import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecurringInvoice {
  id: string
  invoice_id: string
  tenant_id: string
  frequency: 'monthly' | 'quarterly' | 'yearly'
  next_run: string
  is_active: boolean
  invoices?: {
    id: string
    invoice_number: string
    client_name: string
    client_email: string | null
    amount: number
    currency: string
    due_date: string
    line_items: any[]
    tax_rate: number
    discount_amount: number
    notes?: string
  }
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

    console.log('Starting recurring invoice processing...')

    // Get all active recurring invoices that are due to run
    const today = new Date().toISOString().split('T')[0]
    
    const { data: recurringInvoices, error: fetchError } = await supabaseClient
      .from('recurring_invoices')
      .select(`
        *,
        invoices (
          id,
          invoice_number,
          client_name,
          client_email,
          amount,
          currency,
          due_date,
          invoice_line_items,
          tax_rate,
          discount_amount,
          notes
        ),
        tenants (
          business_name
        )
      `)
      .eq('is_active', true)
      .lte('next_run', today)

    if (fetchError) {
      console.error('Error fetching recurring invoices:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recurring invoices' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${recurringInvoices?.length || 0} recurring invoices to process`)

    const results = {
      processed: 0,
      created: 0,
      errors: 0,
      details: [] as any[]
    }

    // Process each recurring invoice
    for (const recurringInvoice of recurringInvoices || []) {
      try {
        results.processed++
        
        const originalInvoice = recurringInvoice.invoices
        if (!originalInvoice) {
          console.error(`No original invoice found for recurring invoice ${recurringInvoice.id}`)
          results.errors++
          continue
        }

        // Calculate next invoice number
        const { data: lastInvoice, error: lastInvoiceError } = await supabaseClient
          .from('invoices')
          .select('invoice_number')
          .eq('tenant_id', recurringInvoice.tenant_id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (lastInvoiceError) {
          console.error('Error fetching last invoice:', lastInvoiceError)
          results.errors++
          continue
        }

        const lastInvoiceNumber = lastInvoice?.[0]?.invoice_number || '0'
        const nextInvoiceNumber = (parseInt(lastInvoiceNumber.split('-').pop() || '0') + 1).toString().padStart(4, '0')
        const newInvoiceNumber = `INV-${new Date().getFullYear()}-${nextInvoiceNumber}`

        // Calculate new due date based on frequency
        const originalDueDate = new Date(originalInvoice.due_date)
        let newDueDate = new Date(originalDueDate)
        
        switch (recurringInvoice.frequency) {
          case 'monthly':
            newDueDate.setMonth(newDueDate.getMonth() + 1)
            break
          case 'quarterly':
            newDueDate.setMonth(newDueDate.getMonth() + 3)
            break
          case 'yearly':
            newDueDate.setFullYear(newDueDate.getFullYear() + 1)
            break
        }

        // Create new invoice
        const { data: newInvoice, error: createError } = await supabaseClient
          .from('invoices')
          .insert({
            tenant_id: recurringInvoice.tenant_id,
            invoice_number: newInvoiceNumber,
            client_name: originalInvoice.client_name,
            client_email: originalInvoice.client_email,
            amount: originalInvoice.amount,
            currency: originalInvoice.currency,
            status: 'draft',
            due_date: newDueDate.toISOString().split('T')[0],
            tax_rate: originalInvoice.tax_rate,
            discount_amount: originalInvoice.discount_amount,
            notes: originalInvoice.notes,
            is_recurring: true,
            parent_invoice_id: originalInvoice.id,
            reminder_count: 0
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating new invoice:', createError)
          results.errors++
          continue
        }

        // Copy line items to new invoice
        if (originalInvoice.invoice_line_items && originalInvoice.invoice_line_items.length > 0) {
          const { error: lineItemsError } = await supabaseClient
            .from('invoice_line_items')
            .insert(
              originalInvoice.invoice_line_items.map((item: any) => ({
                invoice_id: newInvoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_amount: item.total_amount
              }))
            )

          if (lineItemsError) {
            console.error('Error creating line items:', lineItemsError)
            // Continue processing even if line items fail
          }
        }

        // Update recurring invoice next run date
        const { error: updateError } = await supabaseClient
          .from('recurring_invoices')
          .update({ 
            next_run: newDueDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', recurringInvoice.id)

        if (updateError) {
          console.error('Error updating recurring invoice:', updateError)
          // Continue processing even if update fails
        }

        results.created++
        results.details.push({
          recurring_invoice_id: recurringInvoice.id,
          new_invoice_id: newInvoice.id,
          invoice_number: newInvoiceNumber,
          amount: originalInvoice.amount,
          currency: originalInvoice.currency,
          due_date: newDueDate.toISOString().split('T')[0]
        })

        console.log(`Created new invoice ${newInvoiceNumber} for tenant ${recurringInvoice.tenant_id}`)

        // Send notification email (optional)
        try {
          const { error: emailError } = await supabaseClient.functions.invoke('send-notification', {
            body: {
              type: 'recurring_invoice_created',
              data: {
                tenant_id: recurringInvoice.tenant_id,
                invoice_id: newInvoice.id,
                invoice_number: newInvoiceNumber,
                amount: originalInvoice.amount,
                currency: originalInvoice.currency,
                business_name: recurringInvoice.tenants?.business_name
              }
            }
          })

          if (emailError) {
            console.error('Error sending notification:', emailError)
          }
        } catch (emailError) {
          console.error('Error invoking notification function:', emailError)
        }

      } catch (error) {
        console.error(`Error processing recurring invoice ${recurringInvoice.id}:`, error)
        results.errors++
        results.details.push({
          recurring_invoice_id: recurringInvoice.id,
          error: error.message
        })
      }
    }

    console.log('Recurring invoice processing completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} recurring invoices`,
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
