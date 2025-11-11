# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Database Configuration
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bloomtech_db
DB_PORT=3306
```

### JWT Configuration
```
JWT_SECRET=your_jwt_secret_key_here
```

### Email Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

### Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### Payment Gateway Configuration
```
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_BUSINESS_SHORT_CODE=your_business_short_code
MPESA_ENVIRONMENT=sandbox

PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_ENVIRONMENT=sandbox
```

### Server Configuration
```
PORT=5000
NODE_ENV=development
```

## Frontend Environment Variables

Create a `.env` file in the root directory (frontend) with:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Google OAuth Setup Instructions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an "OAuth 2.0 Client ID"
5. Set the authorized JavaScript origins to:
   - `http://localhost:3000` (for development)
   - `http://localhost:8081` (for Vite dev server)
6. Set the authorized redirect URIs to:
   - `http://localhost:5000/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your environment variables 