# Detailed Pesapal Payment Gateway Integration Plan

## Overview
This document outlines the detailed steps to integrate Pesapal payment gateway into the BLOOMTECH Hub ecommerce store, ensuring harmony with existing order processing, stock management, dashboard metrics, and bulk order (quote) workflows.

---

## 1. Environment Setup
- Add the following environment variables:
  - PESAPAL_CONSUMER_KEY
  - PESAPAL_CONSUMER_SECRET
  - PESAPAL_CALLBACK_URL
  - PESAPAL_API_ENDPOINT (sandbox and production URLs)
- Securely store these in your environment configuration.

## 2. Backend Integration

### 2.1 Controller Functions (backend/controllers/paymentController.js)
- **initiatePesapalPayment(req, res):**
  - Accept orderId, amount, and user info.
  - Generate Pesapal payment request with required parameters.
  - Return payment URL or iframe link to frontend.
- **handlePesapalCallback(req, res):**
  - Receive payment status updates from Pesapal webhook.
  - Verify webhook authenticity.
  - Update corresponding order status (e.g., 'Paid', 'Failed').
  - Trigger stock decrement if not already done or confirm stock status.
- **verifyPesapalPayment(req, res):**
  - Query Pesapal API to confirm payment status.
  - Return current payment status to frontend.

### 2.2 Routes (backend/routes/paymentRoutes.js)
- POST `/pesapal` - initiate payment (auth required)
- POST `/pesapal/callback` - webhook endpoint (public)
- GET `/pesapal/status/:transactionId` - check payment status (auth required)

### 2.3 Order Status and Stock Management
- On successful payment confirmation, update order status to 'Paid'.
- Ensure stock was decremented at order creation or upon payment confirmation.
- For bulk orders (quotes converted to orders), follow the same flow.

## 3. Frontend Integration

### 3.1 UI Components
- Add Pesapal as a payment option in the checkout/payment method selection.
- Create a PesapalPaymentModal or redirect flow component.
- On payment initiation, call backend `/pesapal` endpoint to get payment URL.
- Redirect or open iframe for Pesapal payment.
- Poll or listen for payment status updates.
- Show payment success/failure messages accordingly.

### 3.2 Security
- Do not handle sensitive payment data directly.
- Use Pesapal hosted payment pages or SDK.
- Securely store and transmit authentication tokens.

## 4. Dashboard and Reporting
- Dashboard revenue and order counts will reflect updated order statuses.
- Bulk order quotes converted to orders will be included in revenue once paid.
- Ensure webhook updates trigger dashboard data refresh if cached.

## 5. Testing

### 5.1 Backend
- Test payment initiation endpoint with valid and invalid data.
- Test webhook handling with simulated Pesapal callbacks.
- Test payment status verification endpoint.
- Test order status updates and stock consistency.

### 5.2 Frontend
- Test payment UI flows for Pesapal option.
- Test redirection and iframe payment flows.
- Test payment success and failure handling.

### 5.3 Integration
- Test bulk order quote to order conversion and payment flow.
- Test dashboard updates after payments.

## 6. Deployment
- Use sandbox environment for initial testing.
- Switch to production keys and endpoints after validation.
- Monitor logs and payment transactions.

---

This detailed plan ensures a robust, secure, and seamless integration of Pesapal payment gateway into your ecommerce platform, maintaining harmony with existing order and bulk order processes.

Please review and confirm if you want me to proceed with implementation based on this plan.
