import dotenv from 'dotenv';
import { testEmailConfig, sendTemplatedEmail } from '../utils/emailService.js';

// Load environment variables
dotenv.config();

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ Not set');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ Not set');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ Not set');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set');

  // Test 1: Verify SMTP connection
  console.log('\n1. Testing SMTP connection...');
  try {
    const isConfigValid = await testEmailConfig();
    if (isConfigValid) {
      console.log('✅ SMTP connection successful');
    } else {
      console.log('❌ SMTP connection failed');
      return;
    }
  } catch (error) {
    console.log('❌ SMTP connection error:', error.message);
    return;
  }

  // Test 2: Send test email
  console.log('\n2. Sending test email...');
  try {
    const testEmail = process.env.SMTP_USER || 'test@example.com';
    
    await sendTemplatedEmail({
      to: testEmail,
      subject: 'Test Email - Bank Transfer System',
      template: 'payment-confirmed',
      data: {
        customerName: 'Test Customer',
        orderNumber: 'TEST-ORDER-123',
        paymentReference: 'TEST-REF-456',
        amount: 500000,
        nextSteps: [
          'Your order will be processed within 24 hours',
          'You will receive a confirmation email',
          'Your items will be shipped to your address'
        ]
      }
    });

    console.log('✅ Test email sent successfully');
    console.log(`📧 Check your email: ${testEmail}`);

  } catch (error) {
    console.log('❌ Test email failed:', error.message);
  }

  // Test 3: Test proforma invoice template
  console.log('\n3. Testing proforma invoice template...');
  try {
    const testEmail = process.env.SMTP_USER || 'test@example.com';
    
    await sendTemplatedEmail({
      to: testEmail,
      subject: 'Test Proforma Invoice - Bank Transfer System',
      template: 'proforma-invoice',
      data: {
        invoiceNumber: 'INV-TEST-001',
        orderNumber: 'BT-TEST-123',
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        customer: {
          name: 'Test Customer',
          email: testEmail,
          phone: '+254700000000'
        },
        items: [
          {
            name: 'Test Product 1',
            sku: 'TEST-001',
            quantity: 2,
            unitPrice: 250000,
            total: 500000
          }
        ],
        total: 500000,
        bankDetails: {
          accountName: 'BLOOMTECH HUB LIMITED',
          accountNumber: '1234567890',
          bankName: 'Test Bank',
          branch: 'Nairobi Main Branch',
          swiftCode: 'TESTKEXX',
          bankCode: '12345'
        },
        paymentInstructions: [
          'Transfer the exact amount to the provided bank account',
          'Include your order number in the payment reference',
          'Payment must be completed within 7 days',
          'Order will be processed once payment is confirmed'
        ]
      }
    });

    console.log('✅ Proforma invoice test email sent successfully');
    console.log(`📧 Check your email: ${testEmail}`);

  } catch (error) {
    console.log('❌ Proforma invoice test failed:', error.message);
  }

  console.log('\n✅ Email configuration test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check your email for the test messages');
  console.log('2. Verify the email content and formatting');
  console.log('3. If emails are not received, check spam folder');
  console.log('4. Update your .env file if needed');
}

// Run the test
testEmailConfiguration().catch(console.error);
