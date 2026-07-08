'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  url: string
}

/**
 * Share button: uses Web Share API on mobile, falls back to clipboard copy.
 * Shows a transient "Copied!" label on fallback.
 */
export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // User dismissed the share sheet — no-op
        return
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard not available — no-op
      return
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this story"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.9rem',
        borderRadius: '999px',
        border: '1px solid var(--color-line)',
        background: 'rgba(22, 31, 61, 0.55)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-mist-bright)',
        transition: 'border-color 0.15s ease',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 15V3m0 0L7 8m5-5l5 5M4 14v5a2 2 0 002 2h12a2 2 0 002-2v-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  )
}
