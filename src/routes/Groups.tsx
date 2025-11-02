import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function GroupsPage() {
  const navigate = useNavigate()
  const { groups, loadGroups, selectedGroups, toggleGroupSelection, logout } = useAppStore()

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const getUnsubscribeBadge = (kind: string) => {
    switch (kind) {
      case 'one-click':
        return <Badge variant="success">One-Click</Badge>
      case 'http':
        return <Badge variant="info">HTTP</Badge>
      case 'mailto':
        return <Badge variant="warning">Mailto</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">SubZero</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/scan')}>
              Scan
            </Button>
            <Button variant="outline" onClick={() => navigate('/activity')}>
              Activity
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Settings
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Subscription Senders ({groups.length})
          </h2>
          <p className="text-muted-foreground">
            Select senders to unsubscribe or manage their emails
          </p>
        </div>

        {groups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No subscriptions found. Run a scan to discover your subscriptions.
              </p>
              <Button onClick={() => navigate('/scan')}>
                Start Scan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/group/${encodeURIComponent(group.id)}`)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedGroups.has(group.id)}
                      onCheckedChange={() => toggleGroupSelection(group.id)}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {group.displayName || group.domain || 'Unknown Sender'}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {group.domain}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">Messages:</span>{' '}
                        <span className="font-medium">{group.messageCount}</span>
                      </div>
                      {group.category && (
                        <div>
                          <span className="text-muted-foreground">Category:</span>{' '}
                          <span className="font-medium">{group.category}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">First seen:</span>{' '}
                        <span className="font-medium">
                          {new Date(group.firstSeen).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last seen:</span>{' '}
                        <span className="font-medium">
                          {new Date(group.lastSeen).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {group.listId && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        <span className="font-medium">List-ID:</span> {group.listId}
                      </div>
                    )}

                    {group.unsubscribe.url && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        <span className="font-medium">Unsubscribe:</span>{' '}
                        <a
                          href={group.unsubscribe.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {group.unsubscribe.url}
                        </a>
                      </div>
                    )}

                    {group.safety.protected && group.safety.reasons.length > 0 && (
                      <div className="text-xs text-destructive mt-2">
                        ⚠️ Protected: {group.safety.reasons.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {getUnsubscribeBadge(group.unsubscribe.kind)}
                    {group.safety.protected && (
                      <Badge variant="destructive">Protected</Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/group/${encodeURIComponent(group.id)}`)
                    }}
                  >
                    View Details →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
