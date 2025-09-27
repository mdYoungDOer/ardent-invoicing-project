#!/usr/bin/env node

/**
 * Test Script for Supabase Edge Functions
 * Run this script to test all Edge Functions locally or remotely
 */

const https = require('https');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const FUNCTIONS = [
  'process-recurring-invoices',
  'send-payment-reminders', 
  'process-subscription-billing',
  'monitor-system-health',
  'cleanup-old-data',
  'generate-analytics',
  'update-exchange-rates',
  'manage-backups'
];

/**
 * Test a single Edge Function
 */
async function testFunction(functionName) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
    
    console.log(`🧪 Testing ${functionName}...`);
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${functionName}: ${response.message || 'Success'}`);
          resolve({ function: functionName, status: 'success', response });
        } catch (error) {
          console.log(`❌ ${functionName}: Failed to parse response`);
          reject({ function: functionName, status: 'error', error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${functionName}: ${error.message}`);
      reject({ function: functionName, status: 'error', error: error.message });
    });

    req.setTimeout(30000, () => {
      console.log(`⏰ ${functionName}: Timeout after 30 seconds`);
      req.destroy();
      reject({ function: functionName, status: 'timeout', error: 'Function timeout' });
    });

    req.end();
  });
}

/**
 * Test all functions
 */
async function testAllFunctions() {
  console.log('🚀 Starting Edge Functions Test Suite\n');
  console.log(`📍 Testing against: ${SUPABASE_URL}\n`);

  const results = {
    total: FUNCTIONS.length,
    passed: 0,
    failed: 0,
    details: []
  };

  for (const functionName of FUNCTIONS) {
    try {
      const result = await testFunction(functionName);
      results.passed++;
      results.details.push(result);
      
      // Wait 2 seconds between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      results.failed++;
      results.details.push(error);
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / results.total) * 100)}%\n`);

  if (results.failed > 0) {
    console.log('❌ Failed Functions:');
    results.details
      .filter(d => d.status !== 'success')
      .forEach(d => console.log(`   - ${d.function}: ${d.error}`));
  }

  console.log('\n🎯 Next Steps:');
  if (results.passed === results.total) {
    console.log('✅ All functions are working correctly!');
    console.log('🚀 Ready to deploy cron jobs and start automation');
  } else {
    console.log('🔧 Fix failed functions before deploying automation');
    console.log('📖 Check function logs in Supabase Dashboard');
  }

  return results;
}

/**
 * Test specific function with custom data
 */
async function testFunctionWithData(functionName, data = {}) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
    
    console.log(`🧪 Testing ${functionName} with custom data...`);
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          console.log(`✅ ${functionName}: ${response.message || 'Success'}`);
          resolve({ function: functionName, status: 'success', response });
        } catch (error) {
          console.log(`❌ ${functionName}: Failed to parse response`);
          reject({ function: functionName, status: 'error', error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${functionName}: ${error.message}`);
      reject({ function: functionName, status: 'error', error: error.message });
    });

    req.setTimeout(30000, () => {
      console.log(`⏰ ${functionName}: Timeout after 30 seconds`);
      req.destroy();
      reject({ function: functionName, status: 'timeout', error: 'Function timeout' });
    });

    // Send request body if data provided
    if (Object.keys(data).length > 0) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test system health monitoring
 */
async function testSystemHealth() {
  console.log('🏥 Testing System Health Monitoring...\n');
  
  try {
    const result = await testFunction('monitor-system-health');
    
    if (result.status === 'success' && result.response.status) {
      console.log(`📊 System Status: ${result.response.status}`);
      console.log(`📈 Metrics: ${result.response.summary?.total_metrics || 0}`);
      console.log(`🚨 Alerts: ${result.response.summary?.critical_alerts || 0} critical, ${result.response.summary?.warning_alerts || 0} warnings`);
    }
    
    return result;
  } catch (error) {
    console.log('❌ System health test failed:', error);
    return error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Test all functions
    await testAllFunctions();
  } else if (args[0] === 'health') {
    // Test system health only
    await testSystemHealth();
  } else if (args[0] === 'function' && args[1]) {
    // Test specific function
    const functionName = args[1];
    if (FUNCTIONS.includes(functionName)) {
      await testFunction(functionName);
    } else {
      console.log(`❌ Unknown function: ${functionName}`);
      console.log(`Available functions: ${FUNCTIONS.join(', ')}`);
    }
  } else {
    console.log('Usage:');
    console.log('  node test-edge-functions.js                    # Test all functions');
    console.log('  node test-edge-functions.js health             # Test system health only');
    console.log('  node test-edge-functions.js function <name>    # Test specific function');
    console.log('');
    console.log('Available functions:');
    FUNCTIONS.forEach(fn => console.log(`  - ${fn}`));
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testFunction,
  testAllFunctions,
  testFunctionWithData,
  testSystemHealth
};
