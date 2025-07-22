# Pesapal Payment Gateway Integration Plan

## Overview
Integrate Pesapal payment gateway into the BLOOMTECH Hub ecommerce store to provide a secure and reliable payment option.

## Backend Integration

1. **Environment Setup**
   - Add Pesapal API credentials to environment variables:
     - PESAPAL_CONSUMER_KEY
     - PESAPAL_CONSUMER_SECRET
     - PESAPAL_CALLBACK_URL
     - PESAPAL_API_ENDPOINT (sandbox and production URLs)

2. **Controller Functions**
   - Create controller functions to:
     - `initiatePesapalPayment(req, res)`: Create payment request and redirect URL using Pesapal API.
     - `handlePesapalCallback(req, res)`: Handle payment status callbacks/webhooks from Pesapal.
     - `verifyPesapalPayment(req, res)`: Verify payment status by querying Pesapal API.

3. **Routes**
   - Add routes in paymentRoutes.js:
     - POST `/pesapal` - initiate payment (auth required)
     - POST `/pesapal/callback` - webhook endpoint (public)
     - GET `/pesapal/status/:transactionId` - check payment status (auth required)

4. **Security**
   - Validate and sanitize all inputs.
   - Authenticate users on payment initiation and status check endpoints.
   - Verify webhook signatures to ensure authenticity.
   - Use HTTPS for all endpoints.
   - Store API keys securely in environment variables.

## Frontend Integration

1. **UI Components**
   - Add Pesapal payment option in payment method selection UI.
   - Create PesapalPaymentModal or redirect flow component.
   - Use Pesapal's iframe or redirect payment flow as per their documentation.

2. **Payment Flow**
   - On user selecting Pesapal and submitting payment:
     - Call backend initiatePesapalPayment endpoint.
     - Redirect or open iframe for Pesapal payment.
     - Handle success and failure callbacks.
     - Poll or listen for payment status updates.

3. **Security**
   - Do not store sensitive payment data on frontend.
   - Use Pesapal SDK or hosted payment pages for secure processing.

## Testing

- Test payment initiation, success, failure, and cancellation flows.
- Test webhook handling and payment status updates.
- Test frontend UI and user experience.
- Test error handling and edge cases.

## Deployment

- Use environment-specific API keys.
- Monitor payment transactions and logs.
- Ensure webhook endpoint is publicly accessible and secured.

---

This plan ensures a secure, modular, and maintainable integration of Pesapal payment gateway into your ecommerce store.

Next steps: Implement backend controller and routes, then frontend components.
