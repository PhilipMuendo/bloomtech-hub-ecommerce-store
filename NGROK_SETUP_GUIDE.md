# Ngrok Setup Guide for BLOOMTECH Hub

This guide will help you set up ngrok to expose your local development server for testing payment gateways and external integrations.

## Prerequisites

- ngrok is already installed (version 3.22.1)
- Your frontend runs on port 8081
- Your backend runs on port 5000

## Step 1: Start Your Development Servers

First, start both your frontend and backend servers:

### Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Start Frontend
```bash
npm run dev
```

## Step 2: Expose Frontend with Ngrok

Since your frontend proxies API calls to the backend, you only need to expose the frontend port:

```bash
ngrok http 8081
```

This will give you a public URL like: `https://abc123.ngrok.io`

## Step 3: Update CORS Configuration

You need to update your backend CORS settings to allow the ngrok URL:

### Update backend/server.js
Add your ngrok URL to the CORS origins:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:3000',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:3000',
    'https://your-ngrok-url.ngrok.io', // Add your ngrok URL here
    'https://*.ngrok.io' // Or allow all ngrok URLs
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Step 4: Update Environment Variables

### For Payment Gateways

Update your payment gateway configurations to use the ngrok URL:

#### Pesapal Configuration
If you're using Pesapal, update your callback URLs:
- IPN URL: `https://your-ngrok-url.ngrok.io/api/payments/pesapal/ipn`
- Result URL: `https://your-ngrok-url.ngrok.io/api/payments/pesapal/result`

#### Flutterwave Configuration
If you're using Flutterwave, update your webhook URL:
- Webhook URL: `https://your-ngrok-url.ngrok.io/api/payments/flutterwave/webhook`

## Step 5: Test Your Setup

1. **Test Frontend**: Visit your ngrok URL in a browser
2. **Test API**: Try accessing `https://your-ngrok-url.ngrok.io/api/products`
3. **Test Authentication**: Try logging in through the ngrok URL
4. **Test Payment Flow**: Complete a test purchase

## Step 6: Ngrok Dashboard

Access the ngrok dashboard to monitor requests:
- Go to `http://localhost:4040` in your browser
- This shows all incoming requests and their details
- Useful for debugging payment webhooks

## Important Notes

### 1. Ngrok URL Changes
- Free ngrok URLs change each time you restart ngrok
- For consistent testing, consider upgrading to a paid plan for fixed URLs

### 2. HTTPS vs HTTP
- Ngrok provides HTTPS URLs by default
- Payment gateways require HTTPS for security
- Your local development uses HTTP, but ngrok handles the HTTPS conversion

### 3. Webhook Testing
- Payment gateways will send webhooks to your ngrok URL
- Monitor the ngrok dashboard to see incoming webhook requests
- Check your server logs for webhook processing

### 4. Database Considerations
- Your local database will be used for all transactions
- Test data will be stored in your local MySQL database
- Consider using a separate test database for payment testing

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Make sure your ngrok URL is in the CORS origins list
2. Restart your backend server after updating CORS
3. Clear browser cache

### Payment Gateway Issues
1. Verify callback URLs are correct
2. Check that webhooks are reaching your server
3. Monitor ngrok dashboard for failed requests
4. Check server logs for error messages

### Connection Issues
1. Ensure both frontend and backend are running
2. Verify ngrok is exposing the correct port (8081)
3. Check that your firewall isn't blocking ngrok

## Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
npm run dev

# Start ngrok (in new terminal)
ngrok http 8081

# View ngrok dashboard
# Open http://localhost:4040 in browser
```

## Security Considerations

1. **Temporary Exposure**: ngrok URLs are publicly accessible
2. **Test Data Only**: Use test payment credentials
3. **Monitor Traffic**: Check ngrok dashboard regularly
4. **Disable When Not Testing**: Stop ngrok when not actively testing

## Next Steps

1. Set up your payment gateway test accounts
2. Configure webhook URLs in your payment gateway dashboard
3. Test the complete payment flow
4. Monitor webhook delivery and processing
5. Test error scenarios and edge cases

Your ngrok setup is now ready for payment gateway testing! 