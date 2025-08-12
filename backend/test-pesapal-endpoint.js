const axios = require('axios');

// Test if Pesapal v3 API endpoint is accessible
const testPesapalEndpoint = async () => {
  console.log('🔍 Testing Pesapal v3 API Endpoint...');
  
  const baseUrl = 'https://cybqa.pesapal.com/pesapalv3/api';
  
  try {
    console.log('📡 Testing base URL:', baseUrl);
    
    // Try a simple GET request to see if the endpoint is accessible
    const response = await axios.get(baseUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✅ Endpoint is accessible');
    console.log('📊 Status:', response.status);
    console.log('📄 Response type:', typeof response.data);
    
    if (typeof response.data === 'string') {
      console.log('📝 Response preview:', response.data.substring(0, 200) + '...');
    } else {
      console.log('📝 Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Endpoint test failed');
    console.log('🔍 Error details:');
    console.log('  - Status:', error.response?.status);
    console.log('  - Message:', error.message);
    console.log('  - Response:', error.response?.data);
    
    if (error.response?.status === 404) {
      console.log('💡 The endpoint might not exist or be incorrect');
    } else if (error.response?.status === 401) {
      console.log('💡 Authentication required - this is normal for API endpoints');
    }
  }
};

// Test the specific payment endpoint
const testPaymentEndpoint = async () => {
  console.log('\n💳 Testing Payment Endpoint...');
  
  const paymentUrl = 'https://cybqa.pesapal.com/pesapalv3/api/PostPesapalDirectOrderV4';
  
  try {
    console.log('📡 Testing payment URL:', paymentUrl);
    
    const response = await axios.get(paymentUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✅ Payment endpoint is accessible');
    console.log('📊 Status:', response.status);
    
  } catch (error) {
    console.log('❌ Payment endpoint test failed');
    console.log('🔍 Error details:');
    console.log('  - Status:', error.response?.status);
    console.log('  - Message:', error.message);
    
    if (error.response?.status === 404) {
      console.log('💡 The payment endpoint might not exist in v3 API');
      console.log('💡 Check Pesapal v3 documentation for correct endpoints');
    }
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Testing Pesapal v3 API Endpoints...\n');
  
  await testPesapalEndpoint();
  await testPaymentEndpoint();
  
  console.log('\n📋 Recommendations:');
  console.log('1. Check Pesapal v3 API documentation');
  console.log('2. Verify the correct endpoints for v3');
  console.log('3. Ensure your credentials are for v3 sandbox');
  console.log('4. Check if v3 uses different request formats');
};

runTests().catch(console.error);
