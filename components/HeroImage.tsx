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
 * Full-bleed hero image with a warm gradient + category glyph fallback.
 * Never crashes on a broken/missing image URL.
 */
export function HeroImage({ src, alt, category, priority = false }: HeroImageProps) {
  const [failed, setFailed] = useState(!src)
  const glyph = CATEGORY_GLYPHS[category] ?? '✨'

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
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
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
      sizes="100vw"
      unoptimized
      referrerPolicy="no-referrer"
      style={{ objectFit: 'cover' }}
      onError={() => setFailed(true)}
      priority={priority}
    />
  )
}
