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
        color: 'var(--color-mist)',
        fontFamily: 'var(--font-sans)',
        background: 'linear-gradient(to bottom, var(--color-sky1-top), var(--color-sky1-bot))',
      }}
    >
      <hr className="horizon-line" style={{ width: 'min(12rem, 50vw)' }} />
      <p style={{ margin: 0, maxWidth: '28ch', lineHeight: 1.5 }}>
        Something went wrong loading the feed.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.65rem 1.5rem',
          borderRadius: '999px',
          background: 'var(--color-dawn-deep)',
          color: '#141A33',
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
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
