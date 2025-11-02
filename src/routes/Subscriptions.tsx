import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { executeUnsubscribe, executeCleanup } from '@/lib/actions/unsubscribe'
import type { SenderGroup } from '@/types'
import { Toaster, toast } from 'sonner'
import { storage } from '@/lib/storage/db'
import Navbar from '@/components/Navbar'

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const { groups, loadGroups, addActionLog, scanState } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'date'>('count')
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all')
  const [unsubscribingIds, setUnsubscribingIds] = useState<Set<string>>(new Set())
  const [unsubscribedIds, setUnsubscribedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('unsubscribedIds')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; group: SenderGroup | null }>({
    open: false,
    group: null
  })
  const [unsubscribeAllDialog, setUnsubscribeAllDialog] = useState(false)

  // Email detail view
  const [selectedGroup, setSelectedGroup] = useState<SenderGroup | null>(null)
  const [emails, setEmails] = useState<any[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Save unsubscribed state to localStorage
  useEffect(() => {
    localStorage.setItem('unsubscribedIds', JSON.stringify([...unsubscribedIds]))
  }, [unsubscribedIds])

  // Fetch emails when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      fetchEmails(selectedGroup)
    }
  }, [selectedGroup])

  const fetchEmails = async (group: SenderGroup) => {
    setLoadingEmails(true)
    setEmails([])

    try {
      const { getMessagesBySender, batchGetMetadata } = await import('@/lib/api/gmail')
      // Fetch all emails from this sender (up to 1000)
      const messageIds = await getMessagesBySender(group.domain)

      if (messageIds.length > 0) {
        const metadata = await batchGetMetadata(messageIds)
        setEmails(metadata)
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
      toast.error('Failed to load emails')
    } finally {
      setLoadingEmails(false)
    }
  }

  const handleRowClick = (group: SenderGroup) => {
    setSelectedGroup(group)
  }

  const closeEmailDrawer = () => {
    setSelectedGroup(null)
    setEmails([])
  }

  const handleUnsubscribe = async (group: SenderGroup) => {
    // Optimistic UI update
    setUnsubscribingIds(prev => new Set(prev).add(group.id))

    // Show scanning message for unknown groups
    const isUnknown = group.unsubscribe.kind === 'unknown'
    if (isUnknown) {
      toast.info('Scanning email body for unsubscribe link...', {
        description: 'This may take a few seconds',
        duration: 3000
      })
    }

    const result = await executeUnsubscribe(group)

    await addActionLog({
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      groupId: group.id,
      action: 'unsubscribe',
      method: group.unsubscribe.kind === 'unknown' ? undefined : group.unsubscribe.kind,
      result,
    })

    setUnsubscribingIds(prev => {
      const next = new Set(prev)
      next.delete(group.id)
      return next
    })

    if (result === 'success') {
      setUnsubscribedIds(prev => new Set(prev).add(group.id))

      // Reload groups to get updated unsubscribe method
      if (isUnknown) {
        await loadGroups()
      }

      if (group.unsubscribe.kind === 'one-click') {
        toast.success('Unsubscribed successfully!', {
          description: 'You can now delete all emails from this sender'
        })
      } else if (group.unsubscribe.kind === 'http' || isUnknown) {
        toast.info('Opened unsubscribe page', {
          description: 'Complete the process in the new tab to stop future emails',
          duration: 5000
        })
      } else if (group.unsubscribe.kind === 'mailto') {
        toast.info('Opened email client', {
          description: 'Send the unsubscribe email to stop future emails',
          duration: 5000
        })
      }
    } else if (result === 'skipped') {
      toast.error('No unsubscribe method found', {
        description: 'Try opening an email to find the unsubscribe link manually'
      })
    } else {
      toast.error('Failed to unsubscribe', {
        description: 'Please try again or contact support'
      })
    }
  }

  const handleDeleteAll = async () => {
    const group = deleteDialog.group
    if (!group) return

    setDeleteDialog({ open: false, group: null })
    setDeletingIds(prev => new Set(prev).add(group.id))

    toast.promise(
      (async () => {
        const { result, count } = await executeCleanup(group, { mode: 'trash', keepLast: 0 })

        await addActionLog({
          id: crypto.randomUUID(),
          ts: new Date().toISOString(),
          groupId: group.id,
          action: 'delete',
          count,
          result,
        })

        if (result !== 'success') throw new Error('Delete failed')

        // Remove the group from storage and update UI
        await storage.deleteSenderGroup(group.id)
        await loadGroups()

        return count
      })(),
      {
        loading: `Deleting ${group.messageCount} emails...`,
        success: (count) => `Deleted ${count} emails successfully`,
        error: 'Failed to delete emails',
        finally: () => {
          setDeletingIds(prev => {
            const next = new Set(prev)
            next.delete(group.id)
            return next
          })
        }
      }
    )
  }

  const handleUnsubscribeAll = async () => {
    setUnsubscribeAllDialog(false)
    setLoading(true)

    for (const group of groups) {
      if (group.unsubscribe.kind !== 'unknown' && !unsubscribedIds.has(group.id)) {
        await handleUnsubscribe(group)
      }
    }

    setLoading(false)
    toast.success('Batch unsubscribe completed')
  }

  // Filter groups based on selected tab
  const filteredGroups = groups.filter(g => {
    if (filter === 'unsubscribed') return unsubscribedIds.has(g.id)
    if (filter === 'active') return !unsubscribedIds.has(g.id)
    return true // 'all'
  })

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'count':
        return b.messageCount - a.messageCount
      case 'name':
        return (a.displayName || a.domain).localeCompare(b.displayName || b.domain)
      case 'date':
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
      default:
        return 0
    }
  })

  // Calculate insightful stats
  const activeGroups = groups.filter(g => !unsubscribedIds.has(g.id))
  const totalEmails = groups.reduce((sum, g) => sum + g.messageCount, 0)

  // Calculate date range from emails
  const dates = groups.flatMap(g => [new Date(g.firstSeen), new Date(g.lastSeen)])
  const oldestDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
  const newestDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null

  // Calculate time span in days
  const timeSpanDays = oldestDate && newestDate
    ? Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Calculate weekly average
  const weeksSpanned = timeSpanDays > 0 ? timeSpanDays / 7 : 1
  const emailsPerWeek = Math.round(totalEmails / weeksSpanned)

  const stats = {
    total: groups.length,
    active: activeGroups.length,
    unsubscribed: unsubscribedIds.size,
    totalEmails,
    emailsPerWeek,
    dateRange: oldestDate && newestDate ? {
      oldest: oldestDate,
      newest: newestDate,
      span: timeSpanDays
    } : null
  }

  const getStatusInfo = (group: SenderGroup, isUnsubscribed: boolean) => {
    if (isUnsubscribed) {
      return {
        label: 'Unsubscribed',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '✓'
      }
    }

    if (group.safety.protected) {
      return {
        label: 'Protected',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: '🛡'
      }
    }

    if (group.unsubscribe.kind === 'unknown') {
      return {
        label: 'No unsubscribe',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: '✗'
      }
    }

    return {
      label: 'Can unsubscribe',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '✓'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Scanning Progress Banner */}
      {scanState.isScanning && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <div>
                <span className="text-sm font-semibold text-blue-900">
                  Scanning your inbox
                </span>
                <span className="text-xs text-blue-700 ml-2">
                  {scanState.progress.processed} / {scanState.progress.total} messages
                </span>
              </div>
            </div>
            <span className="text-xs text-blue-600 font-medium">
              Results appear live
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center mt-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscriptions Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start by scanning your inbox to discover all your email subscriptions and take control of your inbox.
            </p>
            <Button
              onClick={() => navigate('/scan')}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
            >
              Start Your First Scan
            </Button>
          </div>
        ) : (
          <>
            {/* Date Range Context */}
            {stats.dateRange && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-blue-900">
                    Showing emails from {stats.dateRange.oldest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {stats.dateRange.newest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-blue-600">
                    ({stats.dateRange.span} days)
                  </span>
                </div>
              </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Subscriptions Found</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-xs text-gray-500">Total senders detected</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Still Active</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.active}</div>
                <div className="text-xs text-blue-600">Not yet unsubscribed</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Cleaned Up</div>
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.unsubscribed}</div>
                <div className="text-xs text-green-600">Successfully unsubscribed</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-orange-600 uppercase tracking-wider mb-1">Weekly Volume</div>
                <div className="text-3xl font-bold text-orange-600 mb-1">{stats.emailsPerWeek.toLocaleString()}</div>
                <div className="text-xs text-orange-600">Emails per week average</div>
              </div>
            </div>

            {/* Tabs & Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-gray-100 gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      filter === 'all'
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    All <span className="ml-1.5 text-xs opacity-75">({stats.total})</span>
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      filter === 'active'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Active <span className="ml-1.5 text-xs opacity-75">({stats.active})</span>
                  </button>
                  <button
                    onClick={() => setFilter('unsubscribed')}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      filter === 'unsubscribed'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Unsubscribed <span className="ml-1.5 text-xs opacity-75">({stats.unsubscribed})</span>
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <select
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'count' | 'name' | 'date')}
                  >
                    <option value="count">Sort by: Email Count</option>
                    <option value="name">Sort by: Name</option>
                    <option value="date">Sort by: Date</option>
                  </select>

                  {filter === 'active' && (
                    <Button
                      onClick={() => setUnsubscribeAllDialog(true)}
                      disabled={loading || stats.active === 0}
                      variant="destructive"
                      size="sm"
                      className="shadow-sm"
                    >
                      Unsubscribe All
                    </Button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="divide-y divide-gray-100">
                {sortedGroups.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No subscriptions found in this category</p>
                  </div>
                ) : (
                  sortedGroups.map((group) => {
                    const isUnsubscribing = unsubscribingIds.has(group.id)
                    const isUnsubscribed = unsubscribedIds.has(group.id)
                    const isDeleting = deletingIds.has(group.id)
                    const status = getStatusInfo(group, isUnsubscribed)

                    return (
                      <div
                        key={group.id}
                        className={`px-6 py-5 hover:bg-gray-50/50 transition-all cursor-pointer group ${
                          isDeleting ? 'opacity-50' : ''
                        }`}
                        onClick={() => handleRowClick(group)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Left: Sender Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm group-hover:from-gray-200 group-hover:to-gray-300 transition-colors">
                                {(group.displayName || group.domain).charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate text-base">
                                  {group.displayName || group.domain}
                                </div>
                                <div className="text-sm text-gray-500 truncate mt-0.5">
                                  {group.domain}
                                </div>
                              </div>
                              {/* Status Badge */}
                              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${status.bgColor} ${status.color} flex items-center gap-1.5 whitespace-nowrap shadow-sm`}>
                                <span className="text-base">{status.icon}</span>
                                <span>{status.label}</span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: Stats */}
                          <div className="flex items-center gap-6 text-sm lg:ml-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 font-medium">Emails:</span>
                              <span className="font-bold text-gray-900">{group.messageCount.toLocaleString()}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                              <span className="text-gray-500 font-medium">Last:</span>
                              <span className="text-gray-700 font-semibold">
                                {new Date(group.lastSeen).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 lg:ml-4">
                            {isUnsubscribed ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteDialog({ open: true, group })
                                }}
                                disabled={isDeleting}
                                className="w-full sm:w-auto font-semibold shadow-sm"
                              >
                                {isDeleting ? 'Deleting...' : 'Delete Emails'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUnsubscribe(group)
                                }}
                                disabled={loading || isUnsubscribing}
                                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-sm"
                              >
                                {isUnsubscribing
                                  ? group.unsubscribe.kind === 'unknown'
                                    ? 'Scanning...'
                                    : 'Unsubscribing...'
                                  : group.unsubscribe.kind === 'unknown'
                                  ? 'Try Unsubscribe'
                                  : 'Unsubscribe'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, group: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Emails?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all {deleteDialog.group?.messageCount.toLocaleString()} emails from{' '}
              <strong>{deleteDialog.group?.displayName || deleteDialog.group?.domain}</strong>?
              <br /><br />
              Emails will be moved to trash and can be recovered for 30 days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, group: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAll}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsubscribe All Confirmation Dialog */}
      <Dialog open={unsubscribeAllDialog} onOpenChange={setUnsubscribeAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsubscribe from All?</DialogTitle>
            <DialogDescription>
              Are you sure you want to unsubscribe from all {groups.filter(g => g.unsubscribe.kind !== 'unknown' && !unsubscribedIds.has(g.id)).length} subscriptions?
              <br /><br />
              This action will attempt to unsubscribe you from all senders that have an unsubscribe method available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnsubscribeAllDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnsubscribeAll} disabled={loading}>
              {loading ? 'Processing...' : 'Unsubscribe from All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Detail Drawer */}
      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && closeEmailDrawer()}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">
              {selectedGroup?.displayName || selectedGroup?.domain}
            </DialogTitle>
            <DialogDescription className="mt-2">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Domain:</span>
                  <span className="text-gray-900 font-medium">{selectedGroup?.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total Emails:</span>
                  <span className="text-gray-900 font-medium">{selectedGroup?.messageCount.toLocaleString()}</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loadingEmails ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
                  <p className="text-gray-600">Loading emails...</p>
                </div>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No emails found
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email, index) => {
                  const subject = email.headers?.find((h: any) => h.name === 'Subject')?.value || '(No subject)'
                  const date = email.headers?.find((h: any) => h.name === 'Date')?.value
                  const snippet = email.snippet || ''
                  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${email.id}`

                  return (
                    <div
                      key={email.id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2">
                          {subject}
                        </h3>
                        <div className="flex items-center gap-2">
                          {date && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(gmailUrl, '_blank')
                            }}
                          >
                            Open in Gmail
                          </Button>
                        </div>
                      </div>
                      {snippet && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {snippet}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={closeEmailDrawer}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-right" richColors />
    </div>
  )
}
