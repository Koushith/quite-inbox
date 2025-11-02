# Security Review - SubZero App

**Date**: November 2, 2025
**Reviewer**: Claude (Automated Security Analysis)
**Status**: Pre-Launch Security Assessment

---

## Executive Summary

SubZero is a **local-first, privacy-focused Gmail subscription manager** built as a Progressive Web App (PWA). The application has been designed with security in mind, but there are several important considerations before public launch.

**Overall Security Rating**: ⚠️ **MODERATE RISK** - Requires configuration and deployment best practices

---

## ✅ Security Strengths

### 1. **Local-First Architecture**
- ✅ All email data is processed in the browser
- ✅ No backend server storing user data
- ✅ Uses IndexedDB for local storage only
- ✅ No third-party analytics or tracking

### 2. **OAuth 2.0 with PKCE**
- ✅ Uses Google OAuth with PKCE flow (most secure)
- ✅ Minimum required scopes (gmail.readonly by default)
- ✅ Optional scopes (gmail.modify, gmail.send) require explicit user consent
- ✅ Access tokens stored in memory only

### 3. **Input Validation**
- ✅ Protected keywords/domains validated (trimmed, lowercased)
- ✅ Duplicate prevention in settings
- ✅ Type safety with TypeScript

### 4. **Gmail API Security**
- ✅ Uses exponential backoff for quota handling
- ✅ Batch requests to minimize API calls
- ✅ Format=metadata to minimize data fetched

---

## 🔴 Critical Security Issues

### 1. **OAuth Client Secret Exposure** 🚨

**Issue**: The OAuth configuration needs to be properly secured for production.

**Current State**:
- Using PKCE flow (good!)
- But OAuth credentials likely in environment variables

**Required Actions**:
```bash
# NEVER commit these to git:
- CLIENT_ID (okay to expose in frontend)
- CLIENT_SECRET (DO NOT include if using PKCE properly)
- REDIRECT_URI (must match Google Console exactly)
```

**Recommendations**:
1. ✅ Use PKCE without client secret (already done)
2. ⚠️ Add `.env` to `.gitignore` (verify this)
3. ⚠️ Set up environment variables in deployment platform
4. ⚠️ Restrict OAuth app to specific domains in Google Console

---

### 2. **Cross-Site Scripting (XSS) Prevention** ⚠️

**Potential Risks**:
- Displaying email subjects, senders, snippets from Gmail

**Current Mitigation**:
- React automatically escapes values ✅
- No `dangerouslySetInnerHTML` usage ✅

**Remaining Concerns**:
```typescript
// Line src/routes/Subscriptions.tsx:575-577
const subject = email.headers?.find((h: any) => h.name === 'Subject')?.value || '(No subject)'
const snippet = email.snippet || ''
```

**Recommendation**:
- Add DOMPurify library for extra sanitization if displaying HTML email bodies
- Current implementation is SAFE as long as not rendering HTML

**Action**: ✅ No immediate action needed (React handles this)

---

### 3. **Unsubscribe Link Safety** ⚠️

**Issue**: The app opens unsubscribe links from emails, which could be malicious.

**Current Mitigation**:
```typescript
// src/lib/actions/unsubscribe.ts:38-52
// ✅ HTTPS validation for one-click unsubscribe
if (urlObj.protocol !== 'https:') {
  throw new Error('One-click unsubscribe URL must use HTTPS')
}

// ✅ Protocol validation for HTTP links
if (!['http:', 'https:'].includes(urlObj.protocol)) {
  throw new Error('Invalid unsubscribe URL protocol')
}
```

**Remaining Risks**:
- No domain allowlist/blocklist
- No phishing URL detection
- Users could be redirected to malicious sites

**Recommendations**:
1. ⚠️ **Add domain warning**: Show domain prominently before opening
2. ⚠️ **Add confirmation dialog**: "Are you sure you want to open [domain]?"
3. ⚠️ **Implement URL reputation check**: Use Google Safe Browsing API (optional)
4. ⚠️ **Add user education**: Warn about clicking suspicious links

