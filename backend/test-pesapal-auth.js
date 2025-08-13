import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const {
  PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET
} = process.env;

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction 
  ? 'https://pay.pesapal.com/v3/api'
  : 'https://cybqa.pesapal.com/pesapalv3/api';

async function testPesapalAuth() {
  try {
    console.log('🔑 Testing Pesapal authentication...');
    console.log('🌍 Environment:', isProduction ? 'Production' : 'Development');
    console.log('🔗 Auth URL:', `${baseUrl}/Auth/RequestToken`);
    
    const authData = {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET
    };

    console.log('📤 Sending auth request...');
    const response = await axios.post(`${baseUrl}/Auth/RequestToken`, authData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);

    if (response.data.status === '200' && response.data.token) {
      console.log('✅ Authentication successful!');
      console.log('🔑 Token received:', response.data.token.substring(0, 20) + '...');
      return response.data.token;
    } else {
      console.log('❌ Authentication failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during authentication:', error.message);
    if (error.response) {
      console.error('📥 Error response:', error.response.data);
      console.error('📥 Error status:', error.response.status);
    }
    return null;
  }
}

testPesapalAuth().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
});
