import type { GmailMessageMetadata, GmailHeader, UnsubscribeMethod, SafetyInfo } from '@/types'
import { defaultSettings } from '../storage/db'

// Extract header value by name
export function getHeader(headers: GmailHeader[] | undefined, name: string): string | undefined {
  if (!headers || !Array.isArray(headers)) {
    return undefined
  }
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase())
  return header?.value
}

// Parse List-Unsubscribe header
// Format examples:
// <mailto:unsub@example.com?subject=unsubscribe>
// <https://example.com/unsub?id=123>
// <https://example.com/unsub>, <mailto:unsub@example.com>
export function parseListUnsubscribe(value: string): {
  http?: string
  mailto?: string
} {
  const result: { http?: string; mailto?: string } = {}

  // Match URLs in angle brackets
  const urlRegex = /<([^>]+)>/g
  let match

  while ((match = urlRegex.exec(value)) !== null) {
    const url = match[1].trim()

    if (url.startsWith('mailto:')) {
      result.mailto = url
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      result.http = url
    }
  }

  return result
}

// Check if List-Unsubscribe-Post header exists (RFC 8058 one-click)
export function hasOneClickUnsubscribe(headers: GmailHeader[] | undefined): boolean {
  const postHeader = getHeader(headers, 'List-Unsubscribe-Post')
  return postHeader?.toLowerCase().includes('list-unsubscribe=one-click') || false
}

// Detect unsubscribe method from headers
export function detectUnsubscribeMethod(message: GmailMessageMetadata): UnsubscribeMethod {
  const { headers = [] } = message

  const listUnsubscribe = getHeader(headers, 'List-Unsubscribe')
  const listId = getHeader(headers, 'List-Id')
  const hasOneClick = hasOneClickUnsubscribe(headers)

  if (!listUnsubscribe) {
    return {
      kind: 'unknown',
      hasListId: !!listId,
    }
  }

  const parsed = parseListUnsubscribe(listUnsubscribe)

  // RFC 8058 one-click unsubscribe
  if (hasOneClick && parsed.http) {
    return {
      kind: 'one-click',
      url: parsed.http,
      mailto: parsed.mailto,
      hasListId: !!listId,
    }
  }

  // HTTP unsubscribe
  if (parsed.http) {
    return {
      kind: 'http',
      url: parsed.http,
      mailto: parsed.mailto,
      hasListId: !!listId,
    }
  }

  // Mailto unsubscribe
  if (parsed.mailto) {
    return {
      kind: 'mailto',
      mailto: parsed.mailto,
      hasListId: !!listId,
    }
  }

  return {
    kind: 'unknown',
    hasListId: !!listId,
  }
}

// Extract sender domain from email
export function extractDomain(email: string): string {
  const match = email.match(/@([^>]+)>?$/)
  if (match) {
    return match[1].trim().toLowerCase()
  }
  return email.toLowerCase()
}

// Extract display name from From header
// Formats: "Display Name" <email@example.com> or email@example.com
export function extractDisplayName(fromHeader: string): string {
  // Try to extract display name in quotes
  const quotedMatch = fromHeader.match(/"([^"]+)"/)
  if (quotedMatch) {
    return quotedMatch[1].trim()
  }

  // Try to extract display name before angle bracket
  const angleMatch = fromHeader.match(/^([^<]+)</)
  if (angleMatch) {
    return angleMatch[1].trim()
  }

  // Extract email address
  const emailMatch = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([^\s]+@[^\s]+)/)
  if (emailMatch) {
    return emailMatch[1].trim()
  }

  return fromHeader.trim()
}

// Extract email address from From header
export function extractEmail(fromHeader: string): string {
  const emailMatch = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([^\s]+@[^\s]+)/)
  return emailMatch ? emailMatch[1].trim().toLowerCase() : fromHeader.toLowerCase()
}

// Check if content matches protected keywords/domains
export function checkSafety(
  fromHeader: string,
  subject: string,
  protectedKeywords: string[] = defaultSettings.protectedKeywords,
  protectedDomains: string[] = defaultSettings.protectedDomains
): SafetyInfo {
  const reasons: string[] = []
  const email = extractEmail(fromHeader).toLowerCase()
  const domain = extractDomain(email).toLowerCase()
  const subjectLower = subject.toLowerCase()

  // Check protected keywords in subject
  for (const keyword of protectedKeywords) {
    if (subjectLower.includes(keyword.toLowerCase())) {
      reasons.push(`Protected keyword: ${keyword}`)
    }
  }

  // Check protected domains
  for (const protectedDomain of protectedDomains) {
    if (domain.includes(protectedDomain.toLowerCase())) {
      reasons.push(`Protected domain: ${protectedDomain}`)
    }
  }

  return {
    protected: reasons.length > 0,
    reasons,
  }
}

