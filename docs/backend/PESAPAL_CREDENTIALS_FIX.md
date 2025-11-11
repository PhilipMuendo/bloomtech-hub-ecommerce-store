# 🔧 Pesapal Authentication Fix Guide

## **Issue Identified**
The Pesapal authentication is failing with error: `"invalid_consumer_key_or_secret_provided"`

## **Root Cause**
The Pesapal credentials in `backend/pesapal.env` are **invalid or expired**.

## **Current Credentials (INVALID)**
```
PESAPAL_CONSUMER_KEY="BLnzXZlrXWQr/YfH/Vw5G00aPAmvj9cc"
PESAPAL_CONSUMER_SECRET="m62lrPtNqjfLGEWOadUaH7oO7Eo="
```

## **How to Fix**

### **Step 1: Get Valid Pesapal Credentials**
1. **Login to Pesapal Dashboard**: https://developer.pesapal.com/
2. **Go to API Credentials**: Navigate to your API credentials section
3. **Generate New Credentials**: Create new Consumer Key and Consumer Secret
4. **Copy the Credentials**: Save both the Consumer Key and Consumer Secret

### **Step 2: Update the Environment File**
Edit `backend/pesapal.env` and replace the credentials:

```env
# Pesapal Sandbox Configuration (Updated)

PESAPAL_CONSUMER_KEY="YOUR_NEW_CONSUMER_KEY_HERE"
PESAPAL_CONSUMER_SECRET="YOUR_NEW_CONSUMER_SECRET_HERE"
PESAPAL_CALLBACK_URL="https://c82e41ec66ff.ngrok-free.app/api/payments/pesapal/callback"
PESAPAL_API_ENDPOINT="https://cybqa.pesapal.com/pesapalv3/api"
BACKEND_URL="https://c82e41ec66ff.ngrok-free.app"
FRONTEND_URL="http://localhost:8081"
NODE_ENV="development"
```

### **Step 3: Test the Fix**
Run the test script to verify the credentials work:

```bash
cd backend
node test-pesapal-auth.js
```

### **Step 4: Restart the Server**
After updating the credentials, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
# or
node server.js
```

## **Important Notes**

### **Environment Selection**
- **Sandbox**: Use `https://cybqa.pesapal.com/pesapalv3/api` (current)
- **Production**: Use `https://pay.pesapal.com/v3/api`

### **Credential Format**
- **Consumer Key**: Usually 32 characters, alphanumeric
- **Consumer Secret**: Usually 28 characters, base64 encoded
- **No Quotes**: Remove quotes if they cause issues

### **Common Issues**
1. **Wrong Environment**: Using production credentials in sandbox
2. **Expired Credentials**: Credentials have expired
3. **Format Issues**: Extra spaces or special characters
4. **IP Restrictions**: Your IP might be blocked

## **Verification**
After fixing, you should see:
```
✅ Authentication successful!
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## **Next Steps**
Once authentication is working:
1. Test payment initiation
2. Test IPN registration
3. Test complete payment flow

## **Support**
If you continue having issues:
1. Check Pesapal documentation
2. Contact Pesapal support
3. Verify your account status
