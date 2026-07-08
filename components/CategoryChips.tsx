'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/brand'

/**
 * Horizontal-scrolling category filter bar — ghost pills on the sky.
 * Active category is stored in the URL: /?category=Science
 * "All" clears the param.
 *
 * Rendered inside a <Suspense> boundary in the parent because it uses
 * useSearchParams() which requires client-side hydration.
 */
export function CategoryChips() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const active       = searchParams.get('category')

  function select(category: string | null) {
    const params = new URLSearchParams(searchParams)
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const chips = [{ label: 'All', value: null }, ...CATEGORIES.map((c) => ({ label: c, value: c }))]

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="no-scrollbar"
      style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0 1.25rem 0.5rem',
        WebkitOverflowScrolling: 'touch',
        // Align with the centered card column on wide screens
        maxWidth: '36rem',
        marginInline: 'auto',
      }}
    >
      {chips.map(({ label, value }) => {
        const isActive = value === active || (value === null && !active)
        return (
          <button
            key={label}
            type="button"
            onClick={() => select(value)}
            aria-pressed={isActive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.32rem 0.85rem',
              borderRadius: '999px',
              border: isActive
                ? '1px solid var(--color-dawn-deep)'
                : '1px solid var(--color-line)',
              background: isActive
                ? 'var(--color-dawn-deep)'
                : 'rgba(22, 31, 61, 0.55)',
              color: isActive ? '#141A33' : 'var(--color-mist-bright)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
