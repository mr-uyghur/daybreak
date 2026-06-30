'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/brand'

/**
 * Horizontal-scrolling category filter bar.
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
      style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0 1rem 0.5rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        // Hide webkit scrollbar
        WebkitOverflowScrolling: 'touch',
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
              padding: '0.3rem 0.875rem',
              borderRadius: '999px',
              border: isActive
                ? '1.5px solid var(--color-coral)'
                : '1.5px solid var(--color-border)',
              background: isActive
                ? 'linear-gradient(135deg, var(--color-coral) 0%, var(--color-amber) 100%)'
                : 'var(--color-card)',
              color: isActive ? '#fff' : 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
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
