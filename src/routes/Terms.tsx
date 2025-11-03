import { Link } from 'react-router-dom';
import { FileText, AlertCircle } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="h-4 w-4 text-black" />
            <span className="text-black font-medium">Terms of Service</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-12">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-black mb-2">Important: Use With Care</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                QuiteInbox gives you powerful tools to manage your inbox. Actions like deleting emails cannot be undone
                after Gmail's trash period (30 days). Always review your selections carefully before taking bulk actions.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Terms */}
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using QuiteInbox ("the app", "our service"), you accept and agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox is a free, open-source tool that helps you manage email subscriptions in your Gmail account. The service includes:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Scanning your inbox to identify subscription emails</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Unsubscribing from unwanted senders using official unsubscribe methods</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Deleting or archiving old subscription emails in bulk</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Creating Gmail filters to manage future emails</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>All processing happens locally in your browser</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When using QuiteInbox, you agree to:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-1">Use the App Responsibly</h3>
                <p className="text-gray-600 text-sm">
                  Review your selections carefully before taking bulk actions like deleting emails.
                  We provide safety features (protected keywords/domains), but you are ultimately responsible
                  for your actions.
                </p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-1">Comply with Gmail's Terms</h3>
                <p className="text-gray-600 text-sm">
                  You must comply with <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-black underline">Google's Terms of Service</a> and
                  the <a href="https://developers.google.com/gmail/api/guides/acceptable-use" target="_blank" rel="noopener noreferrer" className="text-black underline">Gmail API Acceptable Use Policy</a>.
                  Do not abuse the API or violate rate limits.
                </p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-1">No Malicious Use</h3>
                <p className="text-gray-600 text-sm">
                  Do not use QuiteInbox for spam, harassment, or any illegal activities.
                  Do not attempt to bypass safety features or use the app in ways that could harm others.
                </p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <h3 className="font-semibold text-black mb-1">Keep Your Credentials Safe</h3>
                <p className="text-gray-600 text-sm">
                  You are responsible for maintaining the security of your Google account.
                  Use strong passwords and enable two-factor authentication.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Privacy and Data Handling</h2>
            <p className="text-gray-700 leading-relaxed">
              Our approach to privacy is simple: we don't want your data, and we don't store it. All processing
              happens locally in your browser. For complete details, please read our{' '}
              <Link to="/privacy" className="text-black underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. No Warranty</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>The app will be error-free or uninterrupted</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>All unsubscribe methods will work (some senders have broken links)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>The Gmail API will always be available</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Your emails won't be accidentally deleted (though we provide safety features)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, QuiteInbox and its developers shall not be liable for:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Any data loss or corruption</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Emails deleted by mistake</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Unsubscribe requests that don't work due to sender issues</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Gmail API downtime or changes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Any damages (direct, indirect, incidental, or consequential) arising from your use of the app</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Some jurisdictions do not allow limitations on implied warranties or liability, so some of these limitations
              may not apply to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">7. Safety Features and Recommendations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We provide several safety features to help protect important emails:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span><strong>Protected Keywords:</strong> Emails containing keywords like "invoice", "receipt", "statement" are excluded from bulk actions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span><strong>Protected Domains:</strong> Emails from important domains (banks, government) are excluded from bulk actions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span><strong>Preview Before Action:</strong> We show you exactly what will happen before you confirm</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span><strong>Trash Instead of Delete:</strong> Deleted emails go to Gmail trash first (recoverable for 30 days)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span><strong>Audit Log:</strong> All actions are logged locally so you can review what happened</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Recommendation:</strong> Start with a small test (e.g., delete emails from one sender) before doing
              large bulk operations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">8. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox relies on third-party services:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-black mb-1">Google OAuth & Gmail API</h3>
                <p className="text-gray-600 text-sm">
                  You must comply with <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-black underline">Google's Terms of Service</a>.
                  Google may change or discontinue the Gmail API at any time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">Email Senders</h3>
                <p className="text-gray-600 text-sm">
                  When you unsubscribe, we use the official unsubscribe links provided by email senders.
                  We are not responsible if senders don't honor your unsubscribe requests or if their links are broken.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">9. Open Source License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              QuiteInbox is open-source software. The source code is available at{' '}
              <a href="https://github.com/Koushith/quite-inbox" target="_blank" rel="noopener noreferrer" className="text-black underline">
                GitHub
              </a> and is licensed under the MIT License (or AGPL-3.0, depending on your choice).
            </p>
            <p className="text-gray-700 leading-relaxed">
              You are free to:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Use the software for any purpose</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Study how it works and modify it</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Redistribute copies</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Distribute modified versions</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">10. Revocation of Access</h2>
            <p className="text-gray-700 leading-relaxed">
              You can revoke QuiteInbox's access to your Gmail account at any time by visiting{' '}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-black underline">
                Google Account Permissions
              </a> and removing QuiteInbox. Your local data will remain in your browser until you clear it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms of Service from time to time. Significant changes will be indicated by updating
              the "Last updated" date at the top of this page. Your continued use of QuiteInbox after changes means you
              accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">12. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              You may stop using QuiteInbox at any time by revoking OAuth access and clearing your browser data.
              We reserve the right to terminate or suspend access for violations of these terms, though as a local-first
              app with no backend, enforcement is limited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">13. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of your jurisdiction,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">14. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Open an issue on <a href="https://github.com/Koushith/quite-inbox/issues" target="_blank" rel="noopener noreferrer" className="text-black underline">GitHub</a></span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-black mt-1">•</span>
                <span>Review the source code to understand how the app works</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">15. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you
              and QuiteInbox regarding your use of the app.
            </p>
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
