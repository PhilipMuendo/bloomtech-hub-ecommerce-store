const axios = require('axios');
require('dotenv').config();

console.log('🔧 Testing Pesapal v3 Configuration...');
console.log('🔑 Consumer Key:', process.env.PESAPAL_CONSUMER_KEY ? 'Set' : 'Missing');
console.log('🔐 Consumer Secret:', process.env.PESAPAL_CONSUMER_SECRET ? 'Set' : 'Missing');
console.log('🔄 Callback URL:', process.env.PESAPAL_CALLBACK_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

const isProduction = process.env.NODE_ENV === 'production';
const authUrl = isProduction 
  ? 'https://pay.pesapal.com/v3/api/Auth/RequestToken'
  : 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken';

const authData = {
  consumer_key: process.env.PESAPAL_CONSUMER_KEY,
  consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
};

console.log('📡 Auth URL:', authUrl);

async function testAuth() {
  try {
    console.log('🔄 Testing Bearer token authentication...');
    
    const response = await axios.post(authUrl, authData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);
    
    if (response.data.status === '200' && response.data.token) {
      console.log('✅ Authentication successful!');
      console.log('⏰ Token expires:', response.data.expiryDate);
      console.log('🎫 Token preview:', response.data.token.substring(0, 50) + '...');
      return response.data.token;
    } else {
      console.log('❌ Authentication failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📥 Response data:', error.response.data);
      console.error('📊 Response status:', error.response.status);
    }
    return null;
  }
}

testAuth().then(token => {
  if (token) {
    console.log('🎉 Authentication test passed!');
  } else {
    console.log('❌ Authentication test failed!');
  }
});