// Parse message metadata into structured data
export interface ParsedMessage {
  id: string
  from: string
  email: string
  domain: string
  displayName: string
  subject: string
  date: string
  listId?: string
  unsubscribe: UnsubscribeMethod
  safety: SafetyInfo
  category?: string
}

export function parseMessage(
  message: GmailMessageMetadata,
  protectedKeywords?: string[],
  protectedDomains?: string[]
): ParsedMessage {
  const { id, headers = [], labelIds } = message

  // Ensure headers is an array
  const safeHeaders = Array.isArray(headers) ? headers : []

  const from = getHeader(safeHeaders, 'From') || ''
  const subject = getHeader(safeHeaders, 'Subject') || ''
  const date = getHeader(safeHeaders, 'Date') || new Date().toISOString()
  const listId = getHeader(safeHeaders, 'List-Id')

  const email = extractEmail(from)
  const domain = extractDomain(email)
  const displayName = extractDisplayName(from)
  const unsubscribe = detectUnsubscribeMethod(message)
  const safety = checkSafety(from, subject, protectedKeywords, protectedDomains)

  // Determine category from labels
  let category: string | undefined
  if (labelIds) {
    if (labelIds.includes('CATEGORY_PROMOTIONS')) {
      category = 'Promotions'
    } else if (labelIds.includes('CATEGORY_FORUMS')) {
      category = 'Forums'
    } else if (labelIds.includes('CATEGORY_UPDATES')) {
      category = 'Updates'
    }
  }

  return {
    id,
    from,
    email,
    domain,
    displayName,
    subject,
    date,
    listId,
    unsubscribe,
    safety,
    category,
  }
}

// Normalize List-Id for grouping
export function normalizeListId(listId: string): string {
  // Remove angle brackets and extract the ID
  const match = listId.match(/<([^>]+)>/)
  return match ? match[1].trim().toLowerCase() : listId.trim().toLowerCase()
}

// Scan email body for unsubscribe links
export function scanBodyForUnsubscribeLink(body: string): string | null {
  if (!body) return null

  // Convert to lowercase for pattern matching
  const lowerBody = body.toLowerCase()

  // Common unsubscribe keywords
  const keywords = ['unsubscribe', 'opt-out', 'opt out', 'remove me', 'stop emails', 'manage preferences', 'email preferences']

  // Patterns to match unsubscribe URLs
  const urlPatterns = [
    // href="url" with unsubscribe keywords nearby
    /href=["'](https?:\/\/[^"']+(?:unsubscribe|opt[-_]?out|remove|preferences|unsub)[^"']*)["']/gi,
    // Standalone URLs with unsubscribe keywords
    /(https?:\/\/[^\s<>"]+(?:unsubscribe|opt[-_]?out|remove|preferences|unsub)[^\s<>"]*)/gi,
    // href with keywords in link text
    /href=["'](https?:\/\/[^"']+)["'][^>]*>(?:[^<]*(?:unsubscribe|opt[-_]?out|remove|stop\s+emails?|manage\s+preferences)[^<]*)<\/a>/gi,
  ]

  const foundUrls: string[] = []

  // Try each pattern
  for (const pattern of urlPatterns) {
    const matches = body.matchAll(pattern)
    for (const match of matches) {
      const url = match[1]
      if (url && url.startsWith('http')) {
        foundUrls.push(url)
      }
    }
  }

  // Also try to find links that have unsubscribe-like text around them
  // This catches: <a href="url">Unsubscribe</a> or "Unsubscribe: url"
  for (const keyword of keywords) {
    const keywordIndex = lowerBody.indexOf(keyword)
    if (keywordIndex !== -1) {
      // Look for URLs within 500 chars before and after the keyword
      const contextStart = Math.max(0, keywordIndex - 250)
      const contextEnd = Math.min(body.length, keywordIndex + 250)
      const context = body.substring(contextStart, contextEnd)

      // Extract URLs from this context
      const urlMatch = context.match(/https?:\/\/[^\s<>"']+/i)
      if (urlMatch) {
        foundUrls.push(urlMatch[0])
      }
    }
  }

  // Return the first valid unsubscribe URL found
  // Filter out common tracking/pixel URLs
  const validUrl = foundUrls.find(url => {
    const lower = url.toLowerCase()
    return !lower.includes('track') &&
           !lower.includes('pixel') &&
           !lower.includes('open') &&
           !lower.endsWith('.gif') &&
           !lower.endsWith('.png') &&
           !lower.endsWith('.jpg')
  })

  return validUrl || (foundUrls.length > 0 ? foundUrls[0] : null)
}
