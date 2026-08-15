/**
 * Configuración de Next.js.
 *
 * remotePatterns: lista blanca de dominios desde los que Next.js puede
 * optimizar imágenes con el componente <Image />.
 * - crests.football-data.org: escudos de equipos
 * - flagcdn.com: banderas de países en el selector de ligas
 */
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crests.football-data.org'
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com'
      }
    ]
  }
}

export default nextConfig
