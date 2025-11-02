import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { executeUnsubscribe, estimateCleanupCount, executeCleanup } from '@/lib/actions/unsubscribe'
import { getMessagesBySender, getMessageMetadata } from '@/lib/api/gmail'
import { extractEmail, getHeader } from '@/lib/parsers/headers'
import type { SenderGroup, CleanupPolicy, GmailMessageMetadata } from '@/types'

export default function GroupsNewPage() {
  const { groups, loadGroups, selectedGroups, toggleGroupSelection, clearSelection, addActionLog, logout } = useAppStore()
  const [selectedGroup, setSelectedGroup] = useState<SenderGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [sampleEmails, setSampleEmails] = useState<GmailMessageMetadata[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Load sample emails when group is selected
  useEffect(() => {
    if (selectedGroup) {
      loadSampleEmails(selectedGroup)
    }
  }, [selectedGroup?.id])

  const loadSampleEmails = async (grp: SenderGroup) => {
    setLoadingEmails(true)
    try {
      const senderEmail = extractEmail(grp.domain) || grp.domain
      const messageIds = await getMessagesBySender(senderEmail, 5)
      const emails = await Promise.all(
        messageIds.slice(0, 5).map(id => getMessageMetadata(id, ['From', 'Subject', 'Date']))
      )
      setSampleEmails(emails)
    } catch (error) {
      console.error('Failed to load sample emails:', error)
    } finally {
      setLoadingEmails(false)
    }
  }

  const handleUnsubscribe = async (group: SenderGroup) => {
    setLoading(true)
    const result = await executeUnsubscribe(group)

    await addActionLog({
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      groupId: group.id,
      action: 'unsubscribe',
      method: group.unsubscribe.kind === 'unknown' ? undefined : group.unsubscribe.kind,
      result,
    })

    setLoading(false)
    if (result === 'success') {
      alert('Unsubscribe request sent!')
    }
  }

  const handleCleanup = async (group: SenderGroup, policy: CleanupPolicy) => {
    const count = await estimateCleanupCount(group, policy)

    let confirmMsg = `This will ${policy.mode === 'trash' ? 'move to trash' : 'archive'} ${count} messages from ${group.displayName || group.domain}.\n\n`

    if (policy.keepLast) {
      confirmMsg += `• Keeps the ${policy.keepLast} most recent emails\n`
      confirmMsg += `• ${policy.mode === 'trash' ? 'Moves to trash' : 'Archives'} all older emails\n`
    } else if (policy.olderThanDays) {
      confirmMsg += `• Only affects emails older than ${policy.olderThanDays} days\n`
      confirmMsg += `• Recent emails will NOT be touched\n`
    }

    confirmMsg += `\nContinue?`

    if (!confirm(confirmMsg)) return

    setLoading(true)
    const { result, count: actualCount } = await executeCleanup(group, policy)

    await addActionLog({
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      groupId: group.id,
      action: policy.mode === 'trash' ? 'delete' : 'archive',
      count: actualCount,
      result,
    })

    setLoading(false)
    alert(`✓ ${actualCount} messages ${policy.mode === 'trash' ? 'moved to trash' : 'archived'}`)
  }

  const handleBulkUnsubscribe = async () => {
    if (selectedGroups.size === 0) return
    if (!confirm(`Unsubscribe from ${selectedGroups.size} senders?`)) return

    setLoading(true)
    for (const groupId of selectedGroups) {
      const group = groups.find(g => g.id === groupId)
      if (group) await handleUnsubscribe(group)
    }
    setLoading(false)
    clearSelection()
  }

  const getUnsubscribeBadgeVariant = (kind: string) => {
    switch (kind) {
      case 'one-click': return 'success'
      case 'http': return 'info'
      case 'mailto': return 'warning'
      default: return 'outline'
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">SubZero</h1>
          <p className="text-xs text-muted-foreground">{groups.length} subscriptions found</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/scan'}>
            Scan
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Bulk Actions Bar */}
      {selectedGroups.size > 0 && (
        <div className="border-b bg-primary/5 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedGroups.size} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBulkUnsubscribe} disabled={loading}>
              Unsubscribe All
            </Button>
            <Button size="sm" variant="outline" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Subscription List */}
        <div className="w-96 border-r flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Subscriptions</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {groups.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No subscriptions found. Run a scan to discover them.
              </div>
            ) : (
              <div className="divide-y">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedGroup?.id === group.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className="flex items-start gap-3">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedGroups.has(group.id)}
                          onCheckedChange={() => toggleGroupSelection(group.id)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {group.displayName || group.domain || 'Unknown'}
                          </h3>
                          <Badge variant={getUnsubscribeBadgeVariant(group.unsubscribe.kind)} className="text-xs">
                            {group.unsubscribe.kind}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {group.domain}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{group.messageCount} emails</span>
                          {group.safety.protected && (
                            <Badge variant="destructive" className="text-xs">Protected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 overflow-y-auto bg-muted/20">
          {!selectedGroup ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Select a subscription</p>
                <p className="text-sm">Click on any subscription from the list to view details and take action</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {selectedGroup.displayName || selectedGroup.domain}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{selectedGroup.domain}</span>
                  {selectedGroup.category && <Badge variant="outline">{selectedGroup.category}</Badge>}
                  {selectedGroup.listId && <Badge variant="outline" className="text-xs">List-ID</Badge>}
                </div>
              </div>

              {/* Quick Stats */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{selectedGroup.messageCount}</div>
                      <div className="text-xs text-muted-foreground">Messages</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {new Date(selectedGroup.firstSeen).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-muted-foreground">First Email</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {new Date(selectedGroup.lastSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-muted-foreground">Last Email</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Unsubscribe */}
                  <Button
                    onClick={() => handleUnsubscribe(selectedGroup)}
                    disabled={loading || selectedGroup.unsubscribe.kind === 'unknown'}
                    className="w-full"
                    size="lg"
                  >
                    {selectedGroup.unsubscribe.kind === 'unknown'
                      ? '✗ No Unsubscribe Method'
                      : selectedGroup.unsubscribe.kind === 'one-click'
                      ? '✓ Unsubscribe'
                      : selectedGroup.unsubscribe.kind === 'http'
                      ? '🔗 Unsubscribe'
                      : '✉️ Unsubscribe'}
                  </Button>

                  {/* Cleanup */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCleanup(selectedGroup, { mode: 'archive', keepLast: 10 })}
                      disabled={loading}
                    >
                      Archive (keep 10)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCleanup(selectedGroup, { mode: 'trash', olderThanDays: 90 })}
                      disabled={loading}
                    >
                      Delete old (90d)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Emails */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Emails</CardTitle>
                  <CardDescription>Sample messages from this sender</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingEmails ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
                  ) : sampleEmails.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">No samples available</div>
                  ) : (
                    <div className="space-y-2">
                      {sampleEmails.map((email) => {
                        const subject = getHeader(email.headers, 'Subject') || 'No Subject'
                        const date = getHeader(email.headers, 'Date') || ''
                        return (
                          <div key={email.id} className="border rounded p-3 text-sm hover:bg-muted/50">
                            <div className="font-medium truncate mb-1">{subject}</div>
                            <div className="text-xs text-muted-foreground">
                              {date ? new Date(date).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
