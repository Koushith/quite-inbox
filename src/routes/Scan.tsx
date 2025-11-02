import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scanInbox } from '@/lib/api/gmail'
import { parseMessage } from '@/lib/parsers/headers'
import { MessageGrouper } from '@/lib/grouping/engine'
import { storage } from '@/lib/storage/db'
import { useAppStore } from '@/stores/appStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Footer from '@/components/Footer'

export default function ScanPage() {
  const navigate = useNavigate()
  const { scanState, setScanState, settings } = useAppStore()
  const [timeWindow, setTimeWindow] = useState<'3d' | '7d' | '3m' | '6m' | '12m' | 'all'>('3d')

  const handleScan = async () => {
    setScanState({ isScanning: true, progress: { total: 0, processed: 0 }, error: null })

    // Navigate immediately to show streaming results
    navigate('/subscriptions')

    try {
      const grouper = new MessageGrouper()

      for await (const batch of scanInbox(
        { timeWindow },
        (progress) => {
          setScanState({
            progress: {
              total: progress.totalMessages,
              processed: progress.processedMessages,
            },
          })
        }
      )) {
        // Parse and group messages
        for (const message of batch) {
          const parsed = parseMessage(
            message,
            settings.protectedKeywords,
            settings.protectedDomains
          )
          grouper.addMessage(parsed)
        }

        // Save groups progressively after each batch
        const groups = grouper.getGroups()
        await storage.saveSenderGroups(groups)

        // Reload groups in store to update UI immediately
        const store = useAppStore.getState()
        await store.loadGroups()
      }

      // Final save and log
      const groups = grouper.getGroups()
      console.log('📊 Scan complete! Found groups:', groups)
      console.log('📧 Total groups:', groups.length)
      groups.forEach(g => {
        console.log(`  - ${g.displayName} (${g.domain}): ${g.messageCount} messages, ${g.unsubscribe.kind}`)
      })

      await storage.saveSenderGroups(groups)
      await useAppStore.getState().loadGroups()

      setScanState({ isScanning: false })

      if (groups.length === 0) {
        setScanState({
          isScanning: false,
          error: 'No subscription emails found in this time range. Try a longer time window.',
        })
      }
    } catch (error) {
      console.error('Scan error:', error)
      setScanState({
        isScanning: false,
        error: error instanceof Error ? error.message : 'Scan failed',
      })
    }
  }

  const progressPercent = scanState.progress.total > 0
    ? (scanState.progress.processed / scanState.progress.total) * 100
    : 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full shadow-lg border border-gray-200">
        <CardHeader className="text-center pb-6 border-b">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Scan Your Inbox
          </CardTitle>
          <p className="text-gray-600">
            Find all your email subscriptions in seconds
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
          {!scanState.isScanning ? (
            <>
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">Select Time Range</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {(['3d', '7d', '3m', '6m', '12m', 'all'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeWindow === range ? 'default' : 'outline'}
                      onClick={() => setTimeWindow(range)}
                      className={timeWindow === range ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'hover:bg-gray-50'}
                    >
                      {range === 'all'
                        ? 'All'
                        : range === '3d'
                        ? '3d'
                        : range === '7d'
                        ? '7d'
                        : range.toUpperCase()}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Recommended: Start with 3 days for quick results
                </p>
              </div>

              <Button
                onClick={handleScan}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium"
                size="lg"
              >
                Start Scanning
              </Button>

              <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900 mb-1">Privacy First</p>
                <p className="text-gray-600">All scanning happens locally in your browser. Your emails are never sent to any server.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Scanning...</span>
                  <span>{scanState.progress.processed} / {scanState.progress.total}</span>
                </div>
                <Progress value={progressPercent} />
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Please wait while we scan your inbox. This may take a few minutes.
              </div>
            </>
          )}

          {scanState.error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
              {scanState.error}
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      <Footer />
    </div>
  )
}
