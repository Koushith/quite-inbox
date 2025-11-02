import { useState } from 'react';
import { startOAuthFlow, GMAIL_SCOPES } from '@/lib/auth/oauth';
import { Button } from '@/components/ui/button';
import { Mail, Shield, Zap, Trash2, Lock, Code } from 'lucide-react';

export default function OnboardingPage() {
  const [showPermissions, setShowPermissions] = useState(false);

  const handleSignIn = async () => {
    // Request all scopes - user understands we need them from the modal
    const scopes = [GMAIL_SCOPES.readonly, GMAIL_SCOPES.modify, GMAIL_SCOPES.send];

    try {
      await startOAuthFlow(scopes);
    } catch (error) {
      console.error('OAuth flow error:', error);
      alert(error instanceof Error ? error.message : 'Failed to connect Gmail');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">QI</span>
              </div>
              <span className="text-lg font-semibold text-black">QuiteInbox</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-black">
                Features
              </a>
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
      </nav>

      {/* Hero Section */}
      <section className="bg-white flex items-center min-h-[85vh]">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black leading-[1.05] tracking-tight">
              Take Back Control
              <br />
              Of Your Inbox
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Unsubscribe from unwanted emails in seconds. No servers. No tracking.
              <br className="hidden sm:block" />
              Everything happens locally in your browser.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => setShowPermissions(true)}
                className="bg-black text-white hover:bg-gray-800 rounded-md px-8 h-14 text-lg font-medium w-full sm:w-auto"
              >
                Get Started Free →
              </Button>
              <a
                href="#features"
                className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium text-black hover:text-gray-700 w-full sm:w-auto"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Stats */}
            <div className="pt-8 border-t border-gray-200 mt-12">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-black" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-black" />
                  <span>Zero data collection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-black" />
                  <span>Open source</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-black" />
                  <span>No signup required</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="pt-12 pb-8">
              <div className="relative max-w-2xl mx-auto">
                <img
                  src="https://notioly.com/wp-content/uploads/2025/03/516.Inbox-Overflowing.png"
                  alt="Inbox Overflowing"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to a cleaner inbox. No complex setup, no hidden costs, no compromises on privacy.
            </p>
          </div>

          <div className="space-y-24 lg:space-y-32">
            {/* Feature 1 - Image Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black text-white font-bold text-lg">
                  1
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-black">Find All Subscriptions</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Connect your Gmail and scan your inbox. QuiteInbox finds every newsletter and promotional email you've
                  signed up for.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">Detects subscriptions automatically</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">Groups by sender for easy management</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">See message count and last email date</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://notioly.com/wp-content/uploads/2024/06/412.New-Email.png"
                  alt="Find Subscriptions"
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>

            {/* Feature 2 - Image Left */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="flex items-center justify-center lg:order-first">
                <img
                  src="https://notioly.com/wp-content/uploads/2024/04/385.Tasks_.png"
                  alt="Smart Unsubscribe"
                  className="w-full max-w-md h-auto"
                />
              </div>
              <div className="space-y-6 lg:order-last">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black text-white font-bold text-lg">
                  2
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-black">Smart Unsubscribe</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Pick what you want gone and unsubscribe with one click. Uses the official unsubscribe links already in
                  your emails.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">One-click unsubscribe for instant removal</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">Handle multiple senders at once</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">Safety filters prevent mistakes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 - Image Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black text-white font-bold text-lg">
                  3
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-black">Bulk Cleanup</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Want to delete old promotional emails? Choose what to keep and what to remove. Archive or delete
                  thousands of messages with precise control over your data.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">Delete emails older than X days or keep only the last N</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">Create Gmail filters to auto-archive future emails</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-black mt-1">•</span>
                    <span className="text-gray-600">Full audit log of every action taken</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="https://notioly.com/wp-content/uploads/2024/03/365.Archive-Files.png"
                  alt="Bulk Cleanup"
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Permissions Modal */}
      {showPermissions && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-black">Connect Your Gmail</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  QuiteInbox needs these permissions to work. Don't worry—everything runs locally in your browser.
                </p>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                {/* Required */}
                <div className="bg-white border-2 border-black rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-black" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-black">Read Email Headers</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Scan your inbox to find subscriptions and unsubscribe links
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modify */}
                <div className="bg-white border-2 border-black rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-black" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-black">Modify Emails</h3>
                      </div>
                      <p className="text-sm text-gray-600">Archive or delete old subscription emails in bulk</p>
                    </div>
                  </div>
                </div>

                {/* Send */}
                <div className="bg-white border-2 border-black rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-black" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-black">Send Emails</h3>
                      </div>
                      <p className="text-sm text-gray-600">Send unsubscribe requests when one-click isn't available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-black shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <strong className="font-semibold text-black">Privacy Guarantee:</strong> All data stays on your
                    device. We never send your email content or metadata to any server. QuiteInbox is 100% open-source
                    and verifiable.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPermissions(false)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md h-11"
                >
                  Cancel
                </Button>
                <Button onClick={handleSignIn} className="flex-1 bg-black text-white hover:bg-gray-800 rounded-md h-11">
                  Continue with Google
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">QI</span>
              </div>
              <span className="text-sm font-medium text-gray-600">© 2025 QuiteInbox</span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com/Koushith/quite-inbox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-black"
              >
                GitHub
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
