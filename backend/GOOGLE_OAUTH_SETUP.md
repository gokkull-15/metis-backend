# 🔐 Google OAuth Setup Guide

## Prerequisites

To use Google OAuth, you need to set up a Google Cloud Project and get OAuth credentials.

## Steps to Configure Google OAuth

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Choose **Web application**
4. Add these URLs:
   - **Authorized JavaScript origins**: `http://localhost:3001`
   - **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback`

### 3. Update Environment Variables
Replace the placeholder values in your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

### 4. Test Google OAuth
1. Start your server: `npm start`
2. Open browser and go to: `http://localhost:3001/auth/google`
3. Complete Google sign-in process
4. You'll receive a JWT token

## Current Working Features ✅

Even without Google OAuth setup, these features work perfectly:

### 🔑 **Local Authentication**
- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Get Profile**: `GET /auth/me`
- **Update Profile**: `PUT /auth/profile`

### 📝 **Protected Post Management**
- **Create Post**: `POST /api/posts` (requires JWT)
- **Get My Posts**: `GET /api/posts/my-posts` (requires JWT)
- **Update Post**: `PUT /api/posts/:postId` (requires JWT)
- **Delete Post**: `DELETE /api/posts/:postId` (requires JWT)

### 🌐 **Public Endpoints**
- **Get All Posts**: `GET /api/posts`
- **Get Specific Post**: `GET /api/posts/:postId`

### 🔄 **Legacy Support**
- All existing endpoints still work for backward compatibility

## Testing Without Google OAuth

You can test the complete authentication system using local registration/login:

```bash
# 1. Register a user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# 2. Copy the JWT token from response

# 3. Create authenticated post
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"caption": "My post!", "hashtags": ["#test"], "imageUrl": "https://example.com/image.jpg"}'
```

## Security Features 🛡️

- **JWT Authentication** with configurable expiration
- **Password Hashing** using bcrypt
- **Protected Routes** middleware
- **User Context** in all authenticated requests
- **Input Validation** and error handling
- **CORS Configuration** for frontend integration
