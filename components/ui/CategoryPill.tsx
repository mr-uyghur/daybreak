'use client'

/** Small category badge used on story cards and filter chips */
export function CategoryPill({
  category,
  active = false,
  onClick,
}: {
  category: string
  active?: boolean
  onClick?: () => void
}) {
  const isInteractive = !!onClick

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-sans)',
        cursor: isInteractive ? 'pointer' : 'default',
        border: 'none',
        // Active = filled accent; inactive = semi-opaque overlay
        background: active
          ? 'var(--color-coral)'
          : 'rgba(255, 255, 255, 0.18)',
        color: active ? '#fff' : 'rgba(255,255,255,0.92)',
        backdropFilter: active ? undefined : 'blur(4px)',
        WebkitBackdropFilter: active ? undefined : 'blur(4px)',
        transition: 'background 0.15s ease, color 0.15s ease',
        flexShrink: 0,
      }}
    >
      {category}
    </button>
  )
}
