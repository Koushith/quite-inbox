import { Link } from 'react-router-dom';
import { Shield, Lock, Code, Database, Download } from 'lucide-react';

export default function PrivacyPage() {
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
            <span className="text-black font-medium">Privacy Policy</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">Your Privacy Matters</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 pb-12 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6">
            <Lock className="h-6 w-6 text-black mb-3" />
            <h3 className="font-semibold text-black mb-2">100% Local</h3>
            <p className="text-sm text-gray-600">All processing happens in your browser. No server-side storage.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <Database className="h-6 w-6 text-black mb-3" />
            <h3 className="font-semibold text-black mb-2">No Tracking</h3>
            <p className="text-sm text-gray-600">We don't use analytics, cookies, or tracking tools.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <Code className="h-6 w-6 text-black mb-3" />
            <h3 className="font-semibold text-black mb-2">Open Source</h3>
            <p className="text-sm text-gray-600">Our code is public. Verify our claims anytime on GitHub.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <Download className="h-6 w-6 text-black mb-3" />
            <h3 className="font-semibold text-black mb-2">Your Data, Your Control</h3>
            <p className="text-sm text-gray-600">Export or delete your data anytime. No questions asked.</p>
          </div>
        </div>

        {/* Detailed Policy */}
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              QuiteInbox is a free, open-source email management tool that helps you unsubscribe from unwanted emails.
              This privacy policy explains how we handle your data. The short version: we don't. Everything stays on
              your device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">What Data We Access</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox requests permission to access your Gmail account through Google's OAuth system. We request
              three specific permissions (scopes):
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-1">Read Email Headers (gmail.readonly)</h3>
                <p className="text-gray-600 text-sm">
                  We read email metadata like sender names, domains, subjects, and unsubscribe links to identify
                  subscription emails. We do not read the full content of your emails unless necessary to find an
                  unsubscribe link.
                </p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-1">Modify Emails (gmail.modify)</h3>
                <p className="text-gray-600 text-sm">
                  We can delete or archive emails, and create Gmail filters. This only happens when you explicitly
                  request it by clicking buttons like "Delete old emails" or "Create filter".
                </p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-1">Send Emails (gmail.send)</h3>
                <p className="text-gray-600 text-sm">
                  We can send emails on your behalf to unsubscribe from senders that require an email-based unsubscribe
                  method (when one-click unsubscribe is not available).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">What We DON'T Do</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  We do <strong>not</strong> send your email content to any server
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  We do <strong>not</strong> store your data on any server or database
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  We do <strong>not</strong> track your usage with analytics tools
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  We do <strong>not</strong> sell your data to third parties
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  We do <strong>not</strong> share your data with advertisers
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  We do <strong>not</strong> use cookies for tracking (only for OAuth state)
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">How We Store Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All data is stored locally in your browser using standard web storage APIs:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div>
                <h3 className="font-semibold text-black mb-1">IndexedDB</h3>
                <p className="text-gray-600 text-sm">
                  Used to store sender groups (names, domains, message counts) and action logs (history of unsubscribes
                  and deletions). This data never leaves your browser.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">LocalStorage</h3>
                <p className="text-gray-600 text-sm">
                  Used to store your OAuth tokens (to keep you signed in) and app settings (theme, protected
                  keywords/domains).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">SessionStorage</h3>
                <p className="text-gray-600 text-sm">
                  Used temporarily during OAuth authentication. Cleared automatically after sign-in.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">How to Delete Your Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have complete control over your data. You can delete it anytime:
            </p>
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              <li>Clear your browser data (Chrome: Settings → Privacy → Clear browsing data)</li>
              <li>Use the export/delete feature in QuiteInbox settings</li>
              <li>
                Revoke app access at{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline"
                >
                  Google Account Permissions
                </a>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">QuiteInbox uses the following third-party services:</p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-black mb-1">Google OAuth & Gmail API</h3>
                <p className="text-gray-600 text-sm">
                  We use Google's authentication and Gmail API to access your inbox. Google's privacy policy applies:
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline ml-1"
                  >
                    Google Privacy Policy
                  </a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">Hosting (Vercel)</h3>
                <p className="text-gray-600 text-sm">
                  Our website is hosted on Vercel. They may collect basic server logs (IP addresses, user agents) for
                  infrastructure purposes. We do not have access to these logs.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Open Source Verification</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox is 100% open source. You can verify our privacy claims by reviewing the source code:
            </p>
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
            <h2 className="text-2xl font-bold text-black mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under data protection laws (GDPR, CCPA, etc.), you have the right to:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  <strong>Access:</strong> All your data is stored locally in your browser and is always accessible to
                  you
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  <strong>Deletion:</strong> Delete your data anytime by clearing browser storage or revoking OAuth
                  access
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  <strong>Portability:</strong> Export your data as JSON from the settings page
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  <strong>Rectification:</strong> Modify your settings and protected keywords/domains anytime
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify users of significant changes by
              updating the "Last updated" date at the top of this page. Continued use of QuiteInbox after changes means
              you accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this privacy policy or how we handle your data, you can:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>
                  Open an issue on{' '}
                  <a
                    href="https://github.com/Koushith/quite-inbox/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline"
                  >
                    GitHub
                  </a>
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Review our source code to verify our claims</span>
              </li>
            </ul>
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
