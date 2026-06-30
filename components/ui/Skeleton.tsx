/**
 * Shimmer skeleton placeholder — used while feed cards are loading.
 * The `.skeleton` class is defined in globals.css.
 */
export function Skeleton({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden />
}

/** Full card-shaped skeleton for the feed loading state */
export function CardSkeleton() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-card)',
      }}
    >
      {/* Hero image area */}
      <Skeleton style={{ flex: '0 0 55%', borderRadius: 0 }} />
      {/* Content area */}
      <div style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton style={{ height: '0.75rem', width: '30%' }} />
        <Skeleton style={{ height: '1.5rem', width: '90%' }} />
        <Skeleton style={{ height: '1.5rem', width: '80%' }} />
        <Skeleton style={{ height: '1rem', width: '95%', marginTop: '0.5rem' }} />
        <Skeleton style={{ height: '1rem', width: '88%' }} />
        <Skeleton style={{ height: '1rem', width: '75%' }} />
      </div>
    </div>
  )
}
