'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { REACTIONS } from '@/lib/brand'
import { hasPressed, recordPress, subscribeLocalStore } from '@/lib/local-store'
import type { StoryWithReactions } from '@/lib/types'
import type { ReactionType } from '@/lib/brand'

interface ReactionBarProps {
  story: StoryWithReactions
}

/**
 * Presses made this session, keyed by `storyId:type`. The bar renders in two
 * places (story card + expanded view) from the same server snapshot, so a
 * module-level record keeps their optimistic +1s in agreement. Cleared on
 * reload — by then the server count includes the press.
 */
const sessionBumps = new Set<string>()
const bumpKey = (storyId: number, type: ReactionType) => `${storyId}:${type}`

/**
 * Row of emoji reaction buttons.
 *
 * - Counts come from the server (via the story prop) plus this session's
 *   optimistic bumps — no local count state to drift between instances.
 * - Pressed state reads localStorage through useSyncExternalStore; SSR
 *   renders unpressed and the client snapshot corrects it after hydration.
 * - POST /api/reactions: increments the server counter (fire-and-forget).
 */
export function ReactionBar({ story }: ReactionBarProps) {
  // Stable string snapshot ("wow,hopeful") so Object.is comparison works
  const pressedSnapshot = useSyncExternalStore(
    subscribeLocalStore,
    () => REACTIONS.filter((r) => hasPressed(story.id, r.type)).map((r) => r.type).join(','),
    () => '',
  )
  const pressed = useMemo(
    () => new Set(pressedSnapshot.split(',').filter(Boolean) as ReactionType[]),
    [pressedSnapshot],
  )

  function handleReaction(type: ReactionType) {
    if (pressed.has(type)) return // already pressed — no-op

    // Optimistic: bump before recordPress so the emitted re-render sees it
    sessionBumps.add(bumpKey(story.id, type))
    recordPress(story.id, type)

    // Fire-and-forget server increment — optimistic already applied
    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: story.id, reactionType: type }),
    }).catch(() => {
      // Server failure: leave optimistic update in place (press is already in localStorage)
    })
  }

  return (
    <div
      role="group"
      aria-label="React to this story"
      style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      {REACTIONS.map((r) => {
        const type = r.type as ReactionType
        const isPressed = pressed.has(type)
        const count =
          (story.reactions?.[type] ?? 0) + (sessionBumps.has(bumpKey(story.id, type)) ? 1 : 0)

        return (
          <motion.button
            key={r.type}
            type="button"
            aria-label={`${r.label}${isPressed ? ' (reacted)' : ''}`}
            aria-pressed={isPressed}
            onClick={() => handleReaction(type)}
            whileTap={{ scale: 0.88 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '999px',
              border: isPressed
                ? '1px solid var(--color-dawn)'
                : '1px solid var(--color-line)',
              background: isPressed
                ? 'rgba(255, 174, 112, 0.16)'
                : 'rgba(22, 31, 61, 0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: isPressed ? 'default' : 'pointer',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
              color: isPressed ? 'var(--color-dawn)' : 'var(--color-mist-bright)',
              fontWeight: isPressed ? 700 : 500,
              transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
              userSelect: 'none',
            }}
          >
            <span role="img" aria-hidden>{r.emoji}</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{ minWidth: '1ch', display: 'inline-block' }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}
