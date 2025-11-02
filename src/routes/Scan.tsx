import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scanInbox } from '@/lib/api/gmail'
import { parseMessage } from '@/lib/parsers/headers'
import { MessageGrouper } from '@/lib/grouping/engine'
import { storage } from '@/lib/storage/db'
import { useAppStore } from '@/stores/appStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Scan, Shield, Clock, Calendar } from 'lucide-react'

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

  const timeRanges = [
    { value: '3d' as const, label: '3 Days', icon: Clock, desc: 'Quick scan' },
    { value: '7d' as const, label: '1 Week', icon: Clock, desc: 'Last 7 days' },
    { value: '3m' as const, label: '3 Months', icon: Calendar, desc: 'Quarterly' },
    { value: '6m' as const, label: '6 Months', icon: Calendar, desc: 'Half year' },
    { value: '12m' as const, label: '1 Year', icon: Calendar, desc: 'Annual' },
    { value: 'all' as const, label: 'All Time', icon: Calendar, desc: 'Everything' },
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Scan className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Scan Your Inbox</h1>
            <p className="text-lg text-gray-600">
              Find all your email subscriptions and take back control
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-sm border-0 rounded-xl overflow-hidden bg-white">
            <CardContent className="p-8">
              {!scanState.isScanning ? (
                <>
                  {/* Time Range Selection */}
                  <div className="mb-8">
                    <label className="block text-base font-bold mb-4 text-gray-900">
                      Select Time Range
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {timeRanges.map((range) => {
                        const Icon = range.icon
                        return (
                          <button
                            key={range.value}
                            onClick={() => setTimeWindow(range.value)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              timeWindow === range.value
                                ? 'border-blue-600 bg-blue-50 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-4 h-4 ${
                                timeWindow === range.value ? 'text-blue-600' : 'text-gray-400'
                              }`} />
                              <span className={`font-semibold ${
                                timeWindow === range.value ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {range.label}
                              </span>
                            </div>
                            <span className={`text-xs ${
                              timeWindow === range.value ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {range.desc}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Recommended: Start with 3 days for quick results
                    </p>
                  </div>

                  {/* Start Button */}
                  <Button
                    onClick={handleScan}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-sm"
                    size="lg"
                  >
                    <Scan className="w-5 h-5 mr-2" />
                    Start Scanning
                  </Button>

                  {/* Privacy Section */}
                  <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Privacy First</p>
                        <p className="text-sm text-green-700">
                          All scanning happens locally in your browser. Your emails are never sent to any server.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Scanning Progress */}
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Scanning Your Inbox</h3>
                    <p className="text-gray-600 mb-6">
                      Please wait while we analyze your emails
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm font-semibold mb-2 text-gray-700">
                        <span>Progress</span>
                        <span>{scanState.progress.processed.toLocaleString()} / {scanState.progress.total.toLocaleString()}</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <p className="text-xs text-gray-500 mt-2">
                        {Math.round(progressPercent)}% complete
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Error State */}
              {scanState.error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  <p className="font-semibold mb-1">Scan Error</p>
                  <p>{scanState.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
