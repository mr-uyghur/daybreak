import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

/** App icon — the sun cresting the horizon on a night-blue sky */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(to bottom, #0B1022 0%, #2A3457 70%, #3A4570 100%)',
          borderRadius: '40px',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 76,
            width: 160,
            height: 160,
            borderRadius: 160,
            background: 'radial-gradient(circle, rgba(255,174,112,0.55) 0%, rgba(255,174,112,0) 65%)',
            display: 'flex',
          }}
        />
        {/* Sun cresting */}
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 116,
            width: 80,
            height: 80,
            borderRadius: 80,
            background: '#FFAE70',
            display: 'flex',
          }}
        />
        {/* Horizon */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 156,
            width: 192,
            height: 36,
            background: '#0B1022',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 153,
            width: 192,
            height: 4,
            background: '#FFB784',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
