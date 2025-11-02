import { useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { storage } from '@/lib/storage/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ActivityPage() {
  const { actionLog, loadActionLog } = useAppStore()

  useEffect(() => {
    loadActionLog()
  }, [loadActionLog])

  const handleExport = async () => {
    const json = await storage.exportActionLog()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subzero-activity-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Log</h1>
              <p className="text-gray-600">Track all your unsubscribe and cleanup actions</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="font-semibold"
            >
              Export JSON
            </Button>
          </div>
        </div>

        {actionLog.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Actions you perform like unsubscribing and deleting emails will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionLog.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-base mb-1">
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      {log.method && (
                        <span className="text-sm font-medium text-blue-600 ml-2">
                          ({log.method})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.ts).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {log.count !== undefined && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{log.count}</span> messages affected
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={
                      log.result === 'success'
                        ? 'success'
                        : log.result === 'fail'
                        ? 'destructive'
                        : 'outline'
                    }
                    className="text-xs font-semibold px-3 py-1"
                  >
                    {log.result}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
