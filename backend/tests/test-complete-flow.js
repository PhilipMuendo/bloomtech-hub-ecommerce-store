const axios = require('axios');
require('dotenv').config();

console.log('🧪 Testing Complete Pesapal v3 Flow...');
console.log('🔑 Consumer Key:', process.env.PESAPAL_CONSUMER_KEY ? 'Set' : 'Missing');
console.log('🔐 Consumer Secret:', process.env.PESAPAL_CONSUMER_SECRET ? 'Set' : 'Missing');
console.log('🔄 Callback URL:', process.env.PESAPAL_CALLBACK_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction
  ? 'https://pay.pesapal.com/v3/api'
  : 'https://cybqa.pesapal.com/pesapalv3/api';

let bearerToken = null;
let orderTrackingId = null;
let ipnId = null;

async function getBearerToken() {
  try {
    console.log('🔄 Step 1: Getting Bearer token...');
    
    const authData = {
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    };

    const response = await axios.post(`${baseUrl}/Auth/RequestToken`, authData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data.status === '200' && response.data.token) {
      console.log('✅ Bearer token obtained successfully');
      bearerToken = response.data.token;
      return response.data.token;
    } else {
      throw new Error(`Authentication failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Error getting Bearer token:', error.message);
    throw error;
  }
}

async function registerIPN() {
  try {
    console.log('🔄 Step 2: Registering IPN URL...');
    
    const ipnUrl = process.env.PESAPAL_CALLBACK_URL.replace('/callback', '/ipn');
    const ipnData = {
      url: ipnUrl,
      ipn_notification_type: "GET"
    };

    const response = await axios.post(`${baseUrl}/URLSetup/RegisterIPN`, ipnData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`
      },
      timeout: 10000
    });

    if (response.data.status === '200') {
      console.log('✅ IPN URL registered successfully');
      ipnId = response.data.ipn_id;
      return response.data.ipn_id;
    } else {
      console.log('⚠️ IPN registration failed, continuing without IPN');
      return null;
    }
  } catch (error) {
    console.error('❌ Error registering IPN:', error.message);
    return null;
  }
}

async function submitOrder() {
  try {
    console.log('🔄 Step 3: Submitting order...');
    
    const orderData = {
      id: `TEST_ORDER_${Date.now()}`,
      currency: "KES",
      amount: 100.00,
      description: "Test payment for Pesapal v3 integration",
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      notification_id: ipnId || "",
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

    const response = await axios.post(`${baseUrl}/Transactions/SubmitOrderRequest`, orderData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`
      },
      timeout: 15000
    });

    if (response.data.status === '200' && response.data.redirect_url) {
      console.log('✅ Order submitted successfully');
      console.log('🔗 Redirect URL:', response.data.redirect_url);
      console.log('🆔 Order Tracking ID:', response.data.order_tracking_id);
      orderTrackingId = response.data.order_tracking_id;
      return response.data;
    } else {
      throw new Error(`Order submission failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Error submitting order:', error.message);
    throw error;
  }
}

async function checkTransactionStatus() {
  try {
    console.log('🔄 Step 4: Checking transaction status...');
    
    if (!orderTrackingId) {
      console.log('⚠️ No order tracking ID available, skipping status check');
      return null;
    }

    const response = await axios.get(`${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`
      },
      timeout: 10000
    });

    console.log('📥 Status response:', response.data);
    
    if (response.data.status === '200') {
      console.log('✅ Transaction status retrieved successfully');
      console.log('💰 Payment Status:', response.data.payment_status_description);
      console.log('💳 Payment Method:', response.data.payment_method);
      console.log('💵 Amount:', response.data.amount);
      return response.data;
    } else {
      console.log('⚠️ Status check failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking transaction status:', error.message);
    return null;
  }
}

async function runCompleteTest() {
  try {
    console.log('🚀 Starting complete Pesapal v3 flow test...\n');
    
    // Step 1: Authentication
    await getBearerToken();
    
    // Step 2: Register IPN (optional)
    await registerIPN();
    
    // Step 3: Submit Order
    await submitOrder();
    
    // Step 4: Check Status (will likely be pending initially)
    await checkTransactionStatus();
    
    console.log('\n🎉 Complete flow test finished!');
    console.log('\n📋 Summary:');
    console.log(`🔑 Bearer Token: ${bearerToken ? '✅ Obtained' : '❌ Failed'}`);
    console.log(`🔔 IPN ID: ${ipnId || '❌ Not registered'}`);
    console.log(`📦 Order Tracking ID: ${orderTrackingId || '❌ Not created'}`);
    
    if (orderTrackingId) {
      console.log('\n💡 Next Steps:');
      console.log('1. Visit the redirect URL to complete payment');
      console.log('2. Check transaction status after payment');
      console.log('3. Verify callback handling');
    }
    
  } catch (error) {
    console.error('\n❌ Complete flow test failed:', error.message);
  }
}

runCompleteTest();
