import { create } from 'zustand'
import type { SenderGroup, ActionLog, Settings } from '@/types'
import { storage, defaultSettings } from '@/lib/storage/db'
import { isAuthenticated, logout as authLogout } from '@/lib/auth/oauth'

interface ScanState {
  isScanning: boolean
  progress: {
    total: number
    processed: number
  }
  error: string | null
}

interface AppState {
  // Authentication
  isAuthenticated: boolean
  checkAuth: () => void
  logout: () => void

  // Settings
  settings: Settings
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<Settings>) => Promise<void>

  // Sender Groups
  groups: SenderGroup[]
  selectedGroups: Set<string>
  loadGroups: () => Promise<void>
  toggleGroupSelection: (groupId: string) => void
  selectAllGroups: () => void
  clearSelection: () => void

  // Scan state
  scanState: ScanState
  setScanState: (state: Partial<ScanState>) => void

  // Action Log
  actionLog: ActionLog[]
  loadActionLog: () => Promise<void>
  addActionLog: (log: ActionLog) => Promise<void>

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Authentication
  isAuthenticated: isAuthenticated(),

  checkAuth: () => {
    set({ isAuthenticated: isAuthenticated() })
  },

  logout: () => {
    authLogout()
    set({
      isAuthenticated: false,
      groups: [],
      selectedGroups: new Set(),
      actionLog: [],
    })
  },

  // Settings
  settings: defaultSettings,

  loadSettings: async () => {
    try {
      const settings = await storage.getSettings()
      set({ settings, theme: settings.theme })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  },

  updateSettings: async (newSettings: Partial<Settings>) => {
    const { settings } = get()
    const updated = { ...settings, ...newSettings }

    try {
      await storage.saveSettings(updated)
      set({ settings: updated })

      if (newSettings.theme) {
        get().setTheme(newSettings.theme)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  },

  // Sender Groups
  groups: [],
  selectedGroups: new Set(),

  loadGroups: async () => {
    try {
      const groups = await storage.getSenderGroups()
      set({ groups })
    } catch (error) {
      console.error('Failed to load groups:', error)
    }
  },

  toggleGroupSelection: (groupId: string) => {
    const { selectedGroups } = get()
    const newSelection = new Set(selectedGroups)

    if (newSelection.has(groupId)) {
      newSelection.delete(groupId)
    } else {
      newSelection.add(groupId)
    }

    set({ selectedGroups: newSelection })
  },

  selectAllGroups: () => {
    const { groups } = get()
    set({ selectedGroups: new Set(groups.map(g => g.id)) })
  },

  clearSelection: () => {
    set({ selectedGroups: new Set() })
  },

  // Scan state
  scanState: {
    isScanning: false,
    progress: { total: 0, processed: 0 },
    error: null,
  },

  setScanState: (state: Partial<ScanState>) => {
    const { scanState } = get()
    set({ scanState: { ...scanState, ...state } })
  },

  // Action Log
  actionLog: [],

  loadActionLog: async () => {
    try {
      const log = await storage.getActionLog()
      set({ actionLog: log })
    } catch (error) {
      console.error('Failed to load action log:', error)
    }
  },

  addActionLog: async (log: ActionLog) => {
    try {
      await storage.addActionLog(log)
      const { actionLog } = get()
      set({ actionLog: [log, ...actionLog] })
    } catch (error) {
      console.error('Failed to add action log:', error)
    }
  },

  // Theme
  theme: 'system',

  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({ theme })

    // Apply theme to document
    const root = document.documentElement

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  },
}))

// Initialize theme on app start
if (typeof window !== 'undefined') {
  const store = useAppStore.getState()
  store.loadSettings().then(() => {
    store.setTheme(store.settings.theme)
  })
}
