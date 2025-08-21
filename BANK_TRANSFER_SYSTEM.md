# Bank Transfer Payment System

## Overview

The BLOOMTECH Hub ecommerce store now supports bank transfer payments for orders exceeding KSH 500,000. This system provides a manual payment confirmation workflow suitable for large-value transactions.

## Features

### Automatic Bank Transfer Detection
- Orders with total value ≥ KSH 500,000 automatically require bank transfer
- System automatically sets `paymentMethod: 'bank_transfer'` for qualifying orders
- Frontend displays bank transfer option for large orders

### Proforma Invoice Generation
- System generates unique invoice numbers (format: `INV-{timestamp}-{random}`)
- Professional email templates with complete order details
- Bank account information included in invoice
- 7-day payment deadline

### Admin Payment Confirmation
- Dedicated admin interface for bank transfer orders
- Manual payment verification with reference tracking
- Email notifications to customers upon payment confirmation
- Audit logging for all payment confirmations

### Customer Experience
- Clear payment instructions and bank details
- Copy-to-clipboard functionality for bank details
- Email notifications at each step
- Order status updates

## System Architecture

### Backend Components

#### 1. Bank Transfer Controller (`backend/controllers/bankTransferController.js`)
- `generateProformaInvoice()` - Creates and sends proforma invoice
- `confirmBankTransferPayment()` - Admin payment confirmation
- `getBankTransferOrders()` - Admin order management
- `getBankDetails()` - Public bank account information

#### 2. Updated Order Controller
- Automatic payment method detection for large orders
- Bank transfer threshold: KSH 500,000

#### 3. Email Templates
- Proforma invoice template with professional styling
- Payment confirmation template
- Responsive HTML design

#### 4. Database Schema
- `Orders.paymentMethod` field (already exists)
- Supports 'bank_transfer', 'pesapal', and other methods

### Frontend Components

#### 1. Bank Transfer Payment Modal (`src/components/BankTransferPaymentModal.tsx`)
- Bank account details display
- Copy-to-clipboard functionality
- Invoice generation interface
- Payment instructions

#### 2. Updated Payment Method Selector
- Dynamic payment method display based on order amount
- Bank transfer warning for large orders
- Clear visual indicators

#### 3. Admin Bank Transfer Orders Page (`src/pages/admin/BankTransferOrders.tsx`)
- Order listing with search and filters
- Payment confirmation dialog
- Status tracking and management

## Bank Account Configuration

### Current Configuration
```javascript
const BANK_DETAILS = {
  accountName: 'BLOOMTECH HUB LIMITED',
  accountNumber: '1234567890',
  bankName: 'EQUITY BANK KENYA',
  branch: 'NAIROBI WEST',
  swiftCode: 'EQBLKEXX',
  bankCode: '068'
};
```

### Environment Variables (Recommended)
Move bank details to environment variables for security:
```env
BANK_ACCOUNT_NAME=BLOOMTECH HUB LIMITED
BANK_ACCOUNT_NUMBER=1234567890
BANK_NAME=EQUITY BANK KENYA
BANK_BRANCH=NAIROBI WEST
BANK_SWIFT_CODE=EQBLKEXX
BANK_CODE=068
```

## API Endpoints

### Public Endpoints
- `GET /api/bank-transfer/bank-details` - Get bank account information

### Protected Endpoints
- `POST /api/bank-transfer/generate-invoice/:orderId` - Generate proforma invoice
- `POST /api/bank-transfer/confirm-payment/:orderId` - Confirm payment (admin only)
- `GET /api/bank-transfer/orders` - Get bank transfer orders (admin only)

## Payment Workflow

### 1. Order Creation
1. Customer adds items to cart
2. If total ≥ KSH 500,000, system sets `paymentMethod: 'bank_transfer'`
3. Order created with 'pending' status

### 2. Checkout Process
1. Customer proceeds to checkout
2. System shows bank transfer payment option
3. Customer generates proforma invoice
4. Invoice sent to customer's email

