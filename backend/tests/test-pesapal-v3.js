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
console.log('📤 Auth data being sent:', authData);

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

async function testSubmitOrder(token) {
  try {
    console.log('🔄 Testing Submit Order Request...');
    
    const submitOrderUrl = isProduction
      ? 'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest'
      : 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest';

    const orderData = {
      id: "TEST_ORDER_" + Date.now(),
      currency: "KES",
      amount: 100.00,
      description: "Test payment for Pesapal v3 integration",
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      notification_id: "", // We'll skip IPN for now
      billing_address: {
        email_address: "test@example.com",
        phone_number: "254700000000",
        country_code: "KE",
        first_name: "Test",
        middle_name: "",
        last_name: "User",
        line_1: "Test Address",
        line_2: "",
        city: "Nairobi",
        state: "",
        postal_code: "",
        zip_code: ""
      }
    };

    console.log('📦 Order data:', orderData);

    const response = await axios.post(submitOrderUrl, orderData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 15000
    });

    console.log('📥 Submit Order Response status:', response.status);
    console.log('📄 Submit Order Response data:', response.data);

    if (response.data.status === '200' && response.data.redirect_url) {
      console.log('✅ Submit Order successful!');
      console.log('🔗 Redirect URL:', response.data.redirect_url);
      console.log('🆔 Order Tracking ID:', response.data.order_tracking_id);
      return response.data;
    } else {
      console.log('❌ Submit Order failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Submit Order Error:', error.message);
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
    return testSubmitOrder(token);
  } else {
    console.log('❌ Authentication test failed!');
    return null;
  }
}).then(orderResult => {
  if (orderResult) {
    console.log('🎉 Complete v3 API test passed!');
  } else {
    console.log('❌ Submit Order test failed!');
  }
});
