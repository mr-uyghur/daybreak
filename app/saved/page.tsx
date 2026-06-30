'use client'

import { useState, useEffect } from 'react'
import { getSavedIds } from '@/lib/local-store'
import type { FeedPage } from '@/lib/types'
import { Feed } from '@/components/Feed'
import Link from 'next/link'
import { BRAND } from '@/lib/brand'

/**
 * Saved stories page.
 *
 * Reads the saved IDs from localStorage, then fetches those specific stories
 * from the feed API. Rendered client-side since localStorage isn't available
 * on the server.
 *
 * v2 seam: with auth, this becomes server-rendered from a DB-per-user table.
 */
export default function SavedPage() {
  const [page, setPage] = useState<FeedPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getSavedIds()

    if (ids.length === 0) {
      setPage({ stories: [], nextCursor: null })
      setLoading(false)
      return
    }

    // Fetch all pages until we have all saved IDs (or give up after 5 pages)
    // Simple approach for MVP: just load the feed and filter client-side
    // (saved count is typically small, so this is fine)
    ;(async () => {
      try {
        const res = await fetch(`/api/feed?limit=100`)
        if (!res.ok) throw new Error('Feed fetch failed')
        const data = (await res.json()) as FeedPage
        // Filter to only saved stories, preserving save order (most recently saved first)
        const savedSet = new Set(ids)
        const savedStories = data.stories.filter((s) => savedSet.has(s.id))
        // Sort by save order (localStorage array order = insertion order)
        savedStories.sort((a, b) => ids.indexOf(b.id) - ids.indexOf(a.id))
        setPage({ stories: savedStories, nextCursor: null })
      } catch {
        setPage({ stories: [], nextCursor: null })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Top bar */}
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
          padding: '0 1rem',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          href="/"
          aria-label="Back to feed"
          style={{
            color: 'var(--color-muted)',
            fontSize: '1.1rem',
            textDecoration: 'none',
            lineHeight: 1,
          }}
        >
          ←
        </Link>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--color-on-surface)',
          }}
        >
          Saved
        </span>
      </header>

      <div style={{ paddingTop: '3.25rem' }}>
        {loading && (
          <div
            style={{
              height: '60dvh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-muted)',
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
              height: '70dvh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🔖</span>
            <p style={{ margin: 0, maxWidth: '28ch', lineHeight: 1.5 }}>
              No saved stories yet — tap 🏷️ on any story to save it here.
            </p>
            <Link
              href="/"
              style={{
                marginTop: '0.5rem',
                color: 'var(--color-coral)',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              Browse the feed →
            </Link>
          </div>
        )}

        {!loading && page && page.stories.length > 0 && (
          <Feed initialPage={page} />
        )}
      </div>
    </div>
  )
}
