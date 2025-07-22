# Comprehensive Testing Plan for BLOOMTECH Hub Ecommerce Store

## Overview
This document outlines a thorough testing plan for the entire application, focusing on the newly integrated Pesapal payment gateway, order processing, stock management, dashboard updates, and bulk order workflows.

---

## 1. Testing Setup
- Since no testing framework is currently set up, manual testing will be performed.
- Automated testing setup (e.g., Jest, Mocha) can be added later for continuous integration.

## 2. Frontend Testing

### 2.1 Pages and Components to Test
- Checkout and Payment pages (including Pesapal payment option)
- Cart page
- Order confirmation and status pages
- Bulk order quote request and approval pages
- Dashboard pages showing revenue, orders, and quotes
- User account pages related to orders and payments

### 2.2 Test Scenarios
- Navigate through all pages and verify UI elements render correctly.
- Test payment flow with Pesapal:
  - Initiate payment and verify redirection or iframe loads.
  - Simulate payment success, failure, and cancellation.
  - Verify UI updates and messages.
- Test order creation and stock decrement.
- Test bulk order quote creation, approval, and conversion to order.
- Test dashboard data updates after payments.
- Test error handling and edge cases (e.g., insufficient stock, invalid inputs).

## 3. Backend Testing

### 3.1 Endpoints to Test
- Payment endpoints:
  - POST /api/payments/pesapal
  - POST /api/payments/pesapal/callback
  - GET /api/payments/pesapal/status/:orderId
- Order endpoints:
  - GET /api/orders
  - POST /api/orders
  - PATCH /api/orders/:id
- Quote endpoints:
  - POST /api/quotes
  - GET /api/quotes
  - PATCH /api/quotes/:id
  - POST /api/quotes/:id/create-order
- Dashboard endpoints:
  - GET /api/dashboard/summary
  - GET /api/dashboard/revenue-trend
  - GET /api/dashboard/orders-by-category

### 3.2 Test Scenarios
- Happy path tests for all endpoints.
- Validation tests for required fields and data formats.
- Authorization tests for protected endpoints.
- Payment webhook simulation and order status updates.
- Stock verification before order creation.
- Duplicate payment prevention logic.
- Payment timeout handling (simulate 15-minute expiry).
- Error and edge case handling.

## 4. Manual Testing Instructions

### 4.1 Payment Flow
- Place an order with items in stock.
- Initiate Pesapal payment and complete payment in sandbox mode.
- Verify order status updates to "Paid".
- Check stock levels decrement accordingly.
- Verify confirmation email is sent.
- Test payment cancellation and failure scenarios.

### 4.2 Bulk Order Flow
- Submit a bulk order quote request.
- Approve quote as admin and create order.
- Initiate payment for bulk order.
- Verify all related updates and dashboard metrics.

## 5. Reporting
- Document any bugs, UI issues, or performance problems.
- Provide screenshots and logs for failures.
- Suggest improvements or fixes.

---

This plan ensures thorough coverage of all critical application areas to guarantee a robust and reliable ecommerce platform.

Please confirm if you want me to proceed with manual testing based on this plan or if you want to set up automated testing first.
