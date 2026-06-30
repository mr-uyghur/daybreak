'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { REACTIONS } from '@/lib/brand'
import { hasPressed, recordPress } from '@/lib/local-store'
import type { StoryWithReactions } from '@/lib/types'
import type { ReactionType } from '@/lib/brand'

interface ReactionBarProps {
  story: StoryWithReactions
}

/**
 * Row of emoji reaction buttons.
 *
 * - Counts come from the server (via the story prop).
 * - Optimistic UI: count updates immediately on tap.
 * - localStorage: tracks pressed state per device; prevents re-press.
 * - POST /api/reactions: increments the server counter.
 */
export function ReactionBar({ story }: ReactionBarProps) {
  // Local counts start from server values; optimistic updates layer on top
  const [counts, setCounts] = useState<Partial<Record<ReactionType, number>>>(
    story.reactions ?? {},
  )
  const [pressed, setPressed] = useState<Set<ReactionType>>(new Set())

  // Hydrate pressed state from localStorage after mount
  useEffect(() => {
    const stored = new Set<ReactionType>()
    for (const r of REACTIONS) {
      if (hasPressed(story.id, r.type)) stored.add(r.type as ReactionType)
    }
    setPressed(stored)
  }, [story.id])

  async function handleReaction(type: ReactionType) {
    if (pressed.has(type)) return // already pressed — no-op

    // Optimistic update
    setCounts((prev) => ({
      ...prev,
      [type]: (prev[type] ?? 0) + 1,
    }))
    setPressed((prev) => new Set([...prev, type]))

    // Persist press locally
    recordPress(story.id, type)

    // Fire-and-forget server increment — optimistic already applied
    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id, reactionType: type }),
      })
    } catch {
      // Server failure: leave optimistic update in place (count is already in localStorage)
    }
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
        const isPressed = pressed.has(r.type as ReactionType)
        const count = counts[r.type as ReactionType] ?? 0

        return (
          <motion.button
            key={r.type}
            type="button"
            aria-label={`${r.label}${isPressed ? ' (reacted)' : ''}`}
            aria-pressed={isPressed}
            onClick={() => handleReaction(r.type as ReactionType)}
            whileTap={{ scale: 0.88 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '999px',
              border: isPressed
                ? '1.5px solid var(--color-coral)'
                : '1.5px solid var(--color-border)',
              background: isPressed
                ? 'rgba(255, 138, 91, 0.12)'
                : 'var(--color-card)',
              cursor: isPressed ? 'default' : 'pointer',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
              color: isPressed ? 'var(--color-coral)' : 'var(--color-muted)',
              fontWeight: isPressed ? 600 : 400,
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
