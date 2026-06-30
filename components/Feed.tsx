'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { StoryCard } from './StoryCard'
import { CardSkeleton } from './ui/Skeleton'
import { ExpandedView } from './ExpandedView'
import type { StoryWithReactions, FeedPage } from '@/lib/types'

interface FeedProps {
  /** Pre-fetched first page from the server (no loading flash on first render) */
  initialPage: FeedPage
  /** Optional category filter — null means "all" */
  category?: string | null
}

/**
 * Full-screen, scroll-snap feed.
 *
 * - Renders one card per 100dvh "page" with CSS scroll-snap.
 * - Infinite-scrolls via an IntersectionObserver sentinel at the bottom.
 * - Expanded view opens as a full-screen overlay when a card is tapped.
 */
export function Feed({ initialPage, category }: FeedProps) {
  const [pages, setPages]         = useState<FeedPage[]>([initialPage])
  const [loading, setLoading]     = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const sentinelRef               = useRef<HTMLDivElement>(null)

  const allStories = pages.flatMap((p) => p.stories)
  const lastCursor = pages[pages.length - 1]?.nextCursor ?? null
  const hasMore    = !!lastCursor

  /** Fetch the next page and append it */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (lastCursor) params.set('cursor', lastCursor)
      if (category)   params.set('category', category)

      const res = await fetch(`/api/feed?${params.toString()}`)
      if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`)

      const page = (await res.json()) as FeedPage
      setPages((prev) => [...prev, page])
    } catch (err) {
      console.error('[Feed] loadMore error:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, lastCursor, category])

  /** IntersectionObserver watches the sentinel div at the bottom of the list */
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  const expandedStory = expandedId !== null
    ? allStories.find((s) => s.id === expandedId) ?? null
    : null

  if (allStories.length === 0 && !loading) {
    return (
      <EmptyState />
    )
  }

  return (
    <>
      {/* Scroll-snap container */}
      <div
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          // Prevent scroll chaining from trapping keyboard users on desktop
          overscrollBehaviorY: 'contain',
        }}
      >
        {allStories.map((story, i) => (
          <StoryCard
            key={story.id}
            story={story}
            index={i}
            onTap={() => setExpandedId(story.id)}
          />
        ))}

        {/* Loading skeleton — shown at the bottom while fetching next page */}
        {loading && <CardSkeleton />}

        {/* IntersectionObserver sentinel — triggers next page load */}
        <div ref={sentinelRef} style={{ height: 1, flexShrink: 0 }} aria-hidden />

        {/* End-of-feed message */}
        {!hasMore && !loading && allStories.length > 0 && (
          <div
            style={{
              height: '40dvh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>✦</span>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              You've reached the end — check back soon for more good news.
            </p>
          </div>
        )}
      </div>

      {/* Expanded story overlay */}
      {expandedStory && (
        <ExpandedView
          story={expandedStory}
          onClose={() => setExpandedId(null)}
        />
      )}
    </>
  )
}

function EmptyState() {
  return (
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
        color: 'var(--color-muted)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span style={{ fontSize: '2rem' }}>🌅</span>
      <p style={{ margin: 0, maxWidth: '28ch', lineHeight: 1.5 }}>
        The good news is loading — check back soon.
      </p>
    </div>
  )
}
