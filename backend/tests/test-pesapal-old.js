const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

console.log('🔧 Testing Pesapal Old API...');
console.log('🔑 Consumer Key:', process.env.PESAPAL_CONSUMER_KEY ? 'Set' : 'Missing');
console.log('🔐 Consumer Secret:', process.env.PESAPAL_CONSUMER_SECRET ? 'Set' : 'Missing');

const isProduction = process.env.NODE_ENV === 'production';
const url = isProduction
  ? 'https://www.pesapal.com/API/PostPesapalDirectOrderV4'
  : 'https://demo.pesapal.com/API/PostPesapalDirectOrderV4';

console.log('📡 API URL:', url);

// Generate OAuth signature
const oauthParams = {
  oauth_consumer_key: process.env.PESAPAL_CONSUMER_KEY,
  oauth_nonce: Math.random().toString(36).substring(2),
  oauth_signature_method: 'HMAC-SHA1',
  oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
  oauth_version: '1.0'
};

// Create signature base string
const signatureBaseString = [
  'POST',
  encodeURIComponent(url),
  encodeURIComponent(Object.keys(oauthParams).sort().map(key => `${key}=${oauthParams[key]}`).join('&'))
].join('&');

// Generate signature
const signature = crypto.createHmac('sha1', process.env.PESAPAL_CONSUMER_SECRET + '&').update(signatureBaseString).digest('base64');
oauthParams.oauth_signature = signature;

// Create OAuth header
const oauthHeader = 'OAuth ' + Object.keys(oauthParams).map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`).join(', ');

// Prepare XML payload
const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<PesapalDirectOrderInfo 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
    Amount="100.00" 
    Description="Test payment" 
    Type="MERCHANT" 
    Reference="TEST_001" 
    FirstName="Test" 
    LastName="User" 
    Email="test@example.com" 
    PhoneNumber="254700000000" 
    xmlns="http://www.pesapal.com" />`;

console.log('📤 XML Payload:', xmlPayload);

async function testPayment() {
  try {
    console.log('🔄 Testing payment initiation...');
    
    const response = await axios.post(url, xmlPayload, {
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': oauthHeader
      },
      timeout: 15000
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);
    
    // Extract order tracking ID
    const orderTrackingId = response.data.match(/<PesapalRedirectURL>(.*?)<\/PesapalRedirectURL>/)?.[1];
    
    if (orderTrackingId) {
      console.log('✅ Payment initiated successfully!');
      console.log('🔗 Redirect URL:', orderTrackingId);
      return orderTrackingId;
    } else {
      console.log('❌ Payment initiation failed');
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

testPayment().then(result => {
  if (result) {
    console.log('🎉 Payment test passed!');
  } else {
    console.log('❌ Payment test failed!');
  }
});