**Action Required**:
```typescript
// TODO: Add this to unsubscribe flow
function validateUnsubscribeUrl(url: string): { safe: boolean; warning?: string } {
  const parsed = new URL(url)

  // Check for suspicious patterns
  if (parsed.hostname.includes('localhost') || parsed.hostname.includes('127.0.0.1')) {
    return { safe: false, warning: 'Localhost URL detected' }
  }

  // Check for IP addresses (often malicious)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) {
    return { safe: false, warning: 'IP address detected' }
  }

  return { safe: true }
}
```

---

### 4. **Content Security Policy (CSP)** ⚠️

**Issue**: No CSP headers configured.

**Recommendation**: Add CSP meta tag or headers:

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://gmail.googleapis.com https://oauth2.googleapis.com https://accounts.google.com;
  img-src 'self' data: https:;
  frame-ancestors 'none';
">
```

**Action Required**: Add CSP headers in deployment configuration

---

## 🟡 Medium Risk Issues

### 5. **Rate Limiting & DoS Protection**

**Issue**: No rate limiting on Gmail API calls from malicious users.

**Current Mitigation**:
- Google's API quotas apply ✅
- Exponential backoff implemented ✅

**Remaining Risk**:
- A user could exhaust their own quota quickly
- No protection against rapid repeated scans

**Recommendation**:
```typescript
// Add scan cooldown
const SCAN_COOLDOWN_MS = 60000 // 1 minute

let lastScanTime = 0

function canStartScan(): boolean {
  const now = Date.now()
  if (now - lastScanTime < SCAN_COOLDOWN_MS) {
    return false
  }
  lastScanTime = now
  return true
}
```

**Priority**: Medium (users can only hurt themselves)

---

### 6. **Data Storage Security**

**Issue**: IndexedDB is not encrypted.

**Current State**:
- Stores sender groups, action logs, settings
- No sensitive data (passwords, tokens) ✅
- Access tokens in memory only ✅

**Risk**:
- Browser extensions or malware could read IndexedDB
- Metadata leakage (which senders user has, email counts)

**Mitigation Options**:
1. Accept the risk (reasonable for this app)
2. Add encryption with user-derived key (complex, hurts UX)
3. Add warning in privacy policy

**Recommendation**: ✅ **Accept risk** - metadata is not highly sensitive

---

### 7. **Dependency Vulnerabilities**

**Action Required**:
```bash
# Run before launch
npm audit

# Fix any critical or high vulnerabilities
npm audit fix

