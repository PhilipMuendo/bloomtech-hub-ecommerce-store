# M-Pesa Payment Integration Setup Guide

## 🚀 Quick Setup for Sandbox Environment

### 1. Environment Variables Setup

Add these variables to your `.env` file:

```env
# M-Pesa Sandbox Configuration
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
NODE_ENV=development
```

### 2. Sandbox Test Credentials

For testing, use these sandbox credentials:

- **Consumer Key**: Get from your M-Pesa Developer Portal
- **Consumer Secret**: Get from your M-Pesa Developer Portal  
- **Shortcode**: `174379` (Sandbox test shortcode)
- **Passkey**: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- **Test Phone Numbers**: 
  - `254708374149` (Success)
  - `254708374150` (Insufficient funds)
  - `254708374151` (Rejected)

### 3. Ngrok Setup for Callbacks

1. Install ngrok: `npm install -g ngrok`
2. Start your backend server: `npm start`
3. In a new terminal, run: `ngrok http 8081`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update your `.env` file with the callback URL:
   ```
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/payments/mpesa/callback
   ```

### 4. Testing the Integration

#### Frontend Testing
1. Create an order in your e-commerce store
2. Click "Pay with M-Pesa"
3. Enter a test phone number
4. Check your phone for the STK push
5. Enter PIN: `1234` (sandbox)

#### Backend Testing
Test the API endpoints:

```bash
# Initiate payment
curl -X POST http://localhost:8081/api/payments/mpesa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "1",
    "phoneNumber": "254708374149"
  }'

# Check transaction status
curl -X GET http://localhost:8081/api/payments/transaction/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Database Setup

Make sure you have the Transaction model set up. If not, create a migration:

```bash
npx sequelize-cli model:generate --name Transaction --attributes orderId:integer,userId:integer,phoneNumber:string,amount:decimal,checkoutRequestId:string,merchantRequestId:string,status:enum,mpesaReceiptNumber:string,transactionDate:date,resultCode:string,resultDesc:text,rawCallback:text
```

### 6. Common Issues & Solutions

#### Issue: "Invalid consumer key/secret"
- **Solution**: Double-check your sandbox credentials from the M-Pesa Developer Portal

#### Issue: "Invalid shortcode"
- **Solution**: Use `174379` for sandbox testing

#### Issue: "Callback URL not accessible"
- **Solution**: 
  1. Make sure ngrok is running
  2. Update the callback URL in your `.env` file
  3. Restart your server

#### Issue: "STK push not received"
- **Solution**: 
  1. Use the test phone numbers provided
  2. Check if your phone has M-Pesa app installed
  3. Ensure you're using the correct phone format (254xxxxxxxxx)

### 7. Production Setup

When moving to production:

1. **Update Environment Variables**:
   ```env
   NODE_ENV=production
   MPESA_BASE_URL=https://api.safaricom.co.ke
   ```

2. **Get Production Credentials**:
   - Apply for production credentials from Safaricom
   - Update consumer key, secret, shortcode, and passkey

3. **Update Callback URL**:
   ```env
   MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback
   ```

### 8. Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **HTTPS**: Always use HTTPS in production
3. **Validation**: Validate phone numbers and amounts on both frontend and backend
4. **Rate Limiting**: Implement rate limiting for payment endpoints
5. **Logging**: Log all payment attempts for debugging

### 9. Monitoring & Debugging

#### Enable Debug Logging
Add to your `.env`:
```env
DEBUG=mpesa:*
```

#### Check Payment Status
Use the admin panel to view all transactions:
```
GET /api/payments/transactions
```

#### Monitor Callbacks
Check your server logs for callback processing:
```bash
tail -f logs/app.log
```

### 10. Next Steps

1. ✅ Set up environment variables
2. ✅ Configure ngrok for callbacks
3. ✅ Test with sandbox credentials
4. ✅ Verify database transactions
5. 🔄 Test with real M-Pesa app
6. 🔄 Move to production credentials
7. 🔄 Implement additional security measures

## 🎯 Success Indicators

- ✅ STK push received on test phone
- ✅ Payment callback processed successfully
- ✅ Order status updated to "paid"
- ✅ Transaction recorded in database
- ✅ Frontend shows payment success 