'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { HeroImage } from './HeroImage'
import { ReactionBar } from './ReactionBar'
import { ShareButton } from './ShareButton'
import { SaveButton } from './SaveButton'
import type { StoryWithReactions } from '@/lib/types'

interface ExpandedViewProps {
  story: StoryWithReactions
  onClose: () => void
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen overlay that slides up over the feed when a card is tapped.
 *
 * Accessibility: focus is moved into the dialog on open; Tab cycles within it;
 * Escape closes. The backdrop click also closes.
 */
export function ExpandedView({ story, onClose }: ExpandedViewProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current

    // Move focus into the dialog on open
    panel?.focus()
    document.body.style.overflow = 'hidden'

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }

      if (e.key === 'Tab' && panel) {
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === panel) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const sourceDomain = (() => {
    try { return new URL(story.sourceUrl).hostname.replace(/^www\./, '') }
    catch { return story.sourceUrl }
  })()

  const publishedLabel = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(story.publishedAt))

  return (
    // Backdrop — click to dismiss; no aria-hidden (dialog inside must be reachable)
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      {/* Panel */}
      <motion.div
        ref={panelRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={story.headline}
        tabIndex={-1}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '95dvh',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          background: 'var(--color-card)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        {/* Hero image */}
        <div style={{ position: 'relative', height: '40dvh', flexShrink: 0 }}>
          <HeroImage
            src={story.imageUrl}
            alt={story.headline}
            category={story.category}
          />
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.25rem 1rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}
        >
          {/* Category + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(255, 138, 91, 0.12)',
                color: 'var(--color-coral)',
                fontWeight: 600,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {story.category}
            </span>
            <span aria-hidden>·</span>
            <span>{publishedLabel}</span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
              lineHeight: 1.2,
              color: 'var(--color-on-surface)',
              margin: 0,
            }}
          >
            {story.headline}
          </h2>

          {/* Full summary */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.95rem',
              lineHeight: 1.65,
              color: 'var(--color-on-surface)',
              margin: 0,
              opacity: 0.85,
            }}
          >
            {story.summary}
          </p>

          {/* Read original link */}
          <a
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, var(--color-coral) 0%, var(--color-amber) 100%)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            Read original ↗
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{sourceDomain}</span>
          </a>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.25rem 0' }} />

          {/* Action row: reactions, share, save */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <ReactionBar story={story} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <ShareButton title={story.headline} url={story.sourceUrl} />
              <SaveButton storyId={story.id} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
