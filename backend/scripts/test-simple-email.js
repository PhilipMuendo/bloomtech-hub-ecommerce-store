import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function testSimpleEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configured***' : 'NOT SET');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 465, // Try port 465 with SSL
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });
    
    console.log('Transporter created, testing connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `Bloomtech Hub <${process.env.SMTP_USER}>`,
      to: 'test@example.com',
      subject: 'Test Email from Bloomtech Hub',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify SMTP configuration.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('1. Gmail username and password are correct');
      console.log('2. 2-factor authentication is enabled on Gmail');
      console.log('3. App password is generated correctly');
      console.log('4. Less secure app access is enabled (if using regular password)');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection timeout. Please check:');
      console.log('1. Internet connection is working');
      console.log('2. Firewall is not blocking SMTP port 587');
      console.log('3. Try using port 465 with secure: true');
    }
  }
}

testSimpleEmail(); 