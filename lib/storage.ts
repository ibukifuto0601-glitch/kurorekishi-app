import { Letter } from './types'

const HISTORY_KEY = 'kurohisory_history_v1'
const PENDING_KEY = 'kurohisory_pending_v1'
const MAX_HISTORY = 30

export function savePendingLetter(letter: Omit<Letter, 'type'>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PENDING_KEY, JSON.stringify(letter))
}

export function getPendingLetter(): Omit<Letter, 'type'> | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(PENDING_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function clearPendingLetter(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PENDING_KEY)
}

export function getHistory(): Letter[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(HISTORY_KEY)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function addToHistory(letter: Letter): void {
  if (typeof window === 'undefined') return
  const history = getHistory()
  const updated = [letter, ...history].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function updateLetterReaction(id: string, reaction: string, comment: string): void {
  if (typeof window === 'undefined') return
  const history = getHistory()
  const updated = history.map((l) => (l.id === id ? { ...l, reaction, comment } : l))
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const TOKEN_KEY = 'kurohisory_recipient_token_v1'

/** このデバイス固有の匿名トークンを取得（なければ生成して保存） */
export function getOrCreateRecipientToken(): string {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem(TOKEN_KEY)
  if (existing) return existing
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}-${Math.random().toString(36).slice(2, 11)}`
  localStorage.setItem(TOKEN_KEY, token)
  return token
}
