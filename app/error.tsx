'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Daybreak] Route error:', error)
  }, [error])

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-muted)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span style={{ fontSize: '2rem' }}>🌅</span>
      <p style={{ margin: 0, maxWidth: '28ch', lineHeight: 1.5 }}>
        Something went wrong loading the feed.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.65rem 1.25rem',
          borderRadius: '0.625rem',
          background: 'linear-gradient(135deg, var(--color-coral) 0%, var(--color-amber) 100%)',
          color: '#fff',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: '0.9rem',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
