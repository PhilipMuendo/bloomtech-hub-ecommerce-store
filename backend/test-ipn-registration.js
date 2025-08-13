const axios = require('axios');
require('dotenv').config();

console.log('🔔 Testing IPN Registration...');
console.log('🔑 Consumer Key:', process.env.PESAPAL_CONSUMER_KEY ? 'Set' : 'Missing');
console.log('🔐 Consumer Secret:', process.env.PESAPAL_CONSUMER_SECRET ? 'Set' : 'Missing');

const isProduction = process.env.NODE_ENV === 'production';
const authUrl = isProduction
  ? 'https://pay.pesapal.com/v3/api/Auth/RequestToken'
  : 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken';

const registerIPNUrl = isProduction
  ? 'https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN'
  : 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN';

async function getBearerToken() {
  try {
    const authData = {
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    };

    const response = await axios.post(authUrl, authData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data.status === '200' && response.data.token) {
      return response.data.token;
    } else {
      throw new Error(`Authentication failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Error getting Bearer token:', error.message);
    throw error;
  }
}

async function registerIPN(token) {
  try {
    const ipnUrl = process.env.PESAPAL_CALLBACK_URL.replace('/callback', '/ipn');
    
    const ipnData = {
      url: ipnUrl,
      ipn_notification_type: "GET"
    };

    console.log('📡 Registering IPN URL:', ipnUrl);

    const response = await axios.post(registerIPNUrl, ipnData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    if (response.data.status === '200') {
      console.log('✅ IPN URL registered successfully!');
      console.log('🆔 IPN ID:', response.data.ipn_id);
      return response.data.ipn_id;
    } else {
      console.log('❌ IPN registration failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error registering IPN:', error.message);
    if (error.response) {
      console.error('📥 Response data:', error.response.data);
      console.error('📊 Response status:', error.response.status);
    }
    return null;
  }
}

async function testIPNRegistration() {
  try {
    console.log('🔄 Getting Bearer token...');
    const token = await getBearerToken();
    
    console.log('🔄 Registering IPN URL...');
    const ipnId = await registerIPN(token);
    
    if (ipnId) {
      console.log('🎉 IPN registration test passed!');
      console.log('💡 Add this IPN ID to your .env file:');
      console.log(`PESAPAL_IPN_ID="${ipnId}"`);
    } else {
      console.log('❌ IPN registration test failed!');
    }
  } catch (error) {
    console.log('❌ IPN registration test failed:', error.message);
  }
}

testIPNRegistration();
