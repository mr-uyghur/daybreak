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

/** Full card-shaped skeleton matching the text-first card layout */
export function CardSkeleton() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        scrollSnapAlign: 'start',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '34rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          padding: '6.75rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))',
        }}
      >
        <Skeleton style={{ height: '0.75rem', width: '45%' }} />
        <Skeleton style={{ height: '1.9rem', width: '95%' }} />
        <Skeleton style={{ height: '1.9rem', width: '78%' }} />
        <Skeleton style={{ height: '0.95rem', width: '92%', marginTop: '0.25rem' }} />
        <Skeleton style={{ height: '0.95rem', width: '85%' }} />
        <Skeleton style={{ height: '2.1rem', width: '60%', borderRadius: '999px', marginTop: '0.25rem' }} />
        <Skeleton style={{ flex: 1, borderRadius: '1.25rem', marginTop: '0.5rem' }} />
      </div>
    </div>
  )
}
