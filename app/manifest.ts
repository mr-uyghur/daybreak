import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/brand'

/**
 * PWA web manifest.
 * Icons: SVG for now — M8 polish pass will generate proper 192/512 PNGs
 * for full cross-browser installability.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF7',
    theme_color: '#FF8A5B',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
