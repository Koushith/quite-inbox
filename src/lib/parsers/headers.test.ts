import { describe, it, expect } from 'vitest'
import {
  parseListUnsubscribe,
  hasOneClickUnsubscribe,
  extractDomain,
  extractDisplayName,
  extractEmail,
  detectUnsubscribeMethod,
} from './headers'
import type { GmailMessageMetadata, GmailHeader } from '@/types'

describe('Header Parser', () => {
  describe('parseListUnsubscribe', () => {
    it('should parse HTTP URL', () => {
      const result = parseListUnsubscribe('<https://example.com/unsub>')
      expect(result.http).toBe('https://example.com/unsub')
      expect(result.mailto).toBeUndefined()
    })

    it('should parse mailto', () => {
      const result = parseListUnsubscribe('<mailto:unsub@example.com>')
      expect(result.mailto).toBe('mailto:unsub@example.com')
      expect(result.http).toBeUndefined()
    })

    it('should parse both HTTP and mailto', () => {
      const result = parseListUnsubscribe(
        '<https://example.com/unsub>, <mailto:unsub@example.com>'
      )
      expect(result.http).toBe('https://example.com/unsub')
      expect(result.mailto).toBe('mailto:unsub@example.com')
    })

    it('should handle empty string', () => {
      const result = parseListUnsubscribe('')
      expect(result.http).toBeUndefined()
      expect(result.mailto).toBeUndefined()
    })
  })

  describe('hasOneClickUnsubscribe', () => {
    it('should detect one-click header', () => {
      const headers: GmailHeader[] = [
        { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
      ]
      expect(hasOneClickUnsubscribe(headers)).toBe(true)
    })

    it('should return false when header is missing', () => {
      const headers: GmailHeader[] = []
      expect(hasOneClickUnsubscribe(headers)).toBe(false)
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from email', () => {
      expect(extractDomain('user@example.com')).toBe('example.com')
    })

    it('should extract domain from email with angle brackets', () => {
      expect(extractDomain('<user@example.com>')).toBe('example.com')
    })

    it('should handle subdomain', () => {
      expect(extractDomain('user@mail.example.com')).toBe('mail.example.com')
    })
  })

  describe('extractDisplayName', () => {
    it('should extract quoted display name', () => {
      expect(extractDisplayName('"John Doe" <john@example.com>')).toBe('John Doe')
    })

    it('should extract unquoted display name', () => {
      expect(extractDisplayName('John Doe <john@example.com>')).toBe('John Doe')
    })

    it('should return email when no display name', () => {
      expect(extractDisplayName('john@example.com')).toBe('john@example.com')
    })
  })

  describe('extractEmail', () => {
    it('should extract email from angle brackets', () => {
      expect(extractEmail('"John Doe" <john@example.com>')).toBe('john@example.com')
    })

    it('should extract plain email', () => {
      expect(extractEmail('john@example.com')).toBe('john@example.com')
    })
  })

  describe('detectUnsubscribeMethod', () => {
    it('should detect one-click unsubscribe', () => {
      const message: GmailMessageMetadata = {
        id: '1',
        threadId: '1',
        headers: [
          { name: 'List-Unsubscribe', value: '<https://example.com/unsub>' },
          { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
        ],
      }

      const method = detectUnsubscribeMethod(message)
      expect(method.kind).toBe('one-click')
      expect(method.url).toBe('https://example.com/unsub')
    })

    it('should detect HTTP unsubscribe', () => {
      const message: GmailMessageMetadata = {
        id: '1',
        threadId: '1',
        headers: [
          { name: 'List-Unsubscribe', value: '<https://example.com/unsub>' },
        ],
      }

      const method = detectUnsubscribeMethod(message)
      expect(method.kind).toBe('http')
      expect(method.url).toBe('https://example.com/unsub')
    })

    it('should detect mailto unsubscribe', () => {
      const message: GmailMessageMetadata = {
        id: '1',
        threadId: '1',
        headers: [
          { name: 'List-Unsubscribe', value: '<mailto:unsub@example.com>' },
        ],
      }

      const method = detectUnsubscribeMethod(message)
      expect(method.kind).toBe('mailto')
      expect(method.mailto).toBe('mailto:unsub@example.com')
    })

    it('should return unknown when no unsubscribe header', () => {
      const message: GmailMessageMetadata = {
        id: '1',
        threadId: '1',
        headers: [],
      }

      const method = detectUnsubscribeMethod(message)
      expect(method.kind).toBe('unknown')
    })
  })
})
