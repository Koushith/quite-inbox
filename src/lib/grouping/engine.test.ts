import { describe, it, expect, beforeEach } from 'vitest'
import { MessageGrouper, generateGroupId, filterGroups, getGroupStats } from './engine'
import type { ParsedMessage } from '../parsers/headers'
import type { SenderGroup } from '@/types'

describe('Grouping Engine', () => {
  describe('generateGroupId', () => {
    it('should prefer List-Id for grouping', () => {
      const message: ParsedMessage = {
        id: '1',
        from: 'sender@example.com',
        email: 'sender@example.com',
        domain: 'example.com',
        displayName: 'Sender',
        subject: 'Test',
        date: new Date().toISOString(),
        listId: '<newsletter.example.com>',
        unsubscribe: { kind: 'unknown', hasListId: true },
        safety: { protected: false, reasons: [] },
      }

      expect(generateGroupId(message)).toBe('newsletter.example.com')
    })

    it('should fallback to domain when no List-Id', () => {
      const message: ParsedMessage = {
        id: '1',
        from: 'sender@example.com',
        email: 'sender@example.com',
        domain: 'example.com',
        displayName: 'Sender',
        subject: 'Test',
        date: new Date().toISOString(),
        unsubscribe: { kind: 'unknown', hasListId: false },
        safety: { protected: false, reasons: [] },
      }

      expect(generateGroupId(message)).toBe('domain:example.com')
    })
  })

  describe('MessageGrouper', () => {
    let grouper: MessageGrouper

    beforeEach(() => {
      grouper = new MessageGrouper()
    })

    it('should create a new group for first message', () => {
      const message: ParsedMessage = {
        id: '1',
        from: 'sender@example.com',
        email: 'sender@example.com',
        domain: 'example.com',
        displayName: 'Example Newsletter',
        subject: 'Test',
        date: new Date().toISOString(),
        listId: '<newsletter.example.com>',
        unsubscribe: { kind: 'http', url: 'https://example.com/unsub', hasListId: true },
        safety: { protected: false, reasons: [] },
      }

      grouper.addMessage(message)

      const groups = grouper.getGroups()
      expect(groups).toHaveLength(1)
      expect(groups[0].displayName).toBe('Example Newsletter')
      expect(groups[0].messageCount).toBe(1)
    })

    it('should increment count for messages from same sender', () => {
      const message1: ParsedMessage = {
        id: '1',
        from: 'sender@example.com',
        email: 'sender@example.com',
        domain: 'example.com',
        displayName: 'Example Newsletter',
        subject: 'Test 1',
        date: '2024-01-01T00:00:00Z',
        listId: '<newsletter.example.com>',
        unsubscribe: { kind: 'http', url: 'https://example.com/unsub', hasListId: true },
        safety: { protected: false, reasons: [] },
      }

      const message2: ParsedMessage = {
        ...message1,
        id: '2',
        subject: 'Test 2',
        date: '2024-01-02T00:00:00Z',
      }

      grouper.addMessage(message1)
      grouper.addMessage(message2)

      const groups = grouper.getGroups()
      expect(groups).toHaveLength(1)
      expect(groups[0].messageCount).toBe(2)
    })

    it('should upgrade unsubscribe method to one-click', () => {
      const message1: ParsedMessage = {
        id: '1',
        from: 'sender@example.com',
        email: 'sender@example.com',
        domain: 'example.com',
        displayName: 'Example Newsletter',
        subject: 'Test 1',
        date: '2024-01-01T00:00:00Z',
        listId: '<newsletter.example.com>',
        unsubscribe: { kind: 'mailto', mailto: 'mailto:unsub@example.com', hasListId: true },
        safety: { protected: false, reasons: [] },
      }

      const message2: ParsedMessage = {
        ...message1,
        id: '2',
        unsubscribe: { kind: 'one-click', url: 'https://example.com/unsub', hasListId: true },
      }

      grouper.addMessage(message1)
      grouper.addMessage(message2)

      const groups = grouper.getGroups()
      expect(groups[0].unsubscribe.kind).toBe('one-click')
    })
  })

  describe('filterGroups', () => {
    const mockGroups: SenderGroup[] = [
      {
        id: '1',
        displayName: 'Newsletter',
        domain: 'example.com',
        messageCount: 10,
        firstSeen: '2024-01-01T00:00:00Z',
        lastSeen: '2024-01-10T00:00:00Z',
        unsubscribe: { kind: 'one-click', url: 'https://example.com', hasListId: true },
        safety: { protected: false, reasons: [] },
        category: 'Promotions',
      },
      {
        id: '2',
        displayName: 'Bank',
        domain: 'bank.com',
        messageCount: 5,
        firstSeen: '2024-01-01T00:00:00Z',
        lastSeen: '2024-01-10T00:00:00Z',
        unsubscribe: { kind: 'unknown', hasListId: false },
        safety: { protected: true, reasons: ['Protected domain: bank.'] },
      },
    ]

    it('should filter by category', () => {
      const filtered = filterGroups(mockGroups, { category: 'Promotions' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('Promotions')
    })

    it('should filter by protected status', () => {
      const filtered = filterGroups(mockGroups, { protected: false })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].safety.protected).toBe(false)
    })

    it('should filter by message count', () => {
      const filtered = filterGroups(mockGroups, { minMessageCount: 8 })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].messageCount).toBe(10)
    })
  })

  describe('getGroupStats', () => {
    const mockGroups: SenderGroup[] = [
      {
        id: '1',
        displayName: 'Newsletter',
        domain: 'example.com',
        messageCount: 10,
        firstSeen: '2024-01-01T00:00:00Z',
        lastSeen: '2024-01-10T00:00:00Z',
        unsubscribe: { kind: 'one-click', url: 'https://example.com', hasListId: true },
        safety: { protected: false, reasons: [] },
        category: 'Promotions',
      },
      {
        id: '2',
        displayName: 'Forum',
        domain: 'forum.com',
        messageCount: 5,
        firstSeen: '2024-01-01T00:00:00Z',
        lastSeen: '2024-01-10T00:00:00Z',
        unsubscribe: { kind: 'http', url: 'https://forum.com/unsub', hasListId: true },
        safety: { protected: false, reasons: [] },
        category: 'Forums',
      },
    ]

    it('should calculate correct statistics', () => {
      const stats = getGroupStats(mockGroups)

      expect(stats.totalGroups).toBe(2)
      expect(stats.totalMessages).toBe(15)
      expect(stats.oneClickAvailable).toBe(1)
      expect(stats.httpAvailable).toBe(1)
      expect(stats.byCategory['Promotions']).toBe(1)
      expect(stats.byCategory['Forums']).toBe(1)
    })
  })
})
