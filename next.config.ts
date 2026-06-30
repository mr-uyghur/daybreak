import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Allow any external image host — tighten per-source in M6 once feeds are locked in
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
