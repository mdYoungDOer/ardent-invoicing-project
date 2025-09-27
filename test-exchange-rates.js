// Simple test script for Exchange Rate functionality
// Run with: node test-exchange-rates.js

const fetch = require('node-fetch');

const EXCHANGE_RATE_API_BASE = 'https://api.exchangerate-api.com/v4';
const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;

async function testExchangeRateAPI() {
  console.log('🔄 Testing Exchange Rate API...\n');

  // Test 1: Check if API key is available
  console.log('1. API Key Check:');
  if (API_KEY) {
    console.log('   ✅ API Key found:', API_KEY.substring(0, 8) + '...');
  } else {
    console.log('   ⚠️  API Key not found - using free tier');
  }

  // Test 2: Test basic API connectivity
  console.log('\n2. Basic API Connectivity:');
  try {
    const apiUrl = API_KEY 
      ? `${EXCHANGE_RATE_API_BASE}/latest/USD?access_key=${API_KEY}`
      : `${EXCHANGE_RATE_API_BASE}/latest/USD`;
    
    console.log('   🔗 Testing URL:', apiUrl.replace(API_KEY || '', '***'));
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('   ✅ API Response successful');
    console.log('   📊 Base currency:', data.base);
    console.log('   📅 Date:', data.date);
    console.log('   💱 Available rates:', Object.keys(data.rates).length);

  } catch (error) {
    console.log('   ❌ API Error:', error.message);
    return false;
  }

  // Test 3: Test specific currency conversions
  console.log('\n3. Currency Conversion Tests:');
  const testCurrencies = ['GHS', 'USD', 'GBP', 'EUR'];
  
  for (const currency of testCurrencies) {
    try {
      const apiUrl = API_KEY 
        ? `${EXCHANGE_RATE_API_BASE}/latest/${currency}?access_key=${API_KEY}`
        : `${EXCHANGE_RATE_API_BASE}/latest/${currency}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.rates) {
        console.log(`   ✅ ${currency} rates available`);
        
        // Show some sample conversions
        const sampleRates = Object.entries(data.rates)
          .filter(([key]) => ['GHS', 'USD', 'GBP', 'EUR'].includes(key))
          .slice(0, 2);
        
        sampleRates.forEach(([toCurrency, rate]) => {
          console.log(`      💱 1 ${currency} = ${rate.toFixed(4)} ${toCurrency}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ ${currency} error:`, error.message);
    }
  }

  // Test 4: Test rate limits and caching
  console.log('\n4. Performance Test (Multiple Requests):');
  const startTime = Date.now();
  
  try {
    const promises = Array(5).fill().map(async (_, i) => {
      const apiUrl = API_KEY 
        ? `${EXCHANGE_RATE_API_BASE}/latest/USD?access_key=${API_KEY}`
        : `${EXCHANGE_RATE_API_BASE}/latest/USD`;
      
      const response = await fetch(apiUrl);
      return response.json();
    });

    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`   ✅ 5 concurrent requests completed in ${endTime - startTime}ms`);
    
  } catch (error) {
    console.log('   ❌ Performance test failed:', error.message);
  }

  console.log('\n🎉 Exchange Rate API Test Complete!');
  return true;
}

// Run the test
testExchangeRateAPI().catch(console.error);
