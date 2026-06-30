'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  url: string
}

/**
 * Share button: uses Web Share API on mobile, falls back to clipboard copy.
 * Shows a transient "Copied!" toast on fallback.
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
        gap: '0.35rem',
        padding: '0.4rem 0.9rem',
        borderRadius: '999px',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-card)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-muted)',
        transition: 'border-color 0.15s ease',
      }}
    >
      <span role="img" aria-hidden>🔗</span>
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  )
}
