#!/usr/bin/env node

/**
 * M-Pesa Integration Test Script
 * 
 * This script helps test your M-Pesa sandbox integration
 * Run with: node test-mpesa.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MPESA_CONFIG = {
  consumer_key: process.env.MPESA_CONSUMER_KEY,
  consumer_secret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  base_url: process.env.NODE_ENV === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke'
};

// Test phone numbers
const TEST_PHONES = {
  success: '254708374149',
  insufficient: '254708374150',
  rejected: '254708374151'
};

// Generate M-Pesa access token
const getMpesaToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumer_key}:${MPESA_CONFIG.consumer_secret}`).toString('base64');
    
    const response = await axios.get(`${MPESA_CONFIG.base_url}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('❌ M-Pesa token error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Test STK push
const testStkPush = async (phoneNumber, amount = 1) => {
  try {
    console.log(`\n🧪 Testing STK push for phone: ${phoneNumber}, amount: ${amount}`);
    
    const accessToken = await getMpesaToken();
    console.log('✅ Access token obtained');
    
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
    
    const response = await axios.post(`${MPESA_CONFIG.base_url}/mpesa/stkpush/v1/processrequest`, {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: 'Test-Payment',
      TransactionDesc: 'Test payment'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ STK push initiated successfully');
    console.log('📱 Checkout Request ID:', response.data.CheckoutRequestID);
    console.log('🏢 Merchant Request ID:', response.data.MerchantRequestID);
    
    return response.data;
  } catch (error) {
    console.error('❌ STK push failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test configuration
const testConfiguration = () => {
  console.log('🔧 Testing M-Pesa Configuration:');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Base URL:', MPESA_CONFIG.base_url);
  console.log('Shortcode:', MPESA_CONFIG.shortcode);
  console.log('Consumer Key:', MPESA_CONFIG.consumer_key ? '✅ Set' : '❌ Missing');
  console.log('Consumer Secret:', MPESA_CONFIG.consumer_secret ? '✅ Set' : '❌ Missing');
  console.log('Passkey:', MPESA_CONFIG.passkey ? '✅ Set' : '❌ Missing');
  console.log('Callback URL:', process.env.MPESA_CALLBACK_URL || '❌ Missing');
  
  const missing = [];
  if (!MPESA_CONFIG.consumer_key) missing.push('MPESA_CONSUMER_KEY');
  if (!MPESA_CONFIG.consumer_secret) missing.push('MPESA_CONSUMER_SECRET');
  if (!MPESA_CONFIG.shortcode) missing.push('MPESA_SHORTCODE');
  if (!MPESA_CONFIG.passkey) missing.push('MPESA_PASSKEY');
  if (!process.env.MPESA_CALLBACK_URL) missing.push('MPESA_CALLBACK_URL');
  
  if (missing.length > 0) {
    console.log('\n❌ Missing environment variables:', missing.join(', '));
    console.log('Please check your .env file');
    return false;
  }
  
  console.log('\n✅ Configuration looks good!');
  return true;
};

// Main test function
const runTests = async () => {
  console.log('🚀 M-Pesa Integration Test');
  console.log('========================');
  
  // Test configuration
  if (!testConfiguration()) {
    return;
  }
  
  try {
    // Test successful payment
    await testStkPush(TEST_PHONES.success, 1);
    
    console.log('\n📋 Test Summary:');
    console.log('✅ Configuration test passed');
    console.log('✅ Token generation test passed');
    console.log('✅ STK push test passed');
    console.log('\n🎉 All tests passed! Your M-Pesa integration is working.');
    console.log('\n📱 Next steps:');
    console.log('1. Check your phone for the M-Pesa prompt');
    console.log('2. Enter PIN: 1234 (sandbox)');
    console.log('3. Check your server logs for callback processing');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your sandbox credentials');
    console.log('2. Verify your callback URL is accessible');
    console.log('3. Make sure ngrok is running if testing locally');
  }
};

// Run tests
runTests().catch(console.error); 