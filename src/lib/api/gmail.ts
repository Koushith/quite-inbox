import { getValidAccessToken } from '../auth/oauth'
import type { GmailListResponse, GmailMessageMetadata } from '@/types'

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1'

// Helper function to handle API requests with auth
async function gmailRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getValidAccessToken()

  const response = await fetch(`${GMAIL_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Gmail API error: ${response.status} - ${error.error?.message || response.statusText}`
    )
  }

  // Handle responses with no content (204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T
  }

  // Check if response has content before parsing
  const text = await response.text()
  if (!text || text.length === 0) {
    return {} as T
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('Failed to parse JSON response:', text)
    throw new Error('Invalid JSON response from Gmail API')
  }
}

// Exponential backoff for quota handling
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if it's a quota error
      if (
        error instanceof Error &&
        (error.message.includes('429') || error.message.includes('quota'))
      ) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      // If it's not a quota error, throw immediately
      throw error
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

// List messages with filters
export interface ListMessagesOptions {
  query?: string
  maxResults?: number
  pageToken?: string
  labelIds?: string[]
}

export async function listMessages(
  options: ListMessagesOptions = {}
): Promise<GmailListResponse> {
  const params = new URLSearchParams()

  if (options.query) params.append('q', options.query)
  if (options.maxResults) params.append('maxResults', options.maxResults.toString())
  if (options.pageToken) params.append('pageToken', options.pageToken)
  if (options.labelIds && options.labelIds.length > 0) {
    options.labelIds.forEach(id => params.append('labelIds', id))
  }

  const queryString = params.toString()
  const endpoint = `/users/me/messages${queryString ? `?${queryString}` : ''}`

  return withRetry(() => gmailRequest<GmailListResponse>(endpoint))
}

// Get message metadata
export async function getMessageMetadata(
  messageId: string,
  headers: string[] = ['From', 'Date', 'Subject', 'List-Unsubscribe', 'List-Id']
): Promise<GmailMessageMetadata> {
  // Gmail API requires array notation: metadataHeaders[]=From&metadataHeaders[]=Subject
  const params = new URLSearchParams({
    format: 'metadata',
  })

  // Add each header as a separate array parameter
  headers.forEach(header => {
    params.append('metadataHeaders', header)
  })

  const endpoint = `/users/me/messages/${messageId}?${params.toString()}`

  console.log('🔍 Fetching metadata with URL:', endpoint)

  const response = await withRetry(() => gmailRequest<any>(endpoint))

  // Gmail API returns headers in payload.headers, but we want them at the top level
  const normalized: GmailMessageMetadata = {
    ...response,
    headers: response.payload?.headers || response.headers || [],
  }

  console.log('📧 Message metadata for', messageId, ':', {
    id: normalized.id,
    hasPayload: !!response.payload,
    payloadHeaders: response.payload?.headers?.length || 0,
    rootHeaders: response.headers?.length || 0,
    normalizedHeaders: normalized.headers?.length || 0,
    headerNames: normalized.headers?.map((h: any) => `${h.name}: ${h.value?.substring(0, 50)}`) || [],
    snippet: response.snippet?.substring(0, 100)
  })

  return normalized
}

// Batch get messages metadata
export async function batchGetMetadata(
  messageIds: string[],
  headers: string[] = ['From', 'Date', 'Subject', 'List-Unsubscribe', 'List-Id']
): Promise<GmailMessageMetadata[]> {
  // Gmail API doesn't have a true batch endpoint, so we'll do concurrent requests
  // but limit concurrency to avoid rate limits
  const BATCH_SIZE = 10

  const results: GmailMessageMetadata[] = []

  for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
    const batch = messageIds.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(id => getMessageMetadata(id, headers))
    )
    results.push(...batchResults)
  }

  return results
}

// Build query string for scanning
export interface ScanOptions {
  timeWindow?: '3d' | '7d' | '3m' | '6m' | '12m' | 'all'
  categories?: string[]
}

