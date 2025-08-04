# Pesapal Payment Integration Setup Guide

## 🚀 Quick Setup for Sandbox Environment

### 1. Environment Variables Setup

Add these variables to your `.env` file:

```env
# Pesapal Sandbox Configuration
PESAPAL_CONSUMER_KEY=your_sandbox_consumer_key
PESAPAL_CONSUMER_SECRET=your_sandbox_consumer_secret
PESAPAL_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/pesapal/callback
PESAPAL_API_ENDPOINT=https://demo.pesapal.com
NODE_ENV=development
```

### 2. Sandbox Test Credentials

For testing, use these sandbox credentials:

- **Consumer Key**: Get from your Pesapal Developer Portal
- **Consumer Secret**: Get from your Pesapal Developer Portal  
- **API Endpoint**: `https://demo.pesapal.com` (Sandbox)
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
   PESAPAL_CALLBACK_URL=https://abc123.ngrok.io/api/payments/pesapal/callback
   ```

### 4. Testing the Integration

#### Frontend Testing
1. Create an order in your e-commerce store
2. Click "Pay with Pesapal"
3. Enter customer details (name, email, phone)
4. Complete payment on Pesapal's secure page
5. Check for payment confirmation

#### Backend Testing
Test the API endpoints:

```bash
# Initiate payment
curl -X POST http://localhost:8081/api/payments/pesapal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "254708374149"
  }'

# Check payment status
curl -X GET http://localhost:8081/api/payments/pesapal/status/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all Pesapal transactions (admin)
curl -X GET http://localhost:8081/api/payments/pesapal/transactions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Database Setup

The Transaction model already supports Pesapal transactions. Pesapal transactions are identified by transaction IDs starting with `PESAPAL_`.

### 6. Common Issues & Solutions

#### Issue: "Invalid consumer key/secret"
- **Solution**: Double-check your sandbox credentials from the Pesapal Developer Portal

#### Issue: "OAuth signature error"
- **Solution**: 
  1. Verify your consumer key and secret
  2. Check that the API endpoint is correct
  3. Ensure the XML payload is properly formatted

#### Issue: "Callback URL not accessible"
- **Solution**: 
  1. Make sure ngrok is running
  2. Update the callback URL in your `.env` file
  3. Restart your server

#### Issue: "Payment not completing"
- **Solution**: 
  1. Check the Pesapal sandbox status
  2. Verify the XML payload format
  3. Ensure all required fields are provided

### 7. Production Setup

When moving to production:

1. **Update Environment Variables**:
   ```env
   NODE_ENV=production
   PESAPAL_API_ENDPOINT=https://www.pesapal.com
   ```

2. **Get Production Credentials**:
   - Apply for production credentials from Pesapal
   - Update consumer key and secret

3. **Update Callback URL**:
   ```env
   PESAPAL_CALLBACK_URL=https://your-domain.com/api/payments/pesapal/callback
   ```

### 8. Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **HTTPS**: Always use HTTPS in production
3. **Validation**: Validate all input data on both frontend and backend
4. **Rate Limiting**: Implement rate limiting for payment endpoints
5. **Logging**: Log all payment attempts for debugging
6. **OAuth Security**: Ensure OAuth signatures are properly generated

### 9. Monitoring & Debugging

#### Enable Debug Logging
Add to your `.env`:
```env
DEBUG=pesapal:*
```

#### Check Payment Status
Use the admin panel to view all Pesapal transactions:
```
GET /api/payments/pesapal/transactions
```

#### Monitor Callbacks
Check your server logs for callback processing:
```bash
tail -f logs/app.log
```

### 10. Pesapal-Specific Features

#### Multi-Payment Methods
Pesapal supports multiple payment methods:
- Credit/Debit Cards
- Mobile Money (M-Pesa, Airtel Money, etc.)
- Bank Transfers
- Digital Wallets

#### Payment Flow
1. User initiates payment with order details
2. Pesapal generates payment URL
3. User redirected to Pesapal's secure payment page
4. User completes payment using preferred method
5. Pesapal sends callback with payment status
6. System updates order and transaction status

#### XML Payload Format
Pesapal requires XML-formatted payment requests:
```xml
<PesapalDirectOrderInfo 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
  Amount="1000.00" 
  Description="Payment for Order 123" 
  Type="MERCHANT" 
  Reference="123" 
  FirstName="John" 
  LastName="Doe" 
  Email="john@example.com" 
  PhoneNumber="254708374149" 
  Currency="KES" 
  xmlns="http://www.pesapal.com" />
```

### 11. Admin Panel Features

The Pesapal integration includes a dedicated admin panel with:
- Transaction history with search and filtering
- Status tracking (pending, completed, failed)
- CSV export functionality
- Statistics dashboard
- Real-time transaction monitoring

### 12. Next Steps

1. ✅ Set up environment variables
2. ✅ Configure ngrok for callbacks
3. ✅ Test with sandbox credentials
4. ✅ Verify database transactions
5. 🔄 Test with real payment methods
6. 🔄 Move to production credentials
7. 🔄 Implement additional security measures

## 🎯 Success Indicators

- ✅ Payment URL generated successfully
- ✅ User redirected to Pesapal payment page
- ✅ Payment callback processed successfully
- ✅ Order status updated to "paid"
- ✅ Transaction recorded in database
- ✅ Admin panel shows transaction details
- ✅ Frontend shows payment success

## 📋 API Endpoints

### Payment Initiation
```
POST /api/payments/pesapal
```
**Body:**
```json
{
  "orderId": "123",
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phoneNumber": "254708374149"
}
```

### Payment Status Check
```
GET /api/payments/pesapal/status/:orderId
```

### Admin - Get All Transactions
```
GET /api/payments/pesapal/transactions
```

### Callback (Public)
```
POST /api/payments/pesapal/callback
```

## 🔧 Troubleshooting

### Payment Not Initiating
1. Check environment variables
2. Verify OAuth signature generation
3. Ensure XML payload is valid
4. Check network connectivity to Pesapal API

### Callback Not Received
1. Verify ngrok is running
2. Check callback URL in environment
3. Ensure server is accessible
4. Check Pesapal sandbox status

### Transaction Not Updating
1. Verify transaction lookup logic
2. Check database connection
3. Review callback processing logs
4. Ensure proper error handling 