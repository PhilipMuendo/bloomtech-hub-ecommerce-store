# Email Configuration Setup

This guide will help you set up email functionality for the bank transfer system.

## Prerequisites

1. A Gmail account (or any other SMTP provider)
2. App password for Gmail (if using 2-factor authentication)

## Gmail Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security > 2-Step Verification
3. Click on "App passwords"
4. Generate a new app password for "Mail"
5. Copy the generated password (16 characters)

### Step 3: Configure Environment Variables

Create or update your `.env` file in the backend directory with the following email configuration:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `your-app-password` with the app password generated in Step 2

## Alternative SMTP Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Testing Email Configuration

Run the email test script to verify your configuration:

```bash
node scripts/test-email-config.js
```

This will:
1. Test the SMTP connection
2. Send a test email
3. Verify the email was sent successfully

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure you're using an app password, not your regular password
   - Check that 2-factor authentication is enabled

2. **Connection Timeout**
   - Verify the SMTP host and port are correct
   - Check your firewall settings

3. **Email Not Received**
   - Check spam/junk folder
   - Verify the recipient email address is correct

### Gmail Specific Issues

- **"Less secure app access"**: Use app passwords instead
- **"Username and Password not accepted"**: Ensure you're using the app password, not your regular password

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of regular passwords
- Consider using environment-specific email accounts for development/production

## Bank Transfer Email Templates

The system uses two email templates:

1. **Proforma Invoice**: Sent when a bank transfer order is created
2. **Payment Confirmed**: Sent when payment is confirmed by admin

Both templates include:
- Professional HTML formatting
- Company branding
- Bank transfer details
- Payment instructions
- Order information