### 3. Payment Processing
1. Customer transfers payment to bank account
2. Customer includes order number in payment reference
3. Payment must be completed within 7 days

### 4. Admin Confirmation
1. Admin receives payment notification
2. Admin verifies payment in bank account
3. Admin confirms payment in system
4. Order status updated to 'processing'
5. Customer receives confirmation email

### 5. Order Fulfillment
1. Warehouse team processes confirmed orders
2. Order status updated to 'delivered'
3. Customer receives delivery notification

## Email Templates

### Proforma Invoice Template
- Professional company branding
- Complete order details and items
- Bank account information
- Payment instructions
- 7-day deadline reminder

### Payment Confirmation Template
- Payment confirmation message
- Order details and reference
- Next steps information
- Delivery timeline

## Admin Interface

### Bank Transfer Orders Page
- **Location**: `/admin/bank-transfer-orders`
- **Access**: Admin and Superadmin only
- **Features**:
  - Order listing with search and filters
  - Payment confirmation dialog
  - Status tracking
  - Customer information display

### Payment Confirmation Process
1. Admin clicks "Confirm Payment" on pending order
2. Admin enters payment reference and amount
3. System validates amount matches order total
4. Admin adds optional notes
5. System updates order status and sends confirmation email

## Security Features

### Authentication & Authorization
- All sensitive endpoints require authentication
- Payment confirmation restricted to admin/superadmin
- Order access limited to order owner or admin

### Data Validation
- Payment amount validation against order total
- Required field validation
- Input sanitization

### Audit Logging
- All payment confirmations logged
- User actions tracked with timestamps
- Complete audit trail maintained

## Testing

### Test Script
Run the test script to verify system functionality:
```bash
cd backend
node scripts/test-bank-transfer.js
```

### Manual Testing
1. Create order with total ≥ KSH 500,000
2. Verify bank transfer payment option appears
3. Generate proforma invoice
4. Check email delivery
5. Test admin payment confirmation
6. Verify order status updates

## Configuration

### Threshold Configuration
To change the bank transfer threshold, update the constant in:
- `backend/controllers/orderController.js` (line ~150)
- `src/pages/Cart.tsx` (line ~85)
- `src/components/PaymentMethodSelector.tsx` (line ~25)

### Bank Details Configuration
Update bank details in `backend/controllers/bankTransferController.js` or move to environment variables.

## Troubleshooting

### Common Issues

#### 1. Bank Transfer Not Showing for Large Orders
- Check if order total calculation is correct
- Verify threshold constant is set correctly
- Check browser console for JavaScript errors

#### 2. Invoice Generation Fails
- Verify email service configuration
- Check user authentication
- Review server logs for errors

#### 3. Payment Confirmation Fails
- Verify admin permissions
- Check payment amount validation
- Ensure all required fields are provided

#### 4. Email Not Sending
- Check SMTP configuration
- Verify email templates
- Review email service logs

### Debug Commands
```bash
# Test bank transfer system
node backend/scripts/test-bank-transfer.js

# Check database for bank transfer orders
SELECT * FROM Orders WHERE paymentMethod = 'bank_transfer';

# Check large orders
SELECT * FROM Orders WHERE total >= 500000;
```

## Future Enhancements

### Potential Improvements
1. **Automated Payment Detection**: Integration with bank APIs for automatic payment detection
2. **Multiple Bank Accounts**: Support for multiple bank accounts
3. **Payment Tracking**: Real-time payment status tracking
4. **Invoice Management**: Advanced invoice management system
5. **Payment Reminders**: Automated payment reminder emails
6. **Currency Support**: Multi-currency bank transfer support

### Integration Opportunities
1. **Bank API Integration**: Direct integration with bank APIs
2. **Accounting Software**: Integration with accounting systems
3. **Payment Gateways**: Additional payment gateway support
4. **SMS Notifications**: SMS payment confirmations

## Support

For technical support or questions about the bank transfer system:
1. Check this documentation
2. Review server logs
3. Run test scripts
4. Contact development team

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Author**: BLOOMTECH Hub Development Team
