'use client'

import { motion } from 'motion/react'
import { HeroImage } from './HeroImage'
import { ReactionBar } from './ReactionBar'
import type { StoryWithReactions } from '@/lib/types'

interface StoryCardProps {
  story: StoryWithReactions
  /** Called when the card body is tapped to open the expanded view */
  onTap: () => void
  /** Index within the feed — card 0 loads its image eagerly */
  index: number
}

/**
 * Full-screen story card — one per scroll-snap page, composed on the sky.
 *
 * Text-first: eyebrow → serif headline → summary → reactions, with the
 * image framed low on the card like the sun sitting at the horizon.
 * Tap anywhere (except the reaction buttons) to open the expanded view.
 */
export function StoryCard({ story, onTap, index }: StoryCardProps) {
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
        scrollSnapAlign: 'start',
        display: 'flex',
        justifyContent: 'center',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Read story: ${story.headline}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap() } }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '34rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          padding: '6.75rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))',
        }}
      >
        {/* Eyebrow — category · source · date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-mist)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <span style={{ color: 'var(--color-dawn)', fontWeight: 700 }}>
            {story.category}
          </span>
          <span aria-hidden style={{ opacity: 0.5 }}>·</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sourceDomain}</span>
          <span aria-hidden style={{ opacity: 0.5 }}>·</span>
          <span>{publishedLabel}</span>
        </div>

        {/* Headline — the hero of the card */}
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 'clamp(1.45rem, 5.5vw, 2rem)',
            lineHeight: 1.18,
            color: 'var(--color-ink)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {story.headline}
        </h2>

        {/* Summary teaser */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: 'var(--color-mist)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {story.summary}
        </p>

        {/* Reactions — right on the card; taps must not open the story */}
        <div onClick={(e) => e.stopPropagation()} style={{ alignSelf: 'flex-start' }}>
          <ReactionBar story={story} />
        </div>

        <div style={{ flex: '0 1 0.5rem' }} />

        {/* Hero image — a window at the horizon */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 auto',
            minHeight: '7rem',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            boxShadow: '0 0 0 1px var(--color-line), 0 24px 60px -20px rgba(5, 8, 20, 0.8)',
          }}
        >
          <HeroImage
            src={story.imageUrl}
            alt={story.headline}
            category={story.category}
            priority={index === 0}
          />
          {/* Read affordance — quiet pill over the image */}
          <span
            style={{
              position: 'absolute',
              right: '0.75rem',
              bottom: '0.75rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(11, 16, 34, 0.72)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 600,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            Read story ↗
          </span>
        </div>
      </div>
    </motion.article>
  )
}
