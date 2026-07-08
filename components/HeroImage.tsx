'use client'

import Image from 'next/image'
import { useState } from 'react'

const CATEGORY_GLYPHS: Record<string, string> = {
  Science:     '🔬',
  Environment: '🌿',
  Health:      '💊',
  Community:   '🤝',
  Animals:     '🦋',
  Arts:        '🎨',
  Technology:  '⚡',
  Education:   '📚',
  Sports:      '🏅',
  World:       '🌍',
}

interface HeroImageProps {
  src: string | null | undefined
  alt: string
  category: string
  priority?: boolean
}

/**
 * Full-bleed hero image. Broken/missing images fall back to a miniature
 * horizon: night sky fading to first light, with the category glyph rising
 * like the sun. Never crashes on a bad URL.
 */
export function HeroImage({ src, alt, category, priority = false }: HeroImageProps) {
  const [failed, setFailed] = useState(!src)
  const glyph = CATEGORY_GLYPHS[category] ?? '✦'

  if (failed || !src) {
    return (
      <div
        className="hero-fallback"
        role="img"
        aria-label={alt}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '12%',
          fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
        }}
      >
        {glyph}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 34rem) 100vw, 544px"
      unoptimized
      referrerPolicy="no-referrer"
      style={{ objectFit: 'cover' }}
      onError={() => setFailed(true)}
      priority={priority}
    />
  )
}
