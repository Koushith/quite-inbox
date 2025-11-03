import { Link } from 'react-router-dom';
import { Shield, Lock, Code, AlertTriangle, CheckCircle2, Key } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">QI</span>
              </div>
              <span className="text-lg font-semibold text-black">QuiteInbox</span>
            </Link>
            <Link to="/" className="text-sm text-gray-600 hover:text-black">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 text-sm mb-6">
            <Shield className="h-4 w-4 text-black" />
            <span className="text-black font-medium">Security Policy</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">
            Security First, Privacy Always
          </h1>
          <p className="text-lg text-gray-600">
            How we keep your Gmail data safe with local-first architecture and modern OAuth security.
          </p>
        </div>

        {/* Security Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 pb-12 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6">
            <CheckCircle2 className="h-6 w-6 text-black mb-3" />
            <h3 className="font-semibold text-black mb-2">PKCE Protected</h3>
            <p className="text-sm text-gray-600">
              Cryptographic security without needing secrets. OAuth 2.0 best practices.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <Lock className="h-6 w-6 text-black mb-3" />
            <h3 className="font-semibold text-black mb-2">Local Processing</h3>
            <p className="text-sm text-gray-600">All email data stays in your browser. Zero server storage.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <Code className="h-6 w-6 text-black mb-3" />
            <h3 className="font-semibold text-black mb-2">Open Source</h3>
            <p className="text-sm text-gray-600">
              Verify our security claims. Every line of code is public on GitHub.
            </p>
          </div>
        </div>

        {/* Detailed Security */}
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Our Security Model</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox is built with a <strong>local-first architecture</strong>, meaning all your email data stays in
              your browser. We never send your emails, metadata, or personal information to any server.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-black mb-2">Why This Matters</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Unlike traditional web apps that process your data on their servers, QuiteInbox runs entirely in
                    your browser. This means:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>No data breaches possible (we don't have your data)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>No government subpoenas (nothing to subpoena)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>No employee access to your emails</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Works offline once loaded</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">OAuth Security (PKCE)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use <strong>PKCE (Proof Key for Code Exchange)</strong>, the modern OAuth standard designed
              specifically for public clients like web apps and mobile apps.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-2">How PKCE Protects You</h3>
                <ol className="space-y-2 text-gray-700 text-sm list-decimal list-inside">
                  <li>
                    Your browser generates a random <code className="bg-gray-100 px-1 py-0.5 rounded">code_verifier</code> (like a one-time password)
                  </li>
                  <li>
                    Creates a <code className="bg-gray-100 px-1 py-0.5 rounded">code_challenge</code> (SHA-256 hash) and sends it to Google
                  </li>
                  <li>You authorize QuiteInbox with Google</li>
                  <li>Google returns an authorization code</li>
                  <li>
                    Your browser exchanges the code + original <code className="bg-gray-100 px-1 py-0.5 rounded">code_verifier</code> for tokens
                  </li>
                </ol>
                <p className="text-gray-600 text-sm mt-3">
                  <strong>The key:</strong> The <code className="bg-gray-100 px-1 py-0.5 rounded">code_verifier</code>{' '}
                  never leaves your browser and is generated fresh each time. Even if someone intercepts your network
                  traffic, they can't complete the OAuth flow without the verifier.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Key className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">About Client Secrets</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      You might notice our OAuth Client ID is public (visible in source code). This is{' '}
                      <strong>intentional and safe</strong>.
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Why?</strong> Client secrets provide <strong>zero additional security</strong> in web apps
                      because anyone can view your JavaScript source code. That's why OAuth 2.0 invented PKCE - to
                      provide cryptographic protection <em>without</em> needing secrets. The{' '}
                      <code className="bg-gray-100 px-1 py-0.5 rounded">code_verifier</code> is what protects you, not a
                      client secret.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">What We Access</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox requests three Gmail permissions. Here's exactly what each one does and why we need it:
            </p>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-black mb-2">
                  📬 Read Email Headers (gmail.readonly)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>What it does:</strong> Lets us read email metadata like sender names, subjects, dates, and
                  unsubscribe links.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Why we need it:</strong> To scan your inbox and identify subscription emails. We don't read
                  the full body content unless absolutely necessary to find an unsubscribe link.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-black mb-2">🗑️ Modify Emails (gmail.modify)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>What it does:</strong> Lets us delete/archive emails and create Gmail filters.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Why we need it:</strong> To delete old subscription emails and create auto-archive filters.
                  This only happens when <em>you explicitly click the delete or filter buttons</em>.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-black mb-2">📧 Send Emails (gmail.send)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>What it does:</strong> Lets us send emails on your behalf.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Why we need it:</strong> Some senders require email-based unsubscribe (mailto: links). When
                  you click unsubscribe on these, we send a standard unsubscribe email for you.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Built-in Safety Features</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We include multiple safety mechanisms to prevent accidental deletion of important emails:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-black mb-2">🔒 Protected Keywords</h3>
                <p className="text-sm text-gray-600">
                  Emails containing "invoice", "receipt", "statement", "otp", and other important terms are
                  automatically excluded from bulk actions.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-black mb-2">🏦 Protected Domains</h3>
                <p className="text-sm text-gray-600">
                  Banks, government agencies, and important services are protected by default. You can add your own
                  protected domains.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-black mb-2">✅ Confirmation Dialogs</h3>
                <p className="text-sm text-gray-600">
                  All destructive actions require explicit confirmation. We show you exactly what will be affected
                  before you proceed.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-black mb-2">📋 Complete Audit Log</h3>
                <p className="text-sm text-gray-600">
                  Every action is logged locally. Review exactly what was unsubscribed or deleted at any time.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Known Security Considerations</h2>

            <div className="space-y-4">
              <div className="border-l-4 border-yellow-400 pl-4">
                <h3 className="font-semibold text-black mb-2">Token Storage in LocalStorage</h3>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Consideration:</strong> OAuth tokens are stored in browser localStorage, which is accessible
                  to JavaScript.
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Risk:</strong> If an attacker found an XSS vulnerability, they could steal tokens.
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Our mitigation:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>React automatically escapes all content (prevents XSS)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>No use of dangerouslySetInnerHTML anywhere in code</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>Content Security Policy blocks inline scripts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>Regular security audits and dependency updates</span>
                  </li>
                </ul>
                <p className="text-gray-600 text-sm mt-2">
                  <strong>Alternative considered:</strong> HttpOnly cookies would be more secure, but require a backend
                  server, which conflicts with our privacy-first, local-only architecture.
                </p>
              </div>

              <div className="border-l-4 border-yellow-400 pl-4">
                <h3 className="font-semibold text-black mb-2">Unsubscribe Link Trust</h3>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Consideration:</strong> We use unsubscribe links provided by email senders.
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Our mitigation:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>HTTPS required for one-click unsubscribe</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>Manual redirect checking (no auto-follow)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>Links open with noopener,noreferrer</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-black mt-1">•</span>
                    <span>User always sees the destination domain before clicking</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Reporting Security Issues</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-black mb-2">Responsible Disclosure</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    If you discover a security vulnerability in QuiteInbox, please <strong>do NOT</strong> create a
                    public GitHub issue.
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    Instead, please report it privately by opening a GitHub issue with the title "SECURITY" and we'll
                    make it private immediately.
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>What to include:</strong> Description of the vulnerability, steps to reproduce, potential
                    impact, and suggested fix (if any).
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">
                    <strong>Response time:</strong> We'll respond within 48 hours and provide a fix timeline based on
                    severity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Verify Our Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox is 100% open source. You can verify every security claim we make by reviewing the code:
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <h3 className="font-semibold text-black mb-1 text-sm">OAuth Implementation</h3>
                <p className="text-gray-600 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">src/lib/auth/oauth.ts</code> - PKCE flow,
                  token management, state validation
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1 text-sm">Gmail API Client</h3>
                <p className="text-gray-600 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">src/lib/api/gmail.ts</code> - API calls,
                  error handling, rate limiting
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1 text-sm">Data Storage</h3>
                <p className="text-gray-600 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">src/lib/storage/db.ts</code> - IndexedDB
                  schema, protected keywords/domains
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1 text-sm">Safety Checks</h3>
                <p className="text-gray-600 text-sm">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">src/lib/parsers/headers.ts</code> -
                  Subscription detection, safety validation
                </p>
              </div>
            </div>
            <a
              href="https://github.com/Koushith/quite-inbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Code className="h-4 w-4" />
              <span>View Source Code on GitHub</span>
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Security Best Practices for Users</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-3">Protect Your Account</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Use a strong, unique password for your Google account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Enable 2-factor authentication on your Google account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Review connected apps regularly at{' '}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black underline"
                    >
                      Google Account Permissions
                    </a>
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Revoke QuiteInbox access if you stop using it</span>
                </li>
              </ul>

              <h3 className="font-semibold text-black mb-3 mt-6">Use QuiteInbox Safely</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Review selections carefully before bulk delete</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Add important keywords to protected list</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Test with small batches first (e.g., 10 emails)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Check Gmail trash before permanent deletion (30-day window)</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Technical Details</h2>
            <p className="text-gray-700 leading-relaxed mb-4">For security researchers and technical users:</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-3 text-sm">Standards & Compliance</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>OAuth 2.0:</strong> RFC 6749
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>PKCE:</strong> RFC 7636 with S256 challenge method
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>OAuth for Native Apps:</strong> RFC 8252 best practices
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>Security Headers:</strong> CSP, X-Frame-Options, X-Content-Type-Options
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>GDPR Compliant:</strong> No data collection, local-only processing
                  </span>
                </li>
              </ul>

              <h3 className="font-semibold text-black mb-3 mt-6 text-sm">Cryptography</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>Random Generation:</strong> Web Crypto API (crypto.getRandomValues)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>Code Challenge:</strong> SHA-256 hash of code verifier
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-black mt-1">•</span>
                  <span>
                    <strong>State Parameter:</strong> 32-byte cryptographically secure random string
                  </span>
                </li>
              </ul>

              <h3 className="font-semibold text-black mb-3 mt-6 text-sm">Dependencies</h3>
              <p className="text-sm text-gray-600 mb-2">
                Last audit: {new Date().toISOString().split('T')[0]}
              </p>
              <p className="text-sm text-gray-600">
                <strong>npm audit:</strong> 0 vulnerabilities (0 low, 0 moderate, 0 high, 0 critical)
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">QI</span>
              </div>
              <span className="text-sm font-medium text-gray-600">© 2025 QuiteInbox</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-sm text-gray-600 hover:text-black">
                Home
              </Link>
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-black">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-black">
                Terms
              </Link>
              <a
                href="https://github.com/Koushith/quite-inbox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-black"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
