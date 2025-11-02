import { useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { storage } from '@/lib/storage/db'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export JSON
          </Button>
        </div>
        {actionLog.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No activity yet. Actions you perform will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {actionLog.map((log) => (
              <Card key={log.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-medium">
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      {log.method && ` (${log.method})`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.ts).toLocaleString()}
                    </div>
                    {log.count !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {log.count} messages affected
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
                  >
                    {log.result}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
