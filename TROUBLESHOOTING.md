# Troubleshooting Guide

## OAuth Issues

### Error: "Token exchange failed: Bad Request" (400)

This error usually occurs during the OAuth callback. Here's how to diagnose and fix it:

#### Step 1: Check Your .env File

Make sure both variables are set correctly:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
```

**Important**: After changing `.env`, you MUST restart the dev server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### Step 2: Check Browser Console

Open your browser's Developer Tools (F12) and look for:

1. **Console Tab**: Look for "Token exchange error:" - this will show the actual error from Google
2. **Network Tab**: Find the POST request to `oauth2.googleapis.com/token` and check:
   - Request Payload: Verify all parameters are present
   - Response: Check Google's error message

Common OAuth errors:

- **`redirect_uri_mismatch`**: Your redirect URI doesn't match what's in Google Cloud Console
  - Fix: Make sure `http://localhost:5173/oauth/callback` is EXACTLY in your OAuth credentials

- **`invalid_client`**: Client ID or Secret is wrong
  - Fix: Double-check you copied both correctly from Google Cloud Console

- **`invalid_grant`**: Authorization code expired or already used
  - Fix: Try the OAuth flow again from the beginning

#### Step 3: Verify Google Cloud Console Settings

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Verify:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5173/oauth/callback`
   - Note: No trailing slashes, exact port number

#### Step 4: Common Mistakes

1. **Forgot to restart dev server** after changing `.env`
2. **Trailing slash** in redirect URI (`/oauth/callback/` ❌ vs `/oauth/callback` ✅)
3. **Wrong port number** (5173 vs 5174)
4. **Using http instead of https** (for localhost, http is correct)
5. **Client Secret has spaces** (copy-paste issue - remove any spaces)

#### Step 5: Test OAuth Configuration

Try this minimal test:

1. Clear your browser cache and cookies for localhost
2. Close all localhost:5173 tabs
3. Restart your dev server
4. Open http://localhost:5173 in a **private/incognito window**
5. Try signing in again

### Error: Headers Undefined / Cannot Read Properties

This has been fixed in the latest version. Make sure you have the latest code:

```bash
# Pull latest changes if using git
git pull
```

The app now handles missing headers gracefully.

## Gmail API Issues

### Error: "Not authenticated"

The access token expired. Try:

1. Logging out (click Logout button)
2. Signing in again

### Error: "Quota exceeded"

You've hit Gmail API rate limits. Wait a few minutes and try again.

Solutions:
- Reduce the time range for scanning (use 3 months instead of all time)
- Wait 60 seconds between large scans

### Scan Returns No Results

Possible causes:

1. **No promotional emails**: The scan looks for emails in Promotions/Forums/Updates categories
2. **Time range too narrow**: Try "All Time" instead of "3 months"
3. **Gmail categories not enabled**: Some Gmail accounts don't use categories

## Build Issues

### Node Version Error

```
Vite requires Node.js version 20.19+ or 22.12+
```

**Solution**: Upgrade Node.js

```bash
# Using nvm
nvm install 22
nvm use 22

# Or download from https://nodejs.org/
```

### Tailwind CSS Errors

If you see PostCSS or Tailwind errors:

```bash
npm install -D @tailwindcss/postcss
```

## Development Issues

### Hot Reload Not Working

Try:

1. Clear browser cache
2. Restart dev server
3. Check for TypeScript errors: `npm run build`

### Environment Variables Not Loading

Make sure:

1. File is named `.env` (not `.env.txt` or similar)
2. Variables start with `VITE_`
3. Server was restarted after changing `.env`
4. No quotes around values (just `VITE_VAR=value`, not `VITE_VAR="value"`)

## Getting Help

If none of the above helps:

1. **Check the browser console** for error messages
2. **Check the Network tab** to see what requests are failing
3. **Try the OAuth flow in an incognito window**
4. **Double-check all settings** in Google Cloud Console

### Debugging Tips

Enable verbose logging by opening browser console and running:

```javascript
localStorage.setItem('debug', 'true')
```

Then refresh and check the console for detailed logs.

### Still Stuck?

Create an issue with:
- The exact error message from the console
- Your Node.js version (`node --version`)
- Browser and version
- Steps to reproduce
- Screenshot of the error
