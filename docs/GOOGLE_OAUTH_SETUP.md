# Google OAuth Login Setup Guide

## What's Been Implemented

### Backend Changes
1. **Installed Dependencies**: Added `google-auth-library` package
2. **Updated User Model**: Added OAuth fields (`googleId`, `googleEmail`, `googleName`, `googlePicture`, `authProvider`)
3. **Database Migration**: Created and ran migration to add OAuth fields to Users table
4. **Auth Controller**: Added `googleAuth` and `getGoogleAuthUrl` functions
5. **Auth Routes**: Added `/api/auth/google` and `/api/auth/google/url` endpoints
6. **AuthContext**: Added `googleLogin` function to handle Google authentication

### Frontend Changes
1. **GoogleLoginButton Component**: Created reusable Google OAuth button
2. **Updated Login Page**: Added Google login option with "Or continue with" divider
3. **AuthContext Integration**: Connected Google login to the authentication system

##  Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Set authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:8081`
     - `http://localhost:5173` (Vite default)
   - Set authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
5. Copy the Client ID and Client Secret

### 2. Environment Variables

#### Backend (.env file in backend directory)
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

#### Frontend (.env file in root directory)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Database Migration

The migration has already been run, but if you need to run it again:
```bash
cd backend
node scripts/run-oauth-migration.js
```

## 🚀 How It Works

### Authentication Flow
1. User clicks "Sign in with Google" button
2. Google Identity Services loads and renders the button
3. User authenticates with Google
4. Google returns an ID token
5. Frontend sends the ID token to `/api/auth/google`
6. Backend verifies the token with Google
7. Backend creates or updates user in database
8. Backend returns JWT token for the user
9. Frontend stores the token and logs user in

### Features
- ✅ Automatic user creation for new Google users
- ✅ Automatic email verification for Google users
- ✅ Profile picture and name from Google
- ✅ Seamless integration with existing auth system
- ✅ Proper error handling and user feedback
- ✅ Responsive design with proper styling

## 🧪 Testing

### Backend Testing
```bash
# Test Google OAuth URL endpoint
curl http://localhost:5000/api/auth/google/url

# Test Google OAuth login (requires valid ID token)
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"your_google_id_token"}'
```

### Frontend Testing
1. Start the frontend development server
2. Navigate to the login page
3. Click "Sign in with Google"
4. Complete Google authentication
5. Verify successful login and redirect

## 🔒 Security Features

- ✅ ID token verification with Google
- ✅ Secure JWT token generation
- ✅ User role and status validation
- ✅ Automatic account verification
- ✅ Proper error handling
- ✅ CORS configuration for OAuth

## 📝 API Endpoints

### GET /api/auth/google/url
Returns the Google OAuth authorization URL.

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### POST /api/auth/google
Authenticates a user with Google ID token.

**Request:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Response:**
```json
{
  "message": "Google authentication successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "verified": true,
    "authProvider": "google",
    "googlePicture": "https://..."
  }
}
```

## 🎨 UI Components

### GoogleLoginButton
- Renders Google's official sign-in button
- Handles authentication flow
- Integrates with toast notifications
- Responsive design
- Loading states

### Login Page Updates
- Added "Or continue with" divider
- Integrated Google login button
- Maintains existing functionality
- Consistent styling

## 🐛 Troubleshooting

### Common Issues

1. **"Client ID is undefined"**
   - Check that `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
   - Check that `GOOGLE_CLIENT_ID` is set in backend `.env`

2. **"Invalid redirect URI"**
   - Verify redirect URI in Google Cloud Console matches your setup
   - Check that `GOOGLE_REDIRECT_URI` is set correctly

3. **"Google button not loading"**
   - Check browser console for JavaScript errors
   - Verify Google Identity Services script is loading
   - Check network connectivity

4. **"Authentication failed"**
   - Verify Google+ API is enabled in Google Cloud Console
   - Check that OAuth credentials are correct
   - Verify database migration ran successfully

### Debug Steps
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test backend endpoints directly
4. Check database for OAuth fields
5. Verify Google Cloud Console settings

## 📚 Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/) 