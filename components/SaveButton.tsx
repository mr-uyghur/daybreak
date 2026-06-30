'use client'

import { useState, useEffect } from 'react'
import { isSaved, toggleSaved } from '@/lib/local-store'

interface SaveButtonProps {
  storyId: number
}

/**
 * Bookmark toggle — saves/unsaves a story ID to localStorage.
 * State hydrates after mount (SSR guard).
 */
export function SaveButton({ storyId }: SaveButtonProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isSaved(storyId))
  }, [storyId])

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    const next = toggleSaved(storyId)
    setSaved(next)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={saved ? 'Remove from saved' : 'Save this story'}
      aria-pressed={saved}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '50%',
        border: '1.5px solid var(--color-border)',
        background: saved ? 'rgba(255, 193, 94, 0.15)' : 'var(--color-card)',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        borderColor: saved ? 'var(--color-amber)' : undefined,
        flexShrink: 0,
      }}
    >
      {saved ? '🔖' : '🏷️'}
    </button>
  )
}
