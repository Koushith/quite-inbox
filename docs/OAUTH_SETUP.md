# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for SubZero.

## Overview

QuitInbox uses OAuth 2.0 with **PKCE (Proof Key for Code Exchange)** and **"Desktop app" client type** for truly secret-less authentication. This is specifically designed for public clients like SPAs and PWAs.

## Important: Desktop App vs Web Application

Google has two OAuth client types:

| Client Type | Requires Secret? | Use Case |
|------------|------------------|----------|
| **Desktop app** ✅ | **NO** | Perfect for open source, SPAs, mobile apps |
| Web application ❌ | YES | Requires secret even with PKCE |

**We use "Desktop app" type** - no secrets needed at all!

## Security Features

✅ **Truly secret-less OAuth** - Nothing sensitive in your JavaScript bundle!

**Why this is secure:**
1. **PKCE cryptographic protection** - Each auth request has a unique code challenge that cannot be intercepted
2. **No secrets to steal** - Desktop app clients don't use secrets at all
3. **Redirect URI validation** - Google strictly validates where tokens can be sent (see step 4 below)
4. **Industry standard** - Same model as mobile apps and Electron apps
5. **Perfect for open source** - Users can verify no secrets in code

**The client_id is meant to be public** - it just identifies your app to Google.

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

### 4. Create OAuth 2.0 Credentials (Desktop App)

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. **IMPORTANT: Select "Desktop app"** as the application type (NOT "Web application")
4. Enter a name: "QuitInbox Desktop Client"
5. Click **Create**
6. **Copy the Client ID** (no secret needed!)

**Important Notes:**
- Desktop app clients don't have redirect URI restrictions in Google Console
- The redirect URI is validated by the `redirect_uri` parameter in the OAuth request
- You don't need to add `http://localhost:5173` anywhere - it will work automatically
- For production, you can use the same client ID - just make sure your app's redirect_uri parameter matches your domain

### 5. Configure Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Edit `.env` and add your client ID:

```env
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
```

**Note**: You only need the client_id. Do NOT add client_secret - PKCE doesn't use it!

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

### Error: "client_id is missing"

**Cause**: The `VITE_GOOGLE_CLIENT_ID` environment variable is not set.

**Solution**:
1. Make sure you've created a `.env` file
2. Verify the client ID is correctly copied
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

2. **Set Environment Variable** in your hosting platform:
   - `VITE_GOOGLE_CLIENT_ID` (that's all you need!)

3. **Consider App Verification**:
   - For public use, submit your app for Google verification
   - This removes the "unverified app" warning for users

4. **Security Considerations**:
   - ✅ PKCE provides security without secrets
   - ✅ Ensure your redirect URIs are strictly configured
   - ✅ Monitor API usage in Google Cloud Console
   - ✅ Only authorized redirect URIs can receive tokens

## Why No Backend is Needed

With PKCE, you don't need a backend to "protect" secrets:

- **No secret exists** - PKCE uses cryptographic challenge/response
- **Simpler architecture** - Pure frontend, no server costs
- **Better privacy** - All data stays in the user's browser
- **Fully open source** - Users can verify no data is sent to your servers

This is the recommended approach for public clients and is more secure than trying to "hide" a client secret in a backend.

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Scopes](https://developers.google.com/gmail/api/auth/scopes)
- [OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
