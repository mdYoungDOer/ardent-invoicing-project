const EXCHANGE_RATE_API_BASE = 'https://api.exchangerate-api.com/v4';

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ExchangeRateResult {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

// Cache for exchange rates (in-memory, expires after 1 hour)
const rateCache = new Map<string, { data: ExchangeRateResult; expires: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateResult> {
  // If same currency, return rate of 1
  if (fromCurrency === toCurrency) {
    return {
      from: fromCurrency,
      to: toCurrency,
      rate: 1,
      timestamp: new Date().toISOString(),
    };
  }

  const cacheKey = `${fromCurrency}-${toCurrency}`;
  const cached = rateCache.get(cacheKey);
  
  // Return cached rate if still valid
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const response = await fetch(`${EXCHANGE_RATE_API_BASE}/latest/${fromCurrency}`);
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data: ExchangeRateResponse = await response.json();
    const rate = data.rates[toCurrency];

    if (typeof rate !== 'number') {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    const result: ExchangeRateResult = {
      from: fromCurrency,
      to: toCurrency,
      rate,
      timestamp: data.date,
    };

    // Cache the result
    rateCache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_DURATION,
    });

    return result;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Fallback to cached rate if available (even if expired)
    if (cached) {
      console.warn('Using expired cached exchange rate');
      return cached.data;
    }
    
    // Final fallback - return rate of 1 (no conversion)
    console.warn('Using fallback exchange rate of 1');
    return {
      from: fromCurrency,
      to: toCurrency,
      rate: 1,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getMultipleExchangeRates(
  fromCurrency: string, 
  targetCurrencies: string[]
): Promise<Record<string, ExchangeRateResult>> {
  const results: Record<string, ExchangeRateResult> = {};
  
  // Fetch all rates in parallel
  const promises = targetCurrencies.map(async (toCurrency) => {
    const rate = await getExchangeRate(fromCurrency, toCurrency);
    return { currency: toCurrency, rate };
  });

  const rateResults = await Promise.all(promises);
  
  rateResults.forEach(({ currency, rate }) => {
    results[currency] = rate;
  });

  return results;
}

export function formatCurrency(amount: number, currency: string, locale: string = 'en-GH'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    GHS: '₵',
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: 'C$',
    AUD: 'A$',
  };

  return symbols[currency] || currency;
}

export function getCurrencyFlag(currency: string): string {
  const flags: Record<string, string> = {
    GHS: '🇬🇭',
    USD: '🇺🇸',
    GBP: '🇬🇧',
    EUR: '🇪🇺',
    CAD: '🇨🇦',
    AUD: '🇦🇺',
  };

  return flags[currency] || '🌍';
}
