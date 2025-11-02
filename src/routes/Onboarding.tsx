import { useState } from 'react'
import { startOAuthFlow, GMAIL_SCOPES } from '@/lib/auth/oauth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function OnboardingPage() {
  const [enableModify, setEnableModify] = useState(false)
  const [enableSend, setEnableSend] = useState(false)

  const handleSignIn = async () => {
    const scopes = [GMAIL_SCOPES.readonly]

    if (enableModify) {
      scopes.push(GMAIL_SCOPES.modify)
    }

    if (enableSend) {
      scopes.push(GMAIL_SCOPES.send)
    }

    try {
      await startOAuthFlow(scopes)
    } catch (error) {
      console.error('OAuth flow error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start sign-in')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to SubZero</CardTitle>
          <CardDescription className="text-base">
            Privacy-first Gmail subscription cleaner
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Why SubZero?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>100% local-first: No server storage of your email data</li>
              <li>Find all your subscriptions in one place</li>
              <li>One-click unsubscribe (RFC 8058 compliant)</li>
              <li>Bulk cleanup old subscription emails</li>
              <li>Protected keywords prevent accidental deletions</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Gmail Permissions</h3>

            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm mb-1">
                  Read-only (Required)
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan your inbox to find subscriptions and their unsubscribe methods
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm mb-1">
                    Modify (Optional)
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Archive or delete old subscription emails
                  </p>
                </div>
                <Switch
                  checked={enableModify}
                  onCheckedChange={setEnableModify}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm mb-1">
                    Send (Optional)
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send unsubscribe emails directly via Gmail API
                  </p>
                </div>
                <Switch
                  checked={enableSend}
                  onCheckedChange={setEnableSend}
                />
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md text-sm">
            <strong>Privacy Guarantee:</strong> All data stays on your device. We never send
            your email content or metadata to any server. SubZero is 100% open-source.
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSignIn} className="w-full" size="lg">
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
