import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'crests.football-data.org' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      // ← Fotos de perfil de Google
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ]
  }
}

export default nextConfig
