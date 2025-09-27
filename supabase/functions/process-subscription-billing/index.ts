import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Subscription {
  id: string
  user_id: string
  plan_id: 'starter' | 'pro' | 'enterprise'
  interval: 'monthly' | 'quarterly' | 'yearly'
  amount: number
  currency: string
  status: 'active' | 'past_due' | 'cancelled'
  next_billing_date: string
  paystack_subscription_id?: string
  paystack_customer_id?: string
  users?: {
    email: string
    subscription_tier: string
    invoice_quota_used: number
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

    console.log('Starting subscription billing processing...')

    const today = new Date().toISOString().split('T')[0]
    const results = {
      processed: 0,
      billed: 0,
      quota_reset: 0,
      errors: 0,
      details: [] as any[]
    }

    // Get active subscriptions that are due for billing
    const { data: dueSubscriptions, error: fetchError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        users (
          email,
          subscription_tier,
          invoice_quota_used
        ),
        tenants (
          business_name
        )
      `)
      .eq('status', 'active')
      .lte('next_billing_date', today)

    if (fetchError) {
      console.error('Error fetching due subscriptions:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch due subscriptions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${dueSubscriptions?.length || 0} subscriptions due for billing`)

    // Process each due subscription
    for (const subscription of dueSubscriptions || []) {
      try {
        results.processed++

        const user = subscription.users
        const tenant = subscription.tenants

        if (!user) {
          console.error(`No user found for subscription ${subscription.id}`)
          results.errors++
          continue
        }

        console.log(`Processing subscription ${subscription.id} for user ${user.email}`)

        // Reset invoice quota for new billing period
        const { error: quotaResetError } = await supabaseClient
          .from('users')
          .update({
            invoice_quota_used: 0,
            last_billing_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.user_id)

        if (quotaResetError) {
          console.error('Error resetting invoice quota:', quotaResetError)
          results.errors++
          continue
        }

        results.quota_reset++
        console.log(`Reset invoice quota for user ${user.email}`)

        // Calculate next billing date based on interval
        const currentBillingDate = new Date(subscription.next_billing_date)
        let nextBillingDate = new Date(currentBillingDate)

        switch (subscription.interval) {
          case 'monthly':
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
            break
          case 'quarterly':
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 3)
            break
          case 'yearly':
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
            break
        }

        // Update subscription with next billing date
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            next_billing_date: nextBillingDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          results.errors++
          continue
        }

        // Handle Paystack billing if subscription exists
        if (subscription.paystack_subscription_id) {
          try {
            // Check Paystack subscription status
            const paystackResponse = await fetch(
              `https://api.paystack.co/subscription/${subscription.paystack_subscription_id}`,
              {
                headers: {
                  'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
                  'Content-Type': 'application/json'
                }
              }
            )

            if (paystackResponse.ok) {
              const paystackData = await paystackResponse.json()
              const paystackSubscription = paystackData.data

              // Update subscription status based on Paystack
              if (paystackSubscription.status === 'active') {
                await supabaseClient
                  .from('subscriptions')
                  .update({ status: 'active' })
                  .eq('id', subscription.id)
              } else if (paystackSubscription.status === 'past_due') {
                await supabaseClient
                  .from('subscriptions')
                  .update({ status: 'past_due' })
                  .eq('id', subscription.id)

                // Send past due notification
                await fetch(`${Deno.env.get('NEXT_PUBLIC_APP_URL')}/api/email/send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                  },
                  body: JSON.stringify({
                    type: 'subscription_past_due',
                    data: {
                      businessName: tenant?.business_name || 'Ardent Invoicing',
                      clientName: user.email,
                      planName: subscription.plan_id,
                      amount: subscription.amount,
                      currency: subscription.currency,
                      nextBillingDate: nextBillingDate.toISOString().split('T')[0]
                    }
                  })
                })
              } else if (paystackSubscription.status === 'cancelled') {
                await supabaseClient
                  .from('subscriptions')
                  .update({ status: 'cancelled' })
                  .eq('id', subscription.id)

                // Downgrade user to free plan
                await supabaseClient
                  .from('users')
                  .update({ subscription_tier: 'free' })
                  .eq('id', subscription.user_id)

                // Send cancellation notification
                await fetch(`${Deno.env.get('NEXT_PUBLIC_APP_URL')}/api/email/send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                  },
                  body: JSON.stringify({
                    type: 'subscription_cancelled',
                    data: {
                      businessName: tenant?.business_name || 'Ardent Invoicing',
                      clientName: user.email,
                      planName: subscription.plan_id
                    }
                  })
                })
              }

              results.billed++
            } else {
              console.error(`Paystack API error: ${paystackResponse.status}`)
              results.errors++
            }
          } catch (paystackError) {
            console.error('Error checking Paystack subscription:', paystackError)
            results.errors++
          }
        } else {
          // Free plan or manual subscription - just reset quota
          results.billed++
        }

        // Send billing confirmation email
        try {
          await fetch(`${Deno.env.get('NEXT_PUBLIC_APP_URL')}/api/email/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              type: 'subscription_billing_confirmation',
              data: {
                businessName: tenant?.business_name || 'Ardent Invoicing',
                clientName: user.email,
                planName: subscription.plan_id,
                amount: subscription.amount,
                currency: subscription.currency,
                interval: subscription.interval,
                nextBillingDate: nextBillingDate.toISOString().split('T')[0],
                features: getPlanFeatures(subscription.plan_id)
              }
            })
          })
        } catch (emailError) {
          console.error('Error sending billing confirmation:', emailError)
        }

        results.details.push({
          subscription_id: subscription.id,
          user_email: user.email,
          plan_id: subscription.plan_id,
          amount: subscription.amount,
          currency: subscription.currency,
          next_billing_date: nextBillingDate.toISOString().split('T')[0],
          quota_reset: true
        })

        // Log activity
        try {
          await supabaseClient
            .from('activity_log')
            .insert({
              user_id: subscription.user_id,
              tenant_id: subscription.user_id, // Assuming tenant_id matches user_id for billing
              action: 'subscription_billing_processed',
              resource_type: 'subscription',
              resource_id: subscription.id,
              details: {
                plan_id: subscription.plan_id,
                amount: subscription.amount,
                currency: subscription.currency,
                interval: subscription.interval,
                next_billing_date: nextBillingDate.toISOString().split('T')[0]
              }
            })
        } catch (logError) {
          console.error('Error logging activity:', logError)
        }

      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error)
        results.errors++
        results.details.push({
          subscription_id: subscription.id,
          error: error.message
        })
      }
    }

    // Handle expired subscriptions (past due for more than 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    const { data: expiredSubscriptions } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        users (email, subscription_tier),
        tenants (business_name)
      `)
      .eq('status', 'past_due')
      .lte('next_billing_date', sevenDaysAgoStr)

    for (const expiredSubscription of expiredSubscriptions || []) {
      try {
        // Cancel expired subscription
        await supabaseClient
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', expiredSubscription.id)

        // Downgrade user to free plan
        await supabaseClient
          .from('users')
          .update({ subscription_tier: 'free' })
          .eq('id', expiredSubscription.user_id)

        // Send expiration notification
        await fetch(`${Deno.env.get('NEXT_PUBLIC_APP_URL')}/api/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            type: 'subscription_expired',
            data: {
              businessName: expiredSubscription.tenants?.business_name || 'Ardent Invoicing',
              clientName: expiredSubscription.users?.email,
              planName: expiredSubscription.plan_id
            }
          })
        })

        console.log(`Expired subscription ${expiredSubscription.id} for user ${expiredSubscription.users?.email}`)
      } catch (error) {
        console.error(`Error handling expired subscription ${expiredSubscription.id}:`, error)
      }
    }

    console.log('Subscription billing processing completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} subscriptions`,
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

// Helper function to get plan features
function getPlanFeatures(planId: string): string[] {
  const features = {
    free: ['2 invoices per month', 'Basic expense tracking', 'GHS currency support'],
    starter: ['20 invoices per month', 'Advanced expense tracking', 'Multi-currency support', 'VAT calculations'],
    pro: ['400 invoices per month', 'Advanced analytics', 'Custom branding', 'API access', 'Team collaboration (up to 5 users)'],
    enterprise: ['Unlimited invoices', 'Full API access', 'White-label options', 'Dedicated support', 'Unlimited team members']
  }
  
  return features[planId] || features.free
}
