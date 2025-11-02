import type { SenderGroup, UnsubscribeMethod } from '@/types'
import type { ParsedMessage } from '../parsers/headers'
import { normalizeListId } from '../parsers/headers'

// Generate a group ID from parsed message
export function generateGroupId(message: ParsedMessage): string {
  // Prefer List-Id for stable grouping
  if (message.listId) {
    return normalizeListId(message.listId)
  }

  // Fallback to domain
  if (message.domain) {
    return `domain:${message.domain}`
  }

  // Last resort: normalized display name
  return `name:${message.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
}

// Group messages by sender
export class MessageGrouper {
  private groups: Map<string, SenderGroup>

  constructor() {
    this.groups = new Map()
  }

  // Add a message to the appropriate group
  addMessage(message: ParsedMessage): void {
    const groupId = generateGroupId(message)
    const existing = this.groups.get(groupId)

    if (existing) {
      // Update existing group
      existing.messageCount++

      // Update first/last seen
      const messageDate = new Date(message.date)
      const firstSeen = new Date(existing.firstSeen)
      const lastSeen = new Date(existing.lastSeen)

      if (messageDate < firstSeen) {
        existing.firstSeen = message.date
      }
      if (messageDate > lastSeen) {
        existing.lastSeen = message.date
      }

      // Update safety info (aggregate all reasons)
      if (message.safety.protected) {
        existing.safety.protected = true
        existing.safety.reasons = [
          ...new Set([...existing.safety.reasons, ...message.safety.reasons])
        ]
      }

      // Update category if more specific
      if (!existing.category && message.category) {
        existing.category = message.category
      }

      // Update unsubscribe method if we found a better one
      if (this.isBetterUnsubscribeMethod(message.unsubscribe, existing.unsubscribe)) {
        existing.unsubscribe = message.unsubscribe
      }
    } else {
      // Create new group
      const newGroup: SenderGroup = {
        id: groupId,
        displayName: message.displayName,
        domain: message.domain,
        listId: message.listId,
        messageCount: 1,
        firstSeen: message.date,
        lastSeen: message.date,
        unsubscribe: message.unsubscribe,
        safety: message.safety,
        category: message.category,
      }

      this.groups.set(groupId, newGroup)
    }
  }

  // Determine if one unsubscribe method is better than another
  private isBetterUnsubscribeMethod(
    newMethod: UnsubscribeMethod,
    existing: UnsubscribeMethod
  ): boolean {
    // Priority: one-click > http > mailto > unknown
    const priority: Record<string, number> = {
      'one-click': 3,
      'http': 2,
      'mailto': 1,
      'unknown': 0,
    }

    return priority[newMethod.kind] > priority[existing.kind]
  }

  // Get all groups
  getGroups(): SenderGroup[] {
    return Array.from(this.groups.values())
  }

  // Get a specific group
  getGroup(id: string): SenderGroup | undefined {
    return this.groups.get(id)
  }

  // Get groups count
  getGroupsCount(): number {
    return this.groups.size
  }

  // Clear all groups
  clear(): void {
    this.groups.clear()
  }
}

// Filter groups by criteria
export interface GroupFilters {
  category?: string
  minMessageCount?: number
  maxMessageCount?: number
  unsubscribeKind?: string[]
  protected?: boolean
}

export function filterGroups(
  groups: SenderGroup[],
  filters: GroupFilters
): SenderGroup[] {
  return groups.filter(group => {
    // Filter by category
    if (filters.category && group.category !== filters.category) {
      return false
    }

    // Filter by message count
    if (filters.minMessageCount && group.messageCount < filters.minMessageCount) {
      return false
    }
    if (filters.maxMessageCount && group.messageCount > filters.maxMessageCount) {
      return false
    }

    // Filter by unsubscribe kind
    if (
      filters.unsubscribeKind &&
      filters.unsubscribeKind.length > 0 &&
      !filters.unsubscribeKind.includes(group.unsubscribe.kind)
    ) {
      return false
    }

    // Filter by protection status
    if (filters.protected !== undefined && group.safety.protected !== filters.protected) {
      return false
    }

    return true
  })
}

// Sort groups
export type GroupSortBy = 'messageCount' | 'lastSeen' | 'firstSeen' | 'displayName'

export function sortGroups(
  groups: SenderGroup[],
  sortBy: GroupSortBy = 'messageCount',
  ascending = false
): SenderGroup[] {
  const sorted = [...groups].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'messageCount':
        comparison = a.messageCount - b.messageCount
        break
      case 'lastSeen':
        comparison = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime()
        break
      case 'firstSeen':
        comparison = new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime()
        break
      case 'displayName':
        comparison = a.displayName.localeCompare(b.displayName)
        break
    }

    return ascending ? comparison : -comparison
  })

  return sorted
}

// Get statistics about groups
export interface GroupStats {
  totalGroups: number
  totalMessages: number
  oneClickAvailable: number
  httpAvailable: number
  mailtoOnly: number
  unknown: number
  protected: number
  byCategory: Record<string, number>
}

export function getGroupStats(groups: SenderGroup[]): GroupStats {
  const stats: GroupStats = {
    totalGroups: groups.length,
    totalMessages: 0,
    oneClickAvailable: 0,
    httpAvailable: 0,
    mailtoOnly: 0,
    unknown: 0,
    protected: 0,
    byCategory: {},
  }

  groups.forEach(group => {
    stats.totalMessages += group.messageCount

    switch (group.unsubscribe.kind) {
      case 'one-click':
        stats.oneClickAvailable++
        break
      case 'http':
        stats.httpAvailable++
        break
      case 'mailto':
        stats.mailtoOnly++
        break
      case 'unknown':
        stats.unknown++
        break
    }

    if (group.safety.protected) {
      stats.protected++
    }

    if (group.category) {
      stats.byCategory[group.category] = (stats.byCategory[group.category] || 0) + 1
    }
  })

  return stats
}

// Scan email bodies for unsubscribe links for groups with unknown method
export async function scanGroupForBodyUnsubscribe(
  group: SenderGroup
): Promise<UnsubscribeMethod> {
  try {
    const { getMessagesBySender, getMessageBody } = await import('../api/gmail')
    const { scanBodyForUnsubscribeLink } = await import('../parsers/headers')

    // Get one recent message from this sender
    const messageIds = await getMessagesBySender(group.domain, 1)

    if (messageIds.length === 0) {
      return group.unsubscribe
    }

    // Fetch the body of the first message
    const body = await getMessageBody(messageIds[0])

    // Scan for unsubscribe link
    const unsubscribeUrl = scanBodyForUnsubscribeLink(body)

    if (unsubscribeUrl) {
      // Found an unsubscribe link in the body
      return {
        kind: 'http',
        url: unsubscribeUrl,
        hasListId: !!group.listId,
      }
    }

    // No link found, return original
    return group.unsubscribe
  } catch (error) {
    console.error('Failed to scan body for unsubscribe link:', error)
    return group.unsubscribe
  }
}
