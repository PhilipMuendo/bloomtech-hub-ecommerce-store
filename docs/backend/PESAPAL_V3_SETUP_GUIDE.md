# Pesapal v3 API Integration Setup Guide

## Overview
This guide will help you set up Pesapal v3 API integration for your e-commerce store.

## Prerequisites
1. A Pesapal merchant account
2. Valid API credentials for v3 API
3. A publicly accessible callback URL (ngrok for development)

## Step 1: Get Valid Test Credentials

### For Sandbox/Testing:
1. Visit: https://cybqa.pesapal.com/pesapalv3/api
2. Look for "Download test credentials" or contact Pesapal support
3. You should receive:
   - Consumer Key
   - Consumer Secret

### For Production:
1. Visit: https://pay.pesapal.com/v3/api
2. Contact Pesapal to get live credentials
3. You will receive:
   - Consumer Key
   - Consumer Secret

## Step 2: Update Environment Variables

Add these to your `.env` file:

```env
# Pesapal v3 Configuration
PESAPAL_CONSUMER_KEY="your_consumer_key_here"
PESAPAL_CONSUMER_SECRET="your_consumer_secret_here"
PESAPAL_CALLBACK_URL="https://your-ngrok-url.ngrok-free.app/api/payments/pesapal/callback"
PESAPAL_API_ENDPOINT="https://cybqa.pesapal.com/pesapalv3/api"
NODE_ENV=development
```

## Step 3: Register IPN URL (Optional but Recommended)

### Option A: Using API
1. Run the IPN registration test:
   ```bash
   node test-ipn-registration.js
   ```

### Option B: Using Pesapal Forms
1. **Sandbox**: Visit the sandbox IPN registration form
2. **Production**: Visit the production IPN registration form
3. Register your IPN URL: `https://your-ngrok-url.ngrok-free.app/api/payments/pesapal/ipn`

## Step 4: Test the Integration

### Test Authentication:
```bash
node test-pesapal-v3.js
```

### Test Complete Flow:
```bash
node test-complete-flow.js
```

## Step 5: API Endpoints

### Base URLs:
- **Sandbox**: `https://cybqa.pesapal.com/pesapalv3/api`
- **Production**: `https://pay.pesapal.com/v3/api`

### Key Endpoints:
1. **Authentication**: `/Auth/RequestToken`
2. **Submit Order**: `/Transactions/SubmitOrderRequest`
3. **Get Status**: `/Transactions/GetTransactionStatus`
4. **Register IPN**: `/URLSetup/RegisterIPN`
5. **Refund**: `/Transactions/RefundRequest`
6. **Cancel Order**: `/Transactions/CancelOrder`

## Step 6: Request/Response Format

### Authentication Request:
```json
{
  "consumer_key": "your_consumer_key",
  "consumer_secret": "your_consumer_secret"
}
```

### Submit Order Request:
```json
{
  "id": "ORDER_123",
  "currency": "KES",
  "amount": 100.00,
  "description": "Payment for Order #123",
  "callback_url": "https://your-domain.com/callback",
  "notification_id": "ipn_id_from_registration",
  "billing_address": {
    "email_address": "customer@example.com",
    "phone_number": "254700000000",
    "country_code": "KE",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## Step 7: Error Handling

Common errors and solutions:

1. **`invalid_consumer_key_or_secret_provided`**
   - Solution: Get valid credentials from Pesapal

2. **`invalid_callback_url`**
   - Solution: Ensure callback URL is publicly accessible

3. **`invalid_notification_id`**
   - Solution: Register IPN URL first or leave empty

## Step 8: Testing Checklist

- [ ] Valid credentials obtained
- [ ] Environment variables set correctly
- [ ] Authentication test passes
- [ ] IPN URL registered (optional)
- [ ] Submit order test passes
- [ ] Callback handling works
- [ ] Status checking works

## Step 9: Production Deployment

1. Update environment variables for production
2. Use production base URL
3. Register production IPN URL
4. Test with small amounts first
5. Monitor transactions and logs

## Support

If you encounter issues:
1. Check Pesapal documentation
2. Verify credentials are correct
3. Ensure all URLs are publicly accessible
4. Contact Pesapal support for API-specific issues

## Current Status

**Issue**: Invalid credentials for v3 API
**Action Required**: Obtain valid test credentials from Pesapal
**Next Step**: Update `.env` file with valid credentials and retest
