'use client'

import { useSyncExternalStore } from 'react'
import { isSaved, toggleSaved, subscribeLocalStore } from '@/lib/local-store'

interface SaveButtonProps {
  storyId: number
}

/**
 * Star toggle — saves/unsaves a story ID to localStorage.
 * Reads through useSyncExternalStore: SSR renders unsaved, the client
 * snapshot corrects it after hydration, and every toggle re-renders all
 * mounted instances for this story.
 */
export function SaveButton({ storyId }: SaveButtonProps) {
  const saved = useSyncExternalStore(
    subscribeLocalStore,
    () => isSaved(storyId),
    () => false,
  )

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    toggleSaved(storyId)
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
        border: saved ? '1px solid var(--color-dawn)' : '1px solid var(--color-line)',
        background: saved ? 'rgba(255, 174, 112, 0.16)' : 'rgba(22, 31, 61, 0.55)',
        color: saved ? 'var(--color-dawn)' : 'var(--color-mist-bright)',
        cursor: 'pointer',
        transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        flexShrink: 0,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} aria-hidden>
        <path
          d="M12 2.5l2.6 6.1 6.6.55-5 4.35 1.5 6.5L12 16.5 6.3 20l1.5-6.5-5-4.35 6.6-.55L12 2.5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
