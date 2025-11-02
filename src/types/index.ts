// Core data types based on the spec

export type UnsubscribeKind = 'one-click' | 'http' | 'mailto' | 'unknown'

export interface UnsubscribeMethod {
  kind: UnsubscribeKind
  url?: string
  mailto?: string
  hasListId: boolean
}

export interface SafetyInfo {
  protected: boolean
  reasons: string[]
}

export interface SenderGroup {
  id: string // listId | domain | normalized name
  displayName: string
  domain: string
  listId?: string
  messageCount: number
  firstSeen: string // ISODate
  lastSeen: string // ISODate
  unsubscribe: UnsubscribeMethod
  safety: SafetyInfo
  category?: string // Promotions, Forums, Updates
}

export type ActionType = 'unsubscribe' | 'open-link' | 'mailto' | 'delete' | 'archive' | 'filter'
export type ActionMethod = 'one-click' | 'http' | 'mailto'
export type ActionResult = 'success' | 'fail' | 'skipped'

export interface ActionLog {
  id: string
  ts: string // ISODate
  groupId: string
  action: ActionType
  method?: ActionMethod
  count?: number // affected messages
  result: ActionResult
  note?: string
}

export interface Settings {
  theme: 'light' | 'dark' | 'system'
  protectedKeywords: string[]
  protectedDomains: string[]
  enableModifyScope: boolean
  enableSendScope: boolean
}

export interface ScanCheckpoint {
  lastScanTime: string
  processedMessageIds: string[]
  scanRange: '3d' | '7d' | '3m' | '6m' | '12m' | 'all'
  categories: string[]
}

// Gmail API types
export interface GmailMessage {
  id: string
  threadId: string
}

export interface GmailMessageMetadata {
  id: string
  threadId: string
  labelIds?: string[]
  headers?: GmailHeader[]
  payload?: {
    headers?: GmailHeader[]
    mimeType?: string
  }
  snippet?: string
  internalDate?: string
}

export interface GmailHeader {
  name: string
  value: string
}

export interface GmailListResponse {
  messages?: GmailMessage[]
  nextPageToken?: string
  resultSizeEstimate?: number
}

// OAuth types
export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  expires_at: number
}

export interface OAuthState {
  codeVerifier: string
  state: string
  scopes: string[]
}

// Cleanup policy
export interface CleanupPolicy {
  mode: 'archive' | 'trash'
  olderThanDays?: number
  keepLast?: number
}
