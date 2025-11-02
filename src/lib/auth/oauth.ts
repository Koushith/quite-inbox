import type { OAuthTokens, OAuthState } from '@/types'

// OAuth configuration
// NOTE: We use PKCE (Proof Key for Code Exchange) flow.
//
// IMPORTANT: Google Cloud Console OAuth client type:
// - Create a "Desktop app" (NOT "Web application") OAuth client
// - Desktop app clients work best with PKCE and localhost redirects
// - No need to configure authorized JavaScript origins or redirect URIs
// - The client_secret is optional but harmless if provided
//
// Security context:
// - PKCE provides cryptographic protection without requiring secrets
// - Perfect for local-first PWAs and open source projects
// - The code_verifier/code_challenge pair is what protects the flow
const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  redirectUri: window.location.origin + '/oauth/callback',
  scopes: {
    readonly: 'https://www.googleapis.com/auth/gmail.readonly',
    modify: 'https://www.googleapis.com/auth/gmail.modify',
    send: 'https://www.googleapis.com/auth/gmail.send',
  },
}

// PKCE helper functions
function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// OAuth state management (using sessionStorage for temporary state)
function saveOAuthState(state: OAuthState): void {
  sessionStorage.setItem('oauth_state', JSON.stringify(state))
}

function getOAuthState(): OAuthState | null {
  const data = sessionStorage.getItem('oauth_state')
  if (!data) return null
  return JSON.parse(data)
}

function clearOAuthState(): void {
  sessionStorage.removeItem('oauth_state')
}

// Token management (using localStorage for persistence)
export function saveTokens(tokens: OAuthTokens): void {
  const expiresAt = Date.now() + tokens.expires_in * 1000
  const tokenData = { ...tokens, expires_at: expiresAt }
  localStorage.setItem('oauth_tokens', JSON.stringify(tokenData))
}

export function getTokens(): OAuthTokens | null {
  const data = localStorage.getItem('oauth_tokens')
  if (!data) return null
  return JSON.parse(data)
}

export function clearTokens(): void {
  localStorage.removeItem('oauth_tokens')
}

export function isTokenExpired(tokens: OAuthTokens): boolean {
  return Date.now() >= tokens.expires_at
}

// Main OAuth flow
export async function startOAuthFlow(scopes: string[]): Promise<void> {
  if (!OAUTH_CONFIG.clientId) {
    throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID environment variable.')
  }

  // Generate PKCE parameters
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)

  // Save state for verification
  saveOAuthState({ codeVerifier, state, scopes })

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  })

  const authUrl = `${OAUTH_CONFIG.authEndpoint}?${params.toString()}`
  window.location.href = authUrl
}

export async function handleOAuthCallback(code: string, state: string): Promise<OAuthTokens> {
  const savedState = getOAuthState()

  if (!savedState) {
    throw new Error('No OAuth state found. Please restart the authorization flow.')
  }

  if (state !== savedState.state) {
    throw new Error('State mismatch. Possible CSRF attack.')
  }

  if (!OAUTH_CONFIG.clientId) {
    throw new Error('Google Client ID not configured.')
  }

  // Exchange authorization code for tokens with PKCE
  const tokenParams: Record<string, string> = {
    client_id: OAUTH_CONFIG.clientId,
    code,
    code_verifier: savedState.codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: OAUTH_CONFIG.redirectUri,
  }

  // Include client_secret only if provided (optional for Desktop app with PKCE)
  if (OAUTH_CONFIG.clientSecret) {
    tokenParams.client_secret = OAUTH_CONFIG.clientSecret
  }

  const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(tokenParams).toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error('Token exchange error:', error)
    console.error('Request params:', {
      client_id: OAUTH_CONFIG.clientId,
      grant_type: 'authorization_code',
      redirect_uri: OAUTH_CONFIG.redirectUri,
      has_code: !!code,
      has_verifier: !!savedState.codeVerifier,
      has_secret: !!OAUTH_CONFIG.clientSecret,
    })

    // Provide helpful error messages
    if (error.error === 'invalid_client') {
      throw new Error(
        'OAuth client configuration error. Please ensure:\n' +
        '1. You created a "Desktop app" OAuth client in Google Cloud Console\n' +
        '2. The Client ID in .env matches your OAuth client\n' +
        '3. If using "Web application" type, add http://localhost:5173/oauth/callback to authorized redirect URIs'
      )
    }

    throw new Error(`Token exchange failed: ${error.error_description || error.error || response.statusText}`)
  }

  const tokens: OAuthTokens = await response.json()

  // Save tokens and clear temporary state
  saveTokens(tokens)
  clearOAuthState()

  return tokens
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  if (!OAUTH_CONFIG.clientId) {
    throw new Error('Google Client ID not configured.')
  }

  // Build refresh token request
  const refreshParams: Record<string, string> = {
    client_id: OAUTH_CONFIG.clientId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }

  // Include client_secret only if provided
  if (OAUTH_CONFIG.clientSecret) {
    refreshParams.client_secret = OAUTH_CONFIG.clientSecret
  }

  const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(refreshParams).toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Token refresh failed: ${error.error_description || error.error || response.statusText}`)
  }

  const newTokens: OAuthTokens = await response.json()

  // Keep the refresh token if not returned
  if (!newTokens.refresh_token) {
    newTokens.refresh_token = refreshToken
  }

  saveTokens(newTokens)
  return newTokens
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = getTokens()

  if (!tokens) {
    throw new Error('Not authenticated. Please sign in.')
  }

  // Check if token is expired
  if (isTokenExpired(tokens)) {
    if (!tokens.refresh_token) {
      throw new Error('Token expired and no refresh token available. Please sign in again.')
    }

    const newTokens = await refreshAccessToken(tokens.refresh_token)
    return newTokens.access_token
  }

  return tokens.access_token
}

export function isAuthenticated(): boolean {
  const tokens = getTokens()
  return tokens !== null
}

export function logout(): void {
  clearTokens()
  clearOAuthState()
}

export const GMAIL_SCOPES = OAUTH_CONFIG.scopes
