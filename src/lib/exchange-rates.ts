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

export interface ExchangeRateError {
  code: string;
  message: string;
  timestamp: string;
}

// Cache for exchange rates (in-memory, expires after 1 hour)
const rateCache = new Map<string, { data: ExchangeRateResult; expires: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Get API key from environment
const getApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || null;
  } else {
    // Server-side
    return process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || null;
  }
};

// Build API URL with or without API key
const buildApiUrl = (fromCurrency: string): string => {
  const apiKey = getApiKey();
  
  if (apiKey) {
    // Use API key for authenticated requests (higher rate limits)
    return `${EXCHANGE_RATE_API_BASE}/latest/${fromCurrency}?access_key=${apiKey}`;
  } else {
    // Use free tier (limited requests)
    return `${EXCHANGE_RATE_API_BASE}/latest/${fromCurrency}`;
  }
};

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
    const apiUrl = buildApiUrl(fromCurrency);
    const apiKey = getApiKey();
    
    console.log(`Fetching exchange rate: ${fromCurrency} to ${toCurrency}${apiKey ? ' (with API key)' : ' (free tier)'}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ArdentInvoicing/1.0',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Exchange rate API error: ${response.status} - ${errorText}`);
      throw new Error(`Exchange rate API error: ${response.status} - ${response.statusText}`);
    }

    const data: ExchangeRateResponse = await response.json();
    
    // Validate response structure
    if (!data.rates || typeof data.rates !== 'object') {
      throw new Error('Invalid exchange rate response format');
    }
    
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

    console.log(`Exchange rate cached: ${fromCurrency} to ${toCurrency} = ${rate}`);
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

export function formatCurrency(amount: number, currency: string = 'GHS', locale: string = 'en-GH'): string {
  // Ensure currency is valid, default to GHS if not
  const validCurrency = currency && currency.length === 3 ? currency : 'GHS';
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback to simple formatting if currency is not supported
    console.warn(`Currency ${validCurrency} not supported, using fallback formatting`);
    return `${getCurrencySymbol(validCurrency)}${amount.toFixed(2)}`;
  }
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

// Utility function to convert amount between currencies
export async function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<number> {
  const rateData = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rateData.rate;
}

// Test exchange rate API connectivity
export async function testExchangeRateAPI(): Promise<{
  success: boolean;
  apiKeyPresent: boolean;
  testRate?: ExchangeRateResult;
  error?: string;
}> {
  try {
    const apiKey = getApiKey();
    const testRate = await getExchangeRate('USD', 'GHS');
    
    return {
      success: true,
      apiKeyPresent: !!apiKey,
      testRate,
    };
  } catch (error) {
    return {
      success: false,
      apiKeyPresent: !!getApiKey(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get available currencies
export function getSupportedCurrencies(): string[] {
  return ['GHS', 'USD', 'GBP', 'EUR', 'CAD', 'AUD'];
}

// Validate currency code
export function isValidCurrency(currency: string): boolean {
  return getSupportedCurrencies().includes(currency.toUpperCase());
}

// Clear exchange rate cache
export function clearExchangeRateCache(): void {
  rateCache.clear();
  console.log('Exchange rate cache cleared');
}

// Get cache statistics
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; expires: number; isExpired: boolean }>;
} {
  const entries = Array.from(rateCache.entries()).map(([key, value]) => ({
    key,
    expires: value.expires,
    isExpired: Date.now() > value.expires,
  }));

  return {
    size: rateCache.size,
    entries,
  };
}
