const axios = require('axios');
require('dotenv').config();

console.log('🧪 Testing Pesapal in both Sandbox and Production environments...');
console.log('🔑 Consumer Key:', process.env.PESAPAL_CONSUMER_KEY ? 'Set' : 'Missing');
console.log('🔐 Consumer Secret:', process.env.PESAPAL_CONSUMER_SECRET ? 'Set' : 'Missing');

const credentials = {
  consumer_key: process.env.PESAPAL_CONSUMER_KEY,
  consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
};

async function testEnvironment(environment, authUrl) {
  try {
    console.log(`\n🔄 Testing ${environment} environment...`);
    console.log(`📡 Auth URL: ${authUrl}`);
    
    const response = await axios.post(authUrl, credentials, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`📥 ${environment} Response status:`, response.status);
    console.log(`📄 ${environment} Response data:`, response.data);

    if (response.data.status === '200' && response.data.token) {
      console.log(`✅ ${environment} Authentication successful!`);
      console.log(`⏰ Token expires:`, response.data.expiryDate);
      return { success: true, token: response.data.token, environment };
    } else {
      console.log(`❌ ${environment} Authentication failed:`, response.data.message || response.data.error?.message);
      return { success: false, error: response.data, environment };
    }
  } catch (error) {
    console.error(`❌ ${environment} Error:`, error.message);
    if (error.response) {
      console.error(`📥 ${environment} Response data:`, error.response.data);
      console.error(`📊 ${environment} Response status:`, error.response.status);
    }
    return { success: false, error: error.message, environment };
  }
}

async function testBothEnvironments() {
  const sandboxUrl = 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken';
  const productionUrl = 'https://pay.pesapal.com/v3/api/Auth/RequestToken';

  console.log('🚀 Starting tests...\n');

  // Test Sandbox
  const sandboxResult = await testEnvironment('Sandbox', sandboxUrl);
  
  // Test Production
  const productionResult = await testEnvironment('Production', productionUrl);

  console.log('\n📋 Summary:');
  console.log(`🔵 Sandbox: ${sandboxResult.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`🟢 Production: ${productionResult.success ? '✅ Success' : '❌ Failed'}`);

  if (sandboxResult.success) {
    console.log('\n💡 Your credentials work with Sandbox environment');
    console.log('🔧 Update your .env file to use sandbox URLs');
  } else if (productionResult.success) {
    console.log('\n💡 Your credentials work with Production environment');
    console.log('🔧 Update your .env file to use production URLs');
  } else {
    console.log('\n❌ Credentials failed in both environments');
    console.log('🔧 Please contact Pesapal support to verify your credentials');
  }
}

testBothEnvironments();
