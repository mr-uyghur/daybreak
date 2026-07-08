'use client'

import { useState, useEffect } from 'react'
import { getSavedIds } from '@/lib/local-store'
import type { FeedPage } from '@/lib/types'
import { Feed } from '@/components/Feed'
import { Sky } from '@/components/Sky'
import Link from 'next/link'

/**
 * Saved stories page.
 *
 * Reads the saved IDs from localStorage, then fetches those specific stories
 * from the feed API. Rendered client-side since localStorage isn't available
 * on the server.
 *
 * The sky here holds still at a pre-dawn moment (--sky-t is pinned on the
 * wrapper) — saved stories live in a kept, quiet hour.
 *
 * v2 seam: with auth, this becomes server-rendered from a DB-per-user table.
 */
export default function SavedPage() {
  const [page, setPage] = useState<FeedPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    // MVP approach: walk the feed's cursor pagination client-side and filter
    // to the saved IDs, stopping once every saved story is found (or after a
    // bounded number of pages — saved stories older than the feed retention
    // window can't be recovered anyway)
    const MAX_PAGES = 10

    ;(async () => {
      const ids = getSavedIds()
      const savedStories: FeedPage['stories'] = []

      if (ids.length > 0) {
        try {
          const remaining = new Set(ids)
          let cursor: string | null = null

          for (let i = 0; i < MAX_PAGES && remaining.size > 0; i++) {
            const params = new URLSearchParams()
            if (cursor) params.set('cursor', cursor)
            const res = await fetch(`/api/feed?${params.toString()}`)
            if (!res.ok) throw new Error('Feed fetch failed')
            const data = (await res.json()) as FeedPage

            for (const s of data.stories) {
              if (remaining.delete(s.id)) savedStories.push(s)
            }

            cursor = data.nextCursor
            if (!cursor) break
          }

          // Sort by save order (localStorage array order = insertion order,
          // so most recently saved first)
          savedStories.sort((a, b) => ids.indexOf(b.id) - ids.indexOf(a.id))
        } catch {
          // Show whatever was found before the failure (possibly nothing)
        }
      }

      if (!cancelled) {
        setPage({ stories: savedStories, nextCursor: null })
        setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative', ['--sky-t' as string]: 2 }}>
      <Sky />
      {/* Top scrim behind the header */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '5rem',
          zIndex: 40,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(11, 16, 34, 0.85) 0%, transparent 100%)',
        }}
      />

      {/* Header */}
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
          gap: '0.75rem',
          padding: '0 1.25rem',
        }}
      >
        <Link
          href="/"
          aria-label="Back to feed"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            border: '1px solid var(--color-line)',
            background: 'rgba(22, 31, 61, 0.55)',
            color: 'var(--color-mist-bright)',
            fontSize: '1rem',
            textDecoration: 'none',
            lineHeight: 1,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          ←
        </Link>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: '1.1rem',
            color: 'var(--color-ink)',
          }}
        >
          Saved
        </span>
      </header>

      {loading && (
        <div
          style={{
            height: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-mist)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
          }}
        >
          Loading saved stories…
        </div>
      )}

      {!loading && page && page.stories.length === 0 && (
        <div
          style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--color-mist)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--color-dawn)' }}>
            <path
              d="M12 2.5l2.6 6.1 6.6.55-5 4.35 1.5 6.5L12 16.5 6.3 20l1.5-6.5-5-4.35 6.6-.55L12 2.5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <p style={{ margin: 0, maxWidth: '30ch', lineHeight: 1.5 }}>
            Nothing saved yet. Tap the star on any story to keep it here.
          </p>
          <Link
            href="/"
            style={{
              marginTop: '0.25rem',
              color: 'var(--color-dawn)',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Back to the feed →
          </Link>
        </div>
      )}

      {!loading && page && page.stories.length > 0 && (
        <Feed initialPage={page} />
      )}
    </div>
  )
}
