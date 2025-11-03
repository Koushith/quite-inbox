# Security Policy

## Our Commitment to Privacy & Security

QuiteInbox is built with privacy and security as core principles. All email processing happens **locally in your browser** - we never send your data to any server.

## Security Model

### Client-Side Architecture
- ✅ **Local-First**: All data stored in browser (IndexedDB/LocalStorage)
- ✅ **No Server**: Zero server-side data collection or storage
- ✅ **Open Source**: All code is public and auditable

### OAuth Security
- ✅ **PKCE (RFC 7636)**: Cryptographic protection without client secrets
- ✅ **State Parameter**: CSRF protection for OAuth flow
- ✅ **Token Refresh**: Automatic token refresh with secure storage

### Data Protection
- ✅ **Minimal Permissions**: Only requests necessary Gmail API scopes
- ✅ **Protected Keywords**: Prevents accidental deletion of important emails
- ✅ **Safety Checks**: Validates actions before execution

## Known Security Considerations

### 1. Client Secret in Web Apps
**Issue**: OAuth client secrets cannot be truly secret in browser-based apps.

**Our Approach**: We use **PKCE (Proof Key for Code Exchange)** which is specifically designed for public clients. The client secret provides **zero additional security** in a web app because anyone can view the source code.

**Recommendation**: We recommend using PKCE **without** client secrets. Our code supports both modes:
- With PKCE only (recommended): Just set `VITE_GOOGLE_CLIENT_ID`
- With PKCE + client secret: Set both (no security benefit, but works)

**Why PKCE is Secure**:
- Uses cryptographic `code_verifier` and `code_challenge`
- Code verifier never leaves your browser
- Even if client ID is public, attackers can't complete OAuth flow
- Recommended by OAuth 2.0 Security Best Practices (RFC 8252)

### 2. Token Storage in LocalStorage
**Issue**: OAuth tokens stored in localStorage are accessible to XSS attacks.

**Mitigation**:
- React's auto-escaping prevents XSS
- No use of `dangerouslySetInnerHTML`
- Content Security Policy (CSP) blocks inline scripts
- Regular security audits and dependency updates

**Alternative Considered**: HttpOnly cookies require a backend server, which conflicts with our local-first architecture.

### 3. Gmail API Permissions
**Required Scopes**:
- `gmail.readonly`: Read email headers to detect subscriptions
- `gmail.modify`: Delete/archive emails (only when user requests)
- `gmail.send`: Send unsubscribe emails (only for mailto: links)

**Why These Are Safe**:
- All actions require explicit user interaction
- No automatic email deletion or sending
- Protected keywords prevent accidental deletion
- Complete audit log of all actions

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

### Responsible Disclosure

If you discover a security vulnerability:

1. **Email**: Open an issue on [GitHub](https://github.com/Koushith/quite-inbox/issues) with the title "SECURITY" (we'll make this private immediately)
2. **Provide**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Response Time**: Within 48 hours
- **Fix Timeline**:
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
- **Credit**: We'll acknowledge your contribution (if desired)

## Security Best Practices for Users

### Protect Your Account
1. ✅ Use strong, unique password for your Google account
2. ✅ Enable 2-factor authentication on Google account
3. ✅ Review connected apps regularly: https://myaccount.google.com/permissions
4. ✅ Revoke access if you stop using QuiteInbox

### Safe Usage
1. ✅ Review selections carefully before bulk delete
2. ✅ Use protected keywords for important email types
3. ✅ Add important domains to protected list
4. ✅ Test with small batches first (delete 10 emails, not 1000)
5. ✅ Check trash before permanent deletion (30-day recovery window)

### Verify Unsubscribe Links
Before clicking unsubscribe links:
1. ✅ Check the domain matches the sender
2. ✅ Be cautious of IP addresses or localhost URLs
3. ✅ Verify HTTPS for security
4. ✅ Watch for suspicious domains (.tk, .ml, etc.)

## Security Features

### Built-in Protections
- **Protected Keywords**: Emails containing "invoice", "receipt", "statement", "otp", etc. are excluded from bulk actions
- **Protected Domains**: Banks, government, and important services are protected
- **Confirmation Dialogs**: All destructive actions require confirmation
- **Audit Log**: Complete history of all actions taken

### Unsubscribe Safety
- **HTTPS Enforcement**: One-click unsubscribe requires HTTPS
- **No Auto-Redirect**: Manual redirect checking prevents malicious redirects
- **External Links**: Opens with `noopener,noreferrer` for security

## Technical Security Measures

### Code Security
- ✅ No `eval()` or `Function()` usage
- ✅ No `dangerouslySetInnerHTML`
- ✅ React auto-escaping prevents XSS
- ✅ Input validation and sanitization
- ✅ Regular dependency updates

### Network Security
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ HTTPS-only in production

### OAuth Security (RFC 6749, RFC 7636)
- ✅ PKCE with S256 challenge method
- ✅ Cryptographically secure random generation
- ✅ State parameter validation
- ✅ Token expiration checking
- ✅ Automatic token refresh

## Compliance

### GDPR & Privacy
- ✅ **Data Minimization**: Only collect necessary metadata
- ✅ **Local Processing**: No server-side data storage
- ✅ **Right to Erasure**: Clear browser data anytime
- ✅ **Data Portability**: Export data as JSON
- ✅ **Transparency**: Open source code

### Google OAuth Requirements
- ✅ Privacy Policy published
- ✅ Terms of Service published
- ✅ Clear permission explanations
- ✅ OAuth verification submitted
- ✅ Open source and verifiable

## Audit History

| Date | Type | Findings | Status |
|------|------|----------|--------|
| 2025-11-03 | Comprehensive Security Audit | All critical items addressed | ✅ Complete |

## Dependencies

We regularly audit our dependencies for vulnerabilities:

```bash
npm audit
# Last run: 2025-11-03
# Vulnerabilities: 0 (0 low, 0 moderate, 0 high, 0 critical)
```

## Security Roadmap

### Completed
- ✅ PKCE implementation
- ✅ Local-first architecture
- ✅ Protected keywords/domains
- ✅ Security headers (CSP, X-Frame-Options)
- ✅ Input validation
- ✅ Dependency audit

### Planned
- [ ] Google Safe Browsing API integration for URL checking
- [ ] CSP reporting endpoint for violation monitoring
- [ ] Bug bounty program
- [ ] Regular security audits (quarterly)
- [ ] Automated security scanning in CI/CD

## References

### Standards & Best Practices
- [RFC 6749: OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 7636: PKCE](https://tools.ietf.org/html/rfc7636)
- [RFC 8252: OAuth for Native Apps](https://tools.ietf.org/html/rfc8252)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Gmail API Security](https://developers.google.com/gmail/api/auth/about-auth)

### Our Implementation
- [OAuth Code](./src/lib/auth/oauth.ts)
- [Gmail API Client](./src/lib/api/gmail.ts)
- [Header Parser](./src/lib/parsers/headers.ts)
- [Database Schema](./src/lib/storage/db.ts)

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**Contact**: [GitHub Issues](https://github.com/Koushith/quite-inbox/issues)

For privacy details, see [PRIVACY.md](./PRIVACY.md)
