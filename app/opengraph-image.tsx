import { ImageResponse } from 'next/og'
import { BRAND } from '@/lib/brand'

export const runtime = 'edge'
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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF8A5B 0%, #FFC15E 100%)',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            background: 'rgba(255, 253, 247, 0.94)',
            borderRadius: '24px',
            padding: '64px 96px',
          }}
        >
          <div style={{ fontSize: '80px', lineHeight: 1 }}>☀️</div>
          <div
            style={{
              fontFamily: 'serif',
              fontWeight: 700,
              fontSize: '76px',
              color: '#2B2722',
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            {BRAND.name}
          </div>
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: '28px',
              color: '#8C7B72',
              textAlign: 'center',
              maxWidth: '640px',
              lineHeight: 1.4,
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
