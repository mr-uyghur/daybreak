import { ImageResponse } from 'next/og'
import { BRAND } from '@/lib/brand'

export const alt = `${BRAND.name} — ${BRAND.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(to bottom, #0B1022 0%, #1B2340 45%, #3A4570 78%, #6A5A8A 92%, #FFAE70 100%)',
        }}
      >
        {/* Stars */}
        <div style={{ position: 'absolute', top: 70, left: 180, width: 4, height: 4, borderRadius: 4, background: '#F5F1E8', opacity: 0.8, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 130, left: 920, width: 3, height: 3, borderRadius: 3, background: '#F5F1E8', opacity: 0.6, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 60, left: 640, width: 3, height: 3, borderRadius: 3, background: '#F5F1E8', opacity: 0.7, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 190, left: 340, width: 3, height: 3, borderRadius: 3, background: '#F5F1E8', opacity: 0.5, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 100, left: 1080, width: 4, height: 4, borderRadius: 4, background: '#F5F1E8', opacity: 0.55, display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            marginTop: '-40px',
          }}
        >
          <div
            style={{
              fontFamily: 'serif',
              fontSize: '96px',
              color: '#F5F1E8',
              letterSpacing: '-1px',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            {BRAND.name}
          </div>
          {/* Horizon line */}
          <div
            style={{
              width: '360px',
              height: '3px',
              background: 'linear-gradient(to right, rgba(255,183,132,0) 0%, #FFB784 35%, #F09CA8 65%, rgba(240,156,168,0) 100%)',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: '32px',
              color: '#CDD3E8',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            {BRAND.tagline}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
