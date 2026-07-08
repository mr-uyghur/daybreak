import Link from 'next/link'
import { BRAND } from '@/lib/brand'

/**
 * Transparent top bar floating over the sky — Daybreak wordmark with the
 * horizon-line motif, and the Saved link. A fixed top scrim (rendered by the
 * page) keeps it legible while cards scroll beneath.
 */
export function TopBar() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '3.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
      }}
    >
      {/* Wordmark — a sliver of sun on the horizon, then the name */}
      <Link
        href="/"
        aria-label={`${BRAND.name} home`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
        }}
      >
        <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden style={{ display: 'block' }}>
          <circle cx="10" cy="11" r="5" fill="var(--color-dawn-deep)" />
          <rect x="0" y="10" width="20" height="2" fill="var(--color-night)" />
          <rect x="0" y="9.25" width="20" height="0.75" fill="var(--color-dawn)" opacity="0.9" />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: '1.2rem',
            color: 'var(--color-ink)',
            letterSpacing: '0.01em',
            lineHeight: 1,
          }}
        >
          {BRAND.name}
        </span>
      </Link>

      {/* Nav: Saved */}
      <Link
        href="/saved"
        aria-label="View saved stories"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          color: 'var(--color-mist-bright)',
          textDecoration: 'none',
          padding: '0.35rem 0.75rem',
          borderRadius: '999px',
          border: '1px solid var(--color-line)',
          background: 'rgba(22, 31, 61, 0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2.5l2.6 6.1 6.6.55-5 4.35 1.5 6.5L12 16.5 6.3 20l1.5-6.5-5-4.35 6.6-.55L12 2.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <span>Saved</span>
      </Link>
    </header>
  )
}
