import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EXCHANGE_RATE_API_BASE = 'https://api.exchangerate-api.com/v4'

interface ExchangeRateResult {
  from: string
  to: string
  rate: number
  timestamp: string
}

interface ExchangeRateResponse {
  base: string
  date: string
  rates: { [key: string]: number }
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

    console.log('Starting exchange rate update...')

    const results = {
      processed: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    }

    // Get supported currencies
    const supportedCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'GHS']
    const baseCurrency = 'GHS' // Base currency for Ghana

    // Update exchange rates for each currency
    for (const currency of supportedCurrencies) {
      if (currency === baseCurrency) continue // Skip base currency

      try {
        results.processed++

        const exchangeRate = await fetchExchangeRate(baseCurrency, currency)
        
        if (exchangeRate) {
          // Store in analytics cache for quick access
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 1) // Expire after 1 hour

          const analyticsRecord = {
            tenant_id: null, // Global exchange rates
            metric_type: 'exchange_rate',
            period: 'realtime',
            data: {
              from: exchangeRate.from,
              to: exchangeRate.to,
              rate: exchangeRate.rate,
              timestamp: exchangeRate.timestamp,
              currency_pair: `${exchangeRate.from}_${exchangeRate.to}`
            },
            calculated_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
          }

          const { error: upsertError } = await supabaseClient
            .from('analytics_cache')
            .upsert(analyticsRecord, {
              onConflict: 'tenant_id,metric_type,period,calculated_at'
            })

          if (!upsertError) {
            results.updated++
            results.details.push({
              currency_pair: `${exchangeRate.from}_${exchangeRate.to}`,
              rate: exchangeRate.rate,
              timestamp: exchangeRate.timestamp
            })
            console.log(`Updated exchange rate: ${exchangeRate.from} to ${exchangeRate.to} = ${exchangeRate.rate}`)
          } else {
            console.error('Error storing exchange rate:', upsertError)
            results.errors++
          }
        } else {
          results.errors++
          results.details.push({
            currency_pair: `${baseCurrency}_${currency}`,
            error: 'Failed to fetch exchange rate'
          })
        }

      } catch (error) {
        console.error(`Error updating exchange rate for ${currency}:`, error)
        results.errors++
        results.details.push({
          currency_pair: `${baseCurrency}_${currency}`,
          error: error.message
        })
      }
    }

    // Update reverse exchange rates (from other currencies to GHS)
    for (const currency of supportedCurrencies) {
      if (currency === baseCurrency) continue

      try {
        results.processed++

        const exchangeRate = await fetchExchangeRate(currency, baseCurrency)
        
        if (exchangeRate) {
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 1)

          const analyticsRecord = {
            tenant_id: null,
            metric_type: 'exchange_rate',
            period: 'realtime',
            data: {
              from: exchangeRate.from,
              to: exchangeRate.to,
              rate: exchangeRate.rate,
              timestamp: exchangeRate.timestamp,
              currency_pair: `${exchangeRate.from}_${exchangeRate.to}`
            },
            calculated_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
          }

          const { error: upsertError } = await supabaseClient
            .from('analytics_cache')
            .upsert(analyticsRecord, {
              onConflict: 'tenant_id,metric_type,period,calculated_at'
            })

          if (!upsertError) {
            results.updated++
            results.details.push({
              currency_pair: `${exchangeRate.from}_${exchangeRate.to}`,
              rate: exchangeRate.rate,
              timestamp: exchangeRate.timestamp
            })
            console.log(`Updated exchange rate: ${exchangeRate.from} to ${exchangeRate.to} = ${exchangeRate.rate}`)
          } else {
            results.errors++
          }
        } else {
          results.errors++
        }

      } catch (error) {
        console.error(`Error updating reverse exchange rate for ${currency}:`, error)
        results.errors++
      }
    }

    // Clean up old exchange rate cache (older than 24 hours)
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: oldRates, error: cleanupError } = await supabaseClient
        .from('analytics_cache')
        .delete()
        .eq('metric_type', 'exchange_rate')
        .lt('calculated_at', twentyFourHoursAgo.toISOString())
        .select()

      if (!cleanupError) {
        console.log(`Cleaned up ${oldRates?.length || 0} old exchange rate entries`)
      }
    } catch (cleanupError) {
      console.error('Error cleaning up old exchange rates:', cleanupError)
    }

    // Log exchange rate update activity
    try {
      await supabaseClient
        .from('activity_log')
        .insert({
          user_id: null, // System action
          tenant_id: null, // System action
          action: 'exchange_rates_updated',
          resource_type: 'system',
          resource_id: null,
          details: {
            total_processed: results.processed,
            updated: results.updated,
            errors: results.errors,
            currency_pairs: results.details.filter(d => d.currency_pair).map(d => d.currency_pair)
          }
        })
    } catch (logError) {
      console.error('Error logging exchange rate activity:', logError)
    }

    // Send alert if there were significant errors
    if (results.errors > results.processed * 0.5) { // More than 50% errors
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
              type: 'exchange_rate_alert',
              data: {
                businessName: 'Ardent Invoicing',
                clientName: adminUsers[0].email,
                summary: `Exchange rate update had ${results.errors} errors`,
                details: {
                  total_processed: results.processed,
                  updated: results.updated,
                  errors: results.errors,
                  error_rate: Math.round((results.errors / results.processed) * 100)
                }
              }
            })
          })
        }
      } catch (emailError) {
        console.error('Error sending exchange rate alert:', emailError)
      }
    }

    console.log('Exchange rate update completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Exchange rate update completed. Updated: ${results.updated}/${results.processed}`,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in exchange rate update:', error)
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

async function fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateResult | null> {
  try {
    const apiKey = Deno.env.get('NEXT_PUBLIC_EXCHANGE_RATE_API_KEY')
    const apiUrl = apiKey ? 
      `${EXCHANGE_RATE_API_BASE}/latest/${fromCurrency}?access_key=${apiKey}` :
      `${EXCHANGE_RATE_API_BASE}/latest/${fromCurrency}`

    console.log(`Fetching exchange rate: ${fromCurrency} to ${toCurrency}${apiKey ? ' (with API key)' : ' (free tier)'}`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ArdentInvoicing/1.0',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Exchange rate API error: ${response.status} - ${errorText}`)
      throw new Error(`Exchange rate API error: ${response.status} - ${response.statusText}`)
    }

    const data: ExchangeRateResponse = await response.json()
    
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid exchange rate response format')
    }

    const rate = data.rates[toCurrency]
    if (typeof rate !== 'number') {
      throw new Error(`Exchange rate not found for ${toCurrency}`)
    }

    return {
      from: fromCurrency,
      to: toCurrency,
      rate: rate,
      timestamp: data.date
    }

  } catch (error) {
    console.error(`Error fetching exchange rate ${fromCurrency} to ${toCurrency}:`, error)
    
    // Return fallback rate of 1 for same currency or if API fails
    if (fromCurrency === toCurrency) {
      return {
        from: fromCurrency,
        to: toCurrency,
        rate: 1,
        timestamp: new Date().toISOString()
      }
    }
    
    return null
  }
}
