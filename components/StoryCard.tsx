'use client'

import { motion } from 'motion/react'
import { HeroImage } from './HeroImage'
import { CategoryPill } from './ui/CategoryPill'
import type { StoryWithReactions } from '@/lib/types'

interface StoryCardProps {
  story: StoryWithReactions
  /** Called when the card body is tapped to open the expanded view */
  onTap: () => void
  /** Index within the feed — card 0 loads its image eagerly */
  index: number
}

/**
 * Full-screen story card — one per scroll-snap page.
 *
 * Layout: hero image (~55vh) / rounded content panel overlap (~45dvh).
 * Tap the card body to open expanded view. Reaction / share / save bar
 * is in the ExpandedView and the in-card row below (M4).
 */
export function StoryCard({ story, onTap, index }: StoryCardProps) {
  // Format the source domain for display
  const sourceDomain = (() => {
    try { return new URL(story.sourceUrl).hostname.replace(/^www\./, '') }
    catch { return story.sourceUrl }
  })()

  const publishedLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(story.publishedAt))

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: Math.min(index, 3) * 0.06 }}
      onClick={onTap}
      style={{
        height: '100dvh',
        width: '100%',
        flexShrink: 0,
        position: 'relative',
        cursor: 'pointer',
        background: 'var(--color-card)',
        overflowY: 'hidden',
        scrollSnapAlign: 'start',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Read story: ${story.headline}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap() } }}
    >
      {/* ── Hero image ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '58%',
          overflow: 'hidden',
        }}
      >
        <HeroImage
          src={story.imageUrl}
          alt={story.headline}
          category={story.category}
          priority={index === 0}
        />
        {/* Gradient scrim so the content panel blends in */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to bottom, transparent, var(--color-card))',
          }}
        />
        {/* Category pill — floated over hero */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <CategoryPill category={story.category} />
        </div>
      </div>

      {/* ── Content panel ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '46%',
          background: 'var(--color-card)',
          borderTopLeftRadius: '1.25rem',
          borderTopRightRadius: '1.25rem',
          padding: '1.25rem 1rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflow: 'hidden',
        }}
      >
        {/* Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
            lineHeight: 1.25,
            color: 'var(--color-on-surface)',
            margin: 0,
            // Clamp to 3 lines
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {story.headline}
        </h2>

        {/* Summary (2-line teaser) */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            lineHeight: 1.55,
            color: 'var(--color-muted)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {story.summary}
        </p>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Source + date footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-sans)',
            opacity: 0.7,
          }}
        >
          <span>{sourceDomain}</span>
          <span aria-hidden>·</span>
          <span>{publishedLabel}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>Tap to read ↗</span>
        </div>
      </div>
    </motion.article>
  )
}