# For unfixable issues, assess risk manually
```

**Current Status**: ⚠️ **Not checked in this review**

**Recommendation**: Run `npm audit` and address all HIGH/CRITICAL issues

---

## 🟢 Low Risk / Informational

### 8. **Privacy Policy Required**

**Legal Requirement**: ✅ Must have a privacy policy

**Required Disclosures**:
1. What data is collected (email metadata, sender info)
2. Where it's stored (browser IndexedDB only)
3. What it's used for (subscription management)
4. Third-party access (Google OAuth only)
5. Data retention (until user clears browser data)
6. User rights (export, delete all data)

**Action**: Create `/PRIVACY.md` and link from app

---

### 9. **Terms of Service**

**Recommended**:
- Liability disclaimer
- "Use at your own risk" clause
- No warranty statement
- DMCA compliance (if applicable)

---

### 10. **Google OAuth Verification**

**Issue**: App uses unverified OAuth scope.

**Current State**:
- Shows scary warning screen before first login

**To Get Verified**:
1. Submit app for Google OAuth verification
2. Provide privacy policy
3. Show demo video
4. Answer security questionnaire
5. Wait 4-6 weeks for approval

**Recommendation**: ⚠️ **Required for production** - Users will see "Unverified App" warning otherwise

---

## 🔒 Pre-Launch Checklist

### Must Do Before Public Launch:

- [ ] **1. Add CSP headers** (Critical)
- [ ] **2. Run `npm audit` and fix vulnerabilities** (Critical)
- [ ] **3. Verify `.env` in `.gitignore`** (Critical)
- [ ] **4. Create Privacy Policy** (Legal requirement)
- [ ] **5. Submit for Google OAuth verification** (User experience)
- [ ] **6. Add unsubscribe link warnings** (Security)
- [ ] **7. Add scan cooldown** (DoS protection)
- [ ] **8. Test with malicious inputs** (Penetration testing)
- [ ] **9. Set up error logging/monitoring** (Production readiness)
- [ ] **10. Configure CORS properly** (Deployment)

### Nice to Have:

- [ ] Add URL reputation checking
- [ ] Implement CSP reporting endpoint
- [ ] Add rate limiting UI
- [ ] Create Terms of Service
- [ ] Set up bug bounty program (for larger deployments)

---

## Deployment Security

### Hosting Recommendations:

**Best Options**:
1. **Vercel** (recommended)
   - Automatic HTTPS
   - Environment variable management
   - CDN included
   - CSP headers support

2. **Netlify** (alternative)
   - Similar features to Vercel
   - Good for static sites/PWAs

3. **GitHub Pages** (not recommended)
   - ⚠️ No environment variables
   - ⚠️ No CSP headers
   - ⚠️ Limited HTTPS config

### Deployment Configuration:

```bash
# .env.production
VITE_GOOGLE_CLIENT_ID=your-client-id-here
VITE_REDIRECT_URI=https://yourdomain.com/oauth/callback

# Never commit .env files!
```

```bash
# vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; ..."
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "no-referrer"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

---

## Testing Recommendations

### Security Testing:

```bash
# 1. Test XSS attacks
# Try entering these in protected keywords:
<script>alert('xss')</script>
javascript:alert(1)

# 2. Test SQL injection (shouldn't affect client-side app)
'; DROP TABLE users--

# 3. Test path traversal
../../../etc/passwd

# 4. Test long inputs (DoS)
# Enter 10,000 character keyword

# 5. Test special characters
\0 null byte
%00 encoded null
```

### Manual Tests:

1. ✅ Test with 10,000+ subscriptions (performance)
2. ✅ Test rapid scanning (quota exhaustion)
3. ✅ Test with malicious email subjects
4. ✅ Test with unicode/RTL text
5. ✅ Test browser storage limits
6. ✅ Test with slow network
7. ✅ Test with expired OAuth token

---

## Incident Response Plan

### If Security Issue Discovered:

1. **Immediate Actions**:
   - Take app offline if critical
   - Revoke OAuth app credentials
   - Post notification on landing page

2. **Investigation**:
   - Determine scope of breach
   - Check if any user data was exposed
   - Document timeline

3. **Remediation**:
   - Fix vulnerability
   - Deploy patch
   - Force users to re-authenticate

4. **Disclosure**:
   - Notify affected users (if any)
   - Post public disclosure (responsible)
   - Update security documentation

---

## Conclusion

**SubZero is SAFE to launch with the following caveats:**

1. ✅ The local-first architecture is excellent for privacy
2. ✅ OAuth with PKCE is implemented correctly
3. ⚠️ Must complete pre-launch checklist above
4. ⚠️ Must get Google OAuth verification
5. ⚠️ Must add CSP headers in deployment
6. ⚠️ Must create privacy policy

**Overall Assessment**: The app has a solid security foundation but requires proper deployment configuration and legal documentation before public release.

---

## Contact

For security issues, please email: security@yourdomain.com (set this up!)

**Do not** post security issues publicly on GitHub.

---

**Last Updated**: November 2, 2025
**Next Review**: Before major feature releases
