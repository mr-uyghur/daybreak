import Link from 'next/link'
import { BRAND } from '@/lib/brand'

/**
 * Sticky frosted top bar — shows the Daybreak wordmark and Saved link.
 * Category chips will slot in here in M5.
 * Fixed-position, overlays the scroll-snap feed (which starts at top: 0).
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
        padding: '0 1rem',
        background: 'light-dark(rgba(255, 253, 247, 0.8), rgba(26, 23, 20, 0.8))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Wordmark */}
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '1.25rem',
          color: 'var(--color-on-surface)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {BRAND.name}
      </span>

      {/* Nav: Saved */}
      <Link
        href="/saved"
        aria-label="View saved stories"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          color: 'var(--color-muted)',
          textDecoration: 'none',
          padding: '0.3rem 0.6rem',
          borderRadius: '999px',
        }}
      >
        <span aria-hidden>🔖</span>
        <span>Saved</span>
      </Link>
    </header>
  )
}
