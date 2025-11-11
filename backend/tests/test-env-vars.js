import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PESAPAL_CONSUMER_KEY:', process.env.PESAPAL_CONSUMER_KEY ? '✅ Set' : '❌ Missing');
console.log('PESAPAL_CONSUMER_SECRET:', process.env.PESAPAL_CONSUMER_SECRET ? '✅ Set' : '❌ Missing');
console.log('PESAPAL_CALLBACK_URL:', process.env.PESAPAL_CALLBACK_URL || '❌ Missing');
console.log('PESAPAL_API_ENDPOINT:', process.env.PESAPAL_API_ENDPOINT || '❌ Missing');

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction 
  ? 'https://pay.pesapal.com/v3/api'
  : 'https://cybqa.pesapal.com/pesapalv3/api';

console.log('🌍 Environment:', isProduction ? 'Production' : 'Development');
console.log('🔗 Base URL:', baseUrl);
console.log('🔗 Auth URL:', `${baseUrl}/Auth/RequestToken`);

if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
  console.log('❌ Missing required Pesapal credentials!');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
