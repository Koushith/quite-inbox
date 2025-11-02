import type { SenderGroup, ActionResult, CleanupPolicy } from '@/types'
import { getMessagesBySender, archiveMessages, trashMessages, createFilter } from '../api/gmail'
import { extractEmail } from '../parsers/headers'

// One-click unsubscribe (RFC 8058)
export async function oneClickUnsubscribe(url: string): Promise<ActionResult> {
  try {
    const urlObj = new URL(url)

    // Security check: ensure HTTPS
    if (urlObj.protocol !== 'https:') {
      throw new Error('One-click unsubscribe URL must use HTTPS')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'List-Unsubscribe=One-Click',
      // Disable following redirects for security
      redirect: 'manual',
    })

    // RFC 8058: Accept 2xx and 3xx responses
    if (response.status >= 200 && response.status < 400) {
      return 'success'
    }

    throw new Error(`Unsubscribe failed with status ${response.status}`)
  } catch (error) {
    console.error('One-click unsubscribe error:', error)
    return 'fail'
  }
}

// Open HTTP unsubscribe link in new tab
export function openHttpUnsubscribe(url: string): ActionResult {
  try {
    const urlObj = new URL(url)

    // Security check: only allow http(s)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid unsubscribe URL protocol')
    }

    window.open(url, '_blank', 'noopener,noreferrer')
    return 'success'
  } catch (error) {
    console.error('Open HTTP unsubscribe error:', error)
    return 'fail'
  }
}

// Open mailto unsubscribe
export function openMailtoUnsubscribe(mailto: string): ActionResult {
  try {
    // Parse mailto URL
    if (!mailto.startsWith('mailto:')) {
      throw new Error('Invalid mailto URL')
    }

    // Extract email and parameters
    const mailtoUrl = new URL(mailto)
    const email = mailtoUrl.pathname
    const subject = mailtoUrl.searchParams.get('subject') || 'Unsubscribe'
    const body = mailtoUrl.searchParams.get('body') || 'Please unsubscribe me from this mailing list.'

    // Build proper mailto link
    const finalMailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Open default mail client
    window.location.href = finalMailto

    return 'success'
  } catch (error) {
    console.error('Open mailto unsubscribe error:', error)
    return 'fail'
  }
}

// Execute unsubscribe action based on group's method
export async function executeUnsubscribe(group: SenderGroup): Promise<ActionResult> {
  const { unsubscribe } = group

  switch (unsubscribe.kind) {
    case 'one-click':
      if (unsubscribe.url) {
        return oneClickUnsubscribe(unsubscribe.url)
      }
      return 'fail'

    case 'http':
      if (unsubscribe.url) {
        return openHttpUnsubscribe(unsubscribe.url)
      }
      return 'fail'

    case 'mailto':
      if (unsubscribe.mailto) {
        return openMailtoUnsubscribe(unsubscribe.mailto)
      }
      return 'fail'

    case 'unknown':
    default:
      // Try scanning body for unsubscribe link
      try {
        const { scanGroupForBodyUnsubscribe } = await import('../grouping/engine')
        const updatedMethod = await scanGroupForBodyUnsubscribe(group)

        // If we found a link, open it
        if (updatedMethod.kind === 'http' && updatedMethod.url) {
          // Update the group's unsubscribe method for future use
          group.unsubscribe = updatedMethod

          // Save to storage
          const { storage } = await import('../storage/db')
          const allGroups = await storage.getSenderGroups()
          const groupIndex = allGroups.findIndex((g: SenderGroup) => g.id === group.id)
          if (groupIndex !== -1) {
            allGroups[groupIndex] = group
            await storage.saveSenderGroups(allGroups)
          }

          return openHttpUnsubscribe(updatedMethod.url)
        }
      } catch (error) {
        console.error('Body scan failed:', error)
      }

      return 'skipped'
  }
}

// Get messages for cleanup
export async function getMessagesForCleanup(
  group: SenderGroup,
  policy: CleanupPolicy
): Promise<string[]> {
  // Get all messages from this sender
  const senderEmail = extractEmail(group.domain) || group.domain
  const allMessageIds = await getMessagesBySender(senderEmail)

  // If no policy filters, return all
  if (!policy.olderThanDays && !policy.keepLast) {
    return allMessageIds
  }

  // Apply policy filters
  // Note: This is a simplified version. In production, we'd need to fetch
  // metadata for each message to check dates. For now, we'll use a heuristic.

  if (policy.keepLast) {
    // Keep the most recent N messages
    return allMessageIds.slice(policy.keepLast)
  }

  // For olderThanDays, we'd need to fetch dates, so return all for now
  // TODO: Implement date-based filtering with metadata
  return allMessageIds
}

// Execute cleanup action
export async function executeCleanup(
  group: SenderGroup,
  policy: CleanupPolicy
): Promise<{ result: ActionResult; count: number }> {
  try {
    const messageIds = await getMessagesForCleanup(group, policy)

    if (messageIds.length === 0) {
      return { result: 'skipped', count: 0 }
    }

    // Gmail API limit is 1000 messages per batch request
    const BATCH_SIZE = 1000
    const batches: string[][] = []

    for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
      batches.push(messageIds.slice(i, i + BATCH_SIZE))
    }

    console.log(`Processing ${messageIds.length} messages in ${batches.length} batches`)

    // Execute each batch
    for (const batch of batches) {
      if (policy.mode === 'trash') {
        await trashMessages(batch)
      } else {
        await archiveMessages(batch)
      }
      console.log(`Processed batch of ${batch.length} messages`)
    }

    return { result: 'success', count: messageIds.length }
  } catch (error) {
    console.error('Cleanup error:', error)
    return { result: 'fail', count: 0 }
  }
}

// Create filter to auto-archive future messages
export async function createAutoArchiveFilter(group: SenderGroup): Promise<ActionResult> {
  try {
    const senderEmail = extractEmail(group.domain) || group.domain

    await createFilter({
      criteria: {
        from: senderEmail,
      },
      action: {
        removeLabelIds: ['INBOX'],
      },
    })

    return 'success'
  } catch (error) {
    console.error('Create filter error:', error)
    return 'fail'
  }
}

// Batch unsubscribe from multiple groups
export async function batchUnsubscribe(
  groups: SenderGroup[],
  onProgress?: (processed: number, total: number, current: SenderGroup) => void
): Promise<{ success: number; failed: number; skipped: number }> {
  const results = { success: 0, failed: 0, skipped: 0 }

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const result = await executeUnsubscribe(group)

    switch (result) {
      case 'success':
        results.success++
        break
      case 'fail':
        results.failed++
        break
      case 'skipped':
        results.skipped++
        break
    }

    if (onProgress) {
      onProgress(i + 1, groups.length, group)
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

// Estimate cleanup count (dry run)
export async function estimateCleanupCount(
  group: SenderGroup,
  policy: CleanupPolicy
): Promise<number> {
  try {
    const messageIds = await getMessagesForCleanup(group, policy)
    return messageIds.length
  } catch (error) {
    console.error('Estimate cleanup error:', error)
    return 0
  }
}
