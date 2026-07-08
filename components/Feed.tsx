'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { StoryCard } from './StoryCard'
import { CardSkeleton } from './ui/Skeleton'
import { ExpandedView } from './ExpandedView'
import { setSkyProgress } from './Sky'
import type { FeedPage } from '@/lib/types'

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
 * - Drives the sky: scroll depth advances `--sky-t` from night to daybreak
 *   (rAF-throttled, opacity-only crossfades — no paint during scroll).
 * - Expanded view opens as a full-screen overlay when a card is tapped.
 */
export function Feed({ initialPage, category }: FeedProps) {
  const [pages, setPages]         = useState<FeedPage[]>([initialPage])
  const [loading, setLoading]     = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const sentinelRef               = useRef<HTMLDivElement>(null)
  const scrollerRef               = useRef<HTMLDivElement>(null)
  const skyTicking                = useRef(false)

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

  /** Advance the sky with scroll depth (fractional cards scrolled) */
  const handleScroll = useCallback(() => {
    if (skyTicking.current) return
    skyTicking.current = true
    requestAnimationFrame(() => {
      skyTicking.current = false
      const el = scrollerRef.current
      if (!el || el.clientHeight === 0) return
      setSkyProgress(el.scrollTop / el.clientHeight)
    })
  }, [])

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
        ref={scrollerRef}
        onScroll={handleScroll}
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

        {/* End of feed — the reader reached daybreak */}
        {!hasMore && !loading && allStories.length > 0 && (
          <div
            style={{
              height: '55dvh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem',
              textAlign: 'center',
              fontFamily: 'var(--font-sans)',
              // Snap target — without this, mandatory snapping bounces back
              // to the last card and this state is unreachable
              scrollSnapAlign: 'end',
            }}
          >
            <hr className="horizon-line" style={{ width: 'min(16rem, 60vw)' }} />
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontSize: '1.2rem',
                lineHeight: 1.35,
                color: 'var(--color-ink)',
                maxWidth: '22ch',
              }}
            >
              You made it to daybreak.
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-mist-bright)', maxWidth: '30ch' }}>
              That&apos;s every story for now — new good news lands throughout the day.
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
        color: 'var(--color-mist)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <hr className="horizon-line" style={{ width: 'min(12rem, 50vw)' }} />
      <p style={{ margin: 0, maxWidth: '28ch', lineHeight: 1.5 }}>
        The first stories are on their way — check back soon.
      </p>
    </div>
  )
}