export function buildScanQuery(options: ScanOptions = {}): string {
  const parts: string[] = []

  // Add category filters
  const categories = options.categories || ['promotions', 'forums', 'updates']
  const categoryFilters = categories.map(cat => `category:${cat}`).join(' OR ')
  if (categoryFilters) {
    parts.push(`(${categoryFilters})`)
  }

  // Add time window
  if (options.timeWindow && options.timeWindow !== 'all') {
    const timeMap: Record<string, string> = {
      '3d': '3d',
      '7d': '7d',
      '3m': '3m',
      '6m': '6m',
      '12m': '1y',
    }
    parts.push(`newer_than:${timeMap[options.timeWindow]}`)
  }

  return parts.join(' ')
}

// Scan inbox progressively
export interface ScanProgress {
  totalMessages: number
  processedMessages: number
  currentPageToken?: string
}

export async function* scanInbox(
  options: ScanOptions = {},
  onProgress?: (progress: ScanProgress) => void
): AsyncGenerator<GmailMessageMetadata[]> {
  const query = buildScanQuery(options)
  let pageToken: string | undefined
  let totalMessages = 0
  let processedMessages = 0

  do {
    // List messages
    const listResponse = await listMessages({
      query,
      maxResults: 100,
      pageToken,
    })

    totalMessages = listResponse.resultSizeEstimate || 0

    if (!listResponse.messages || listResponse.messages.length === 0) {
      break
    }

    // Get metadata for this batch
    const messageIds = listResponse.messages.map(m => m.id)
    const metadata = await batchGetMetadata(messageIds)

    processedMessages += metadata.length
    pageToken = listResponse.nextPageToken

    if (onProgress) {
      onProgress({
        totalMessages,
        processedMessages,
        currentPageToken: pageToken,
      })
    }

    yield metadata

  } while (pageToken)
}

// Delete messages
export async function deleteMessages(messageIds: string[]): Promise<void> {
  // Batch delete using batchDelete endpoint
  await withRetry(() =>
    gmailRequest('/users/me/messages/batchDelete', {
      method: 'POST',
      body: JSON.stringify({ ids: messageIds }),
    })
  )
}

// Trash messages
export async function trashMessages(messageIds: string[]): Promise<void> {
  // Batch trash using batchModify endpoint
  await withRetry(() =>
    gmailRequest('/users/me/messages/batchModify', {
      method: 'POST',
      body: JSON.stringify({
        ids: messageIds,
        addLabelIds: ['TRASH'],
      }),
    })
  )
}

// Archive messages (remove INBOX label)
export async function archiveMessages(messageIds: string[]): Promise<void> {
  await withRetry(() =>
    gmailRequest('/users/me/messages/batchModify', {
      method: 'POST',
      body: JSON.stringify({
        ids: messageIds,
        removeLabelIds: ['INBOX'],
      }),
    })
  )
}

// Create filter
export interface GmailFilter {
  criteria: {
    from?: string
    to?: string
    subject?: string
    query?: string
  }
  action: {
    addLabelIds?: string[]
    removeLabelIds?: string[]
  }
}

export async function createFilter(filter: GmailFilter): Promise<void> {
  await withRetry(() =>
    gmailRequest('/users/me/settings/filters', {
      method: 'POST',
      body: JSON.stringify(filter),
    })
  )
}

// Get messages by sender
export async function getMessagesBySender(
  senderEmail: string,
  maxResults = 1000
): Promise<string[]> {
  const query = `from:${senderEmail}`
  const response = await listMessages({ query, maxResults })

  return response.messages?.map(m => m.id) || []
}

// Get full message body (for body scanning)
export async function getMessageBody(messageId: string): Promise<string> {
  const endpoint = `/users/me/messages/${messageId}?format=full`
  const response = await withRetry(() => gmailRequest<any>(endpoint))

  // Extract body from parts
  const extractBody = (payload: any): string => {
    let body = ''

    // Check if body data exists directly
    if (payload.body?.data) {
      try {
        body += atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      } catch (e) {
        console.warn('Failed to decode body data:', e)
      }
    }

    // Check parts recursively
    if (payload.parts && Array.isArray(payload.parts)) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
          if (part.body?.data) {
            try {
              body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
            } catch (e) {
              console.warn('Failed to decode part data:', e)
            }
          }
        }
        // Recursively check nested parts
        if (part.parts) {
          body += extractBody(part)
        }
      }
    }

    return body
  }

  return extractBody(response.payload || {})
}
