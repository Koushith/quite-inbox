import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { storage } from '@/lib/storage/db'
import { executeUnsubscribe, estimateCleanupCount, executeCleanup } from '@/lib/actions/unsubscribe'
import { getMessagesBySender, getMessageMetadata } from '@/lib/api/gmail'
import { extractEmail, getHeader } from '@/lib/parsers/headers'
import type { SenderGroup, CleanupPolicy, GmailMessageMetadata } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addActionLog } = useAppStore()
  const [group, setGroup] = useState<SenderGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [sampleEmails, setSampleEmails] = useState<GmailMessageMetadata[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)

  useEffect(() => {
    if (id) {
      storage.getSenderGroup(decodeURIComponent(id)).then(g => {
        console.log('🔍 Loaded group:', {
          id: g?.id,
          displayName: g?.displayName,
          domain: g?.domain,
          messageCount: g?.messageCount,
          unsubscribe: g?.unsubscribe,
          fullGroup: g
        })
        setGroup(g || null)

        // Load sample emails
        if (g) {
          loadSampleEmails(g)
        }
      })
    }
  }, [id])

  const loadSampleEmails = async (grp: SenderGroup) => {
    setLoadingEmails(true)
    try {
      const senderEmail = extractEmail(grp.domain) || grp.domain
      console.log('📨 Loading sample emails for:', {
        groupDomain: grp.domain,
        groupDisplayName: grp.displayName,
        extractedEmail: senderEmail
      })

      const messageIds = await getMessagesBySender(senderEmail, 5)
      console.log('📬 Found message IDs:', messageIds)

      // Get metadata for sample messages
      const emails = await Promise.all(
        messageIds.slice(0, 5).map(id => getMessageMetadata(id, ['From', 'Subject', 'Date']))
      )

      console.log('📧 Loaded sample emails:', emails.map(e => ({
        id: e.id,
        headers: e.headers?.map(h => `${h.name}: ${h.value?.substring(0, 30)}`)
      })))

      setSampleEmails(emails)
    } catch (error) {
      console.error('❌ Failed to load sample emails:', error)
    } finally {
      setLoadingEmails(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!group) return

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

  const handleCleanup = async (policy: CleanupPolicy) => {
    if (!group) return

    const count = await estimateCleanupCount(group, policy)

    // Build detailed confirmation message
    let confirmMsg = `This will ${policy.mode === 'trash' ? 'move to trash' : 'archive'} ${count} messages from ${group.displayName || group.domain}.\n\n`

    if (policy.keepLast) {
      confirmMsg += `• Keeps the ${policy.keepLast} most recent emails\n`
      confirmMsg += `• ${policy.mode === 'trash' ? 'Moves to trash' : 'Archives'} all older emails (${count} messages)\n`
    } else if (policy.olderThanDays) {
      confirmMsg += `• Only affects emails older than ${policy.olderThanDays} days\n`
      confirmMsg += `• Recent emails (last ${policy.olderThanDays} days) will NOT be touched\n`
      confirmMsg += `• ${count} older messages will be ${policy.mode === 'trash' ? 'moved to trash' : 'archived'}\n`
    }

    confirmMsg += `\n${policy.mode === 'trash' ? '⚠️ Emails will be moved to trash (recoverable for 30 days)' : '📁 Emails will be archived (still searchable, just removed from inbox)'}\n\nContinue?`

    if (!confirm(confirmMsg)) {
      return
    }

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
    alert(`✓ ${actualCount} messages ${policy.mode === 'trash' ? 'moved to trash' : 'archived'} successfully!`)
  }

  if (!group) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button variant="outline" onClick={() => navigate('/groups')}>
            ← Back to Groups
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {group.displayName || group.domain || 'Unknown Sender'}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="font-mono text-sm">{group.domain}</span>
            {group.category && <Badge variant="outline">{group.category}</Badge>}
            {group.listId && <Badge variant="outline" className="text-xs">Has List-ID</Badge>}
            {group.safety.protected && (
              <Badge variant="destructive" className="text-xs">🛡️ Protected</Badge>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Subscription Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Total Messages</div>
                    <div className="text-2xl font-bold">{group.messageCount}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Unsubscribe Method</div>
                    <Badge variant={
                      group.unsubscribe.kind === 'one-click' ? 'success' :
                      group.unsubscribe.kind === 'http' ? 'info' :
                      group.unsubscribe.kind === 'mailto' ? 'warning' : 'outline'
                    } className="mt-1">
                      {group.unsubscribe.kind}
                    </Badge>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">First Received</div>
                    <div className="text-sm font-semibold">
                      {new Date(group.firstSeen).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Last Received</div>
                    <div className="text-sm font-semibold">
                      {new Date(group.lastSeen).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 space-y-2 text-sm">
                  {group.listId && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-20">List-ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded break-all">{group.listId}</code>
                    </div>
                  )}
                  {group.unsubscribe.url && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-20">Unsub URL:</span>
                      <a
                        href={group.unsubscribe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all text-xs"
                      >
                        {group.unsubscribe.url}
                      </a>
                    </div>
                  )}
                  {group.unsubscribe.mailto && (
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-20">Mailto:</span>
                      <a
                        href={group.unsubscribe.mailto}
                        className="text-primary hover:underline break-all text-xs"
                      >
                        {group.unsubscribe.mailto}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Safety Warning */}
            {group.safety.protected && group.safety.reasons.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-destructive mb-2">Protected Sender</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        This sender has been flagged with protected keywords. Be careful with bulk actions.
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {group.safety.reasons.map((reason, i) => (
                          <li key={i} className="text-destructive">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Emails Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Emails</CardTitle>
                <CardDescription>
                  Sample messages from this sender (showing up to 5 most recent)
                </CardDescription>
              </CardHeader>
              <CardContent>
            {loadingEmails ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading sample emails...
              </div>
            ) : sampleEmails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sample emails available
              </div>
            ) : (
              <div className="space-y-3">
                {sampleEmails.map((email, idx) => {
                  // Use case-insensitive header extraction
                  const from = getHeader(email.headers, 'From') || 'Unknown'
                  const subject = getHeader(email.headers, 'Subject') || 'No Subject'
                  const date = getHeader(email.headers, 'Date') || ''

                  return (
                    <div key={email.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {date ? new Date(date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Unknown date'}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm mb-1 truncate">{subject}</h4>
                          <p className="text-xs text-muted-foreground truncate">From: {from}</p>
                          {email.snippet && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {email.snippet}
                            </p>
                          )}
                        </div>
                        <a
                          href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline whitespace-nowrap"
                        >
                          View in Gmail →
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Unsubscribe Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📧</span> Unsubscribe
                </CardTitle>
                <CardDescription>
                  {group.unsubscribe.kind === 'unknown'
                    ? 'No automatic unsubscribe method available'
                    : group.unsubscribe.kind === 'one-click'
                    ? 'One-click unsubscribe available'
                    : group.unsubscribe.kind === 'http'
                    ? 'Opens unsubscribe page in new tab'
                    : 'Composes unsubscribe email'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleUnsubscribe}
                  disabled={loading || group.unsubscribe.kind === 'unknown'}
                  className="w-full"
                  size="lg"
                  variant={group.unsubscribe.kind === 'one-click' ? 'default' : 'outline'}
                >
                  {group.unsubscribe.kind === 'unknown'
                    ? '✗ No Method Available'
                    : group.unsubscribe.kind === 'one-click'
                    ? '✓ One-Click Unsubscribe'
                    : group.unsubscribe.kind === 'http'
                    ? '🔗 Open Unsubscribe Page'
                    : '✉️ Compose Unsubscribe Email'
                  }
                </Button>

                {group.unsubscribe.kind === 'unknown' && (
                  <p className="text-xs text-muted-foreground">
                    This sender doesn't provide a standard unsubscribe method.
                    You may need to unsubscribe manually or mark as spam.
                  </p>
                )}

                {group.unsubscribe.url && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <span className="font-medium">Direct link:</span>
                    <a
                      href={group.unsubscribe.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline truncate mt-1"
                    >
                      {group.unsubscribe.url}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cleanup Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🗑️</span> Clean Up Emails
                </CardTitle>
                <CardDescription>
                  Archive or delete old emails from this sender
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Archive (Keeps emails searchable)
                  </p>
                  <Button
                    onClick={() => handleCleanup({ mode: 'archive', keepLast: 10 })}
                    variant="outline"
                    disabled={loading}
                    className="w-full h-auto py-3 flex flex-col items-start text-left"
                  >
                    <span className="font-semibold">Keep Last 10</span>
                    <span className="text-xs text-muted-foreground">
                      Archives all except 10 most recent emails
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleCleanup({ mode: 'archive', keepLast: 5 })}
                    variant="outline"
                    disabled={loading}
                    className="w-full h-auto py-3 flex flex-col items-start text-left"
                  >
                    <span className="font-semibold">Keep Last 5</span>
                    <span className="text-xs text-muted-foreground">
                      More aggressive cleanup
                    </span>
                  </Button>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wide">
                    Delete (Moves to trash - 30 day recovery)
                  </p>
                  <Button
                    onClick={() => handleCleanup({ mode: 'trash', olderThanDays: 90 })}
                    variant="outline"
                    disabled={loading}
                    className="w-full h-auto py-3 flex flex-col items-start text-left border-destructive/30 hover:bg-destructive/10"
                  >
                    <span className="font-semibold">Older than 90 days</span>
                    <span className="text-xs text-muted-foreground">
                      Keeps emails from last 3 months
                    </span>
                  </Button>
                  <Button
                    onClick={() => handleCleanup({ mode: 'trash', olderThanDays: 30 })}
                    variant="outline"
                    disabled={loading}
                    className="w-full h-auto py-3 flex flex-col items-start text-left border-destructive/30 hover:bg-destructive/10"
                  >
                    <span className="font-semibold">Older than 30 days</span>
                    <span className="text-xs text-muted-foreground">
                      Keep only this month's emails
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
