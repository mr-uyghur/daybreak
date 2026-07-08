/**
 * Typed localStorage wrapper with SSR guard.
 * All writes are best-effort; errors are swallowed silently so a storage
 * quota/access issue never crashes the app.
 */

const isBrowser = typeof window !== 'undefined'

function getJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setJSON<T>(key: string, value: T): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked — fail silently
  }
}

// ─── Change subscription ─────────────────────────────────────────────────────
// Lets components read this store via useSyncExternalStore instead of
// hydrating with setState-in-effect. Every write below calls emit().

const listeners = new Set<() => void>()

export function subscribeLocalStore(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit(): void {
  for (const listener of listeners) listener()
}

// ─── Saved / bookmarked story IDs ────────────────────────────────────────────

const SAVED_KEY = 'daybreak:saved'

export function getSavedIds(): number[] {
  return getJSON<number[]>(SAVED_KEY, [])
}

export function isSaved(id: number): boolean {
  return getSavedIds().includes(id)
}

export function toggleSaved(id: number): boolean {
  const ids = getSavedIds()
  const idx = ids.indexOf(id)
  const nowSaved = idx === -1
  if (nowSaved) {
    setJSON(SAVED_KEY, [...ids, id])
  } else {
    setJSON(SAVED_KEY, ids.filter((x) => x !== id))
  }
  emit()
  return nowSaved
}

// ─── Pressed reaction types ───────────────────────────────────────────────────

/** Returns the set of reaction types this device has pressed for a story. */
function pressedKey(storyId: number) {
  return `daybreak:reactions:${storyId}`
}

export function getPressedReactions(storyId: number): Set<string> {
  return new Set(getJSON<string[]>(pressedKey(storyId), []))
}

export function hasPressed(storyId: number, reactionType: string): boolean {
  return getPressedReactions(storyId).has(reactionType)
}

/**
 * Records that this device pressed a reaction.
 * Returns true if this is a new press (caller should increment the counter);
 * false if already pressed (caller should do nothing / decrement not supported).
 */
export function recordPress(storyId: number, reactionType: string): boolean {
  const current = getPressedReactions(storyId)
  if (current.has(reactionType)) return false
  current.add(reactionType)
  setJSON(pressedKey(storyId), Array.from(current))
  emit()
  return true
}
