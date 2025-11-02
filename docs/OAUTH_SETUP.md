# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for SubZero.

## Overview

SubZero uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for authentication. While PKCE adds security for client-side apps, Google still requires a client secret for token exchange.

## Important Security Note

⚠️ **For browser-based applications, the OAuth client secret cannot be kept truly secret.** This is a known limitation of OAuth in Single Page Applications (SPAs). The secret will be visible in your JavaScript bundle.

This is acceptable because:
1. PKCE provides additional security against authorization code interception
2. The redirect URI is strictly validated by Google
3. This is a standard practice for SPAs (used by many public applications)
4. The secret alone cannot be used to access user data without the authorization code

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "SubZero Gmail Client")
4. Click "Create"

### 2. Enable Gmail API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: SubZero
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. On the "Scopes" page, click **Add or Remove Scopes**
7. Add these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify` (optional)
   - `https://www.googleapis.com/auth/gmail.send` (optional)
8. Click **Update** → **Save and Continue**
9. Add test users (your email address)
10. Click **Save and Continue** → **Back to Dashboard**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Enter a name: "SubZero Web Client"
5. Add **Authorized JavaScript origins**:
   - For development: `http://localhost:5173`
   - For production: `https://your-domain.com`
6. Add **Authorized redirect URIs**:
   - For development: `http://localhost:5173/oauth/callback`
   - For production: `https://your-domain.com/oauth/callback`
7. Click **Create**
8. **IMPORTANT**: Copy both the **Client ID** and **Client Secret**

### 5. Configure Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

### 6. Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Click "Sign in with Google"

4. You should see the Google OAuth consent screen

5. Grant the requested permissions

6. You should be redirected back to SubZero

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI doesn't exactly match what's configured in Google Cloud Console.

**Solution**:
- Check that the redirect URI in Google Cloud Console exactly matches your app's URL
- For development: `http://localhost:5173/oauth/callback`
- No trailing slashes
- Port number must match

### Error: "client_secret is missing"

**Cause**: The `VITE_GOOGLE_CLIENT_SECRET` environment variable is not set.

**Solution**:
1. Make sure you've created a `.env` file
2. Verify the client secret is correctly copied
3. Restart the dev server after changing `.env`

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not properly configured or missing scopes.

**Solution**:
1. Complete the OAuth consent screen configuration
2. Make sure all required scopes are added
3. Add your email as a test user

### Error: "The app is not verified"

**Cause**: Your app is in testing mode and not verified by Google.

**Solution**: This is expected during development. Click "Advanced" → "Go to SubZero (unsafe)" to proceed. For production, you'll need to submit your app for verification.

## Production Deployment

When deploying to production:

1. **Update OAuth Redirect URIs** in Google Cloud Console:
   - Add your production domain's JavaScript origin
   - Add your production domain's callback URI

2. **Set Environment Variables** in your hosting platform:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_SECRET`

3. **Consider App Verification**:
   - For public use, submit your app for Google verification
   - This removes the "unverified app" warning for users

4. **Security Considerations**:
   - The client secret will be visible in your JavaScript bundle
   - Ensure your redirect URIs are strictly configured
   - Monitor API usage in Google Cloud Console

## Alternative Setup (More Secure)

For better security, you can add a minimal backend:

1. Create a serverless function (e.g., Vercel, Netlify, or Cloudflare Workers)
2. Keep the client secret on the server
3. Have the backend handle token exchange
4. Frontend calls your backend instead of Google directly

This approach keeps the client secret truly secret but requires a backend component.

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Scopes](https://developers.google.com/gmail/api/auth/scopes)
- [OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
