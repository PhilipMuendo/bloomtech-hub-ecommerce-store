const axios = require('axios');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

const {
  PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET,
  PESAPAL_CALLBACK_URL,
  PESAPAL_API_ENDPOINT,
  NODE_ENV
} = process.env;

const isProduction = NODE_ENV === 'production';

// Helper to generate OAuth signature for Pesapal
const generateOAuthSignature = (url, method, params) => {
  const baseString = method.toUpperCase() + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(params);
  const signingKey = encodeURIComponent(PESAPAL_CONSUMER_SECRET) + '&';
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
};

// Test Pesapal configuration
const testPesapalConfig = () => {
  console.log('🔧 Testing Pesapal Configuration...');
  
  const requiredVars = [
    'PESAPAL_CONSUMER_KEY',
    'PESAPAL_CONSUMER_SECRET',
    'PESAPAL_CALLBACK_URL'
  ];
  
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  console.log('📡 API Endpoint:', isProduction ? 'https://www.pesapal.com' : 'https://demo.pesapal.com');
  console.log('🔄 Callback URL:', PESAPAL_CALLBACK_URL);
  
  return true;
};

// Test OAuth signature generation
const testOAuthSignature = () => {
  console.log('\n🔐 Testing OAuth Signature Generation...');
  
  try {
    const testUrl = 'https://demo.pesapal.com/API/PostPesapalDirectOrderV4';
    const testParams = 'oauth_consumer_key=test&oauth_nonce=123&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1234567890&oauth_version=1.0';
    
    const signature = generateOAuthSignature(testUrl, 'GET', testParams);
    
    if (signature && signature.length > 0) {
      console.log('✅ OAuth signature generated successfully');
      console.log('📝 Sample signature:', signature.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ OAuth signature generation failed');
      return false;
    }
  } catch (error) {
    console.log('❌ OAuth signature generation error:', error.message);
    return false;
  }
};

// Test Pesapal payment initiation
const testPesapalPayment = async (orderId = 1, amount = 100) => {
  console.log('\n💳 Testing Pesapal Payment Initiation...');
  
  try {
    // Prepare payment request payload
    const description = `Test Payment for Order ${orderId}`;
    const type = 'MERCHANT';
    const reference = orderId.toString();
    const firstName = 'Test';
    const lastName = 'Customer';
    const email = 'test@example.com';
    const phoneNumber = '254708374149';

    // Construct XML payload as per Pesapal API
    const xmlPayload = `
      <PesapalDirectOrderInfo 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
        Amount="${amount.toFixed(2)}" 
        Description="${description}" 
        Type="${type}" 
        Reference="${reference}" 
        FirstName="${firstName}" 
        LastName="${lastName}" 
        Email="${email}" 
        PhoneNumber="${phoneNumber}" 
        Currency="KES" 
        xmlns="http://www.pesapal.com" />
    `.trim();

    // Pesapal API endpoint for payment request
    const url = isProduction
      ? 'https://www.pesapal.com/API/PostPesapalDirectOrderV4'
      : 'https://demo.pesapal.com/API/PostPesapalDirectOrderV4';

    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: PESAPAL_CONSUMER_KEY,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      oauth_callback: PESAPAL_CALLBACK_URL,
      pesapal_request_data: xmlPayload
    };

    // Construct base string for signature
    const baseStringParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    // Generate OAuth signature
    const oauthSignature = generateOAuthSignature(url, 'GET', baseStringParams);
    oauthParams.oauth_signature = oauthSignature;

    // Construct request URL with query params
    const requestUrl = url + '?' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    console.log('✅ Payment URL generated successfully');
    console.log('🔗 Payment URL:', requestUrl.substring(0, 100) + '...');
    console.log('📊 Order ID:', orderId);
    console.log('💰 Amount:', `KES ${amount.toFixed(2)}`);
    console.log('📱 Phone:', phoneNumber);
    
    return requestUrl;
  } catch (error) {
    console.log('❌ Payment initiation failed:', error.message);
    return null;
  }
};

// Test Pesapal status query
const testPesapalStatusQuery = async (merchantReference = '1', trackingId = 'test123') => {
  console.log('\n📊 Testing Pesapal Status Query...');
  
  try {
    const statusUrl = `${PESAPAL_API_ENDPOINT || 'https://demo.pesapal.com'}/QueryPaymentStatus` + 
      `?pesapal_merchant_reference=${merchantReference}&pesapal_transaction_tracking_id=${trackingId}`;

    // OAuth parameters for status query
    const oauthParams = {
      oauth_consumer_key: PESAPAL_CONSUMER_KEY,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
    };

    // Construct base string for signature
    const baseStringParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    const oauthSignature = generateOAuthSignature(statusUrl, 'GET', baseStringParams);
    oauthParams.oauth_signature = oauthSignature;

    const queryString = Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    const fullStatusUrl = statusUrl + '&' + queryString;

    console.log('✅ Status query URL generated');
    console.log('🔗 Status URL:', fullStatusUrl.substring(0, 100) + '...');
    console.log('📋 Merchant Reference:', merchantReference);
    console.log('🆔 Tracking ID:', trackingId);
    
    return fullStatusUrl;
  } catch (error) {
    console.log('❌ Status query failed:', error.message);
    return null;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Pesapal Integration Tests...\n');
  
  // Test 1: Configuration
  const configOk = testPesapalConfig();
  if (!configOk) {
    console.log('\n❌ Configuration test failed. Please check your environment variables.');
    process.exit(1);
  }
  
  // Test 2: OAuth Signature
  const signatureOk = testOAuthSignature();
  if (!signatureOk) {
    console.log('\n❌ OAuth signature test failed.');
    process.exit(1);
  }
  
  // Test 3: Payment Initiation
  const paymentUrl = await testPesapalPayment();
  if (!paymentUrl) {
    console.log('\n❌ Payment initiation test failed.');
    process.exit(1);
  }
  
  // Test 4: Status Query
  const statusUrl = await testPesapalStatusQuery();
  if (!statusUrl) {
    console.log('\n❌ Status query test failed.');
    process.exit(1);
  }
  
  console.log('\n🎉 All Pesapal tests passed!');
  console.log('\n📋 Next Steps:');
  console.log('1. ✅ Environment variables configured');
  console.log('2. ✅ OAuth signature generation working');
  console.log('3. ✅ Payment URL generation working');
  console.log('4. ✅ Status query URL generation working');
  console.log('5. 🔄 Test with real Pesapal sandbox');
  console.log('6. 🔄 Set up ngrok for callbacks');
  console.log('7. 🔄 Test complete payment flow');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testPesapalConfig,
  testOAuthSignature,
  testPesapalPayment,
  testPesapalStatusQuery
}; 