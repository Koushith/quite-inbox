import Dexie, { type EntityTable } from 'dexie'
import type { SenderGroup, ActionLog, Settings, ScanCheckpoint } from '@/types'

// Define the database schema
class QuiteInboxDatabase extends Dexie {
  senderGroups!: EntityTable<SenderGroup, 'id'>
  actionLog!: EntityTable<ActionLog, 'id'>
  settings!: EntityTable<Settings & { id: string }, 'id'>
  scanCheckpoint!: EntityTable<ScanCheckpoint & { id: string }, 'id'>

  constructor() {
    super('QuiteInboxDB')

    this.version(1).stores({
      senderGroups: 'id, domain, listId, lastSeen, messageCount',
      actionLog: 'id, ts, groupId, action, result',
      settings: 'id',
      scanCheckpoint: 'id',
    })
  }
}

export const db = new QuiteInboxDatabase()

// Default settings
export const defaultSettings: Settings = {
  theme: 'system',
  protectedKeywords: [
    'bank', 'invoice', 'receipt', 'statement', 'otp', 'verification',
    'password', 'security', 'ticket', 'itinerary', 'delivery', 'order',
    'payment', 'tax', 'medical', 'health', 'insurance', 'bill', 'two-factor',
    'confirm', 'account', '2fa', 'code'
  ],
  protectedDomains: [
    'bank.', 'visa.', 'mastercard.', 'paypal.', 'stripe.',
    'amazon.', 'flipkart.', '.gov', 'irs.', 'healthcare.',
    'hospital.', 'clinic.', 'doctor.'
  ],
}

// Storage helper functions
export const storage = {
  // Sender Groups
  async getSenderGroups(): Promise<SenderGroup[]> {
    return db.senderGroups.orderBy('lastSeen').reverse().toArray()
  },

  async getSenderGroup(id: string): Promise<SenderGroup | undefined> {
    return db.senderGroups.get(id)
  },

  async saveSenderGroup(group: SenderGroup): Promise<void> {
    await db.senderGroups.put(group)
  },

  async saveSenderGroups(groups: SenderGroup[]): Promise<void> {
    await db.senderGroups.bulkPut(groups)
  },

  async deleteSenderGroup(id: string): Promise<void> {
    await db.senderGroups.delete(id)
  },

  // Action Log
  async getActionLog(): Promise<ActionLog[]> {
    return db.actionLog.orderBy('ts').reverse().toArray()
  },

  async addActionLog(log: ActionLog): Promise<void> {
    await db.actionLog.add(log)
  },

  async exportActionLog(): Promise<string> {
    const logs = await db.actionLog.toArray()
    return JSON.stringify(logs, null, 2)
  },

  // Settings
  async getSettings(): Promise<Settings> {
    const settings = await db.settings.get('default')
    if (!settings) {
      await db.settings.put({ ...defaultSettings, id: 'default' })
      return defaultSettings
    }
    const { id, ...rest } = settings
    return rest
  },

  async saveSettings(settings: Settings): Promise<void> {
    await db.settings.put({ ...settings, id: 'default' })
  },

  // Scan Checkpoint
  async getScanCheckpoint(): Promise<ScanCheckpoint | undefined> {
    const checkpoint = await db.scanCheckpoint.get('latest')
    if (!checkpoint) return undefined
    const { id, ...rest } = checkpoint
    return rest
  },

  async saveScanCheckpoint(checkpoint: ScanCheckpoint): Promise<void> {
    await db.scanCheckpoint.put({ ...checkpoint, id: 'latest' })
  },

  // Export/Import all data
  async exportAllData(): Promise<string> {
    const data = {
      senderGroups: await db.senderGroups.toArray(),
      actionLog: await db.actionLog.toArray(),
      settings: await db.settings.toArray(),
      scanCheckpoint: await db.scanCheckpoint.toArray(),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  },

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData)

    if (data.senderGroups) {
      await db.senderGroups.bulkPut(data.senderGroups)
    }
    if (data.actionLog) {
      await db.actionLog.bulkPut(data.actionLog)
    }
    if (data.settings) {
      await db.settings.bulkPut(data.settings)
    }
    if (data.scanCheckpoint) {
      await db.scanCheckpoint.bulkPut(data.scanCheckpoint)
    }
  },

  async clearAllData(): Promise<void> {
    await Promise.all([
      db.senderGroups.clear(),
      db.actionLog.clear(),
      db.scanCheckpoint.clear(),
    ])
  },
}
