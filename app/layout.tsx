/**
 * Layout raíz de la aplicación.
 * Envuelve todas las páginas con el header, fuente y configuración PWA.
 */

import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist'
})

/** Metadata: título, descripción e iconos para SEO y redes sociales */
export const metadata: Metadata = {
  title: 'Fútbol Majo',
  description: 'Sigue tus partidos y clasificaciones favoritas en tiempo real',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fútbol Majo'
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg'
  }
}

/**
 * Viewport: configuración de color del tema en la barra del navegador
 * y en la barra de estado del móvil cuando se instala como PWA.
 */
export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <body className={`${geist.variable} bg-gray-950 text-white min-h-screen font-sans`}>
        {/* Registra el Service Worker para funcionalidad PWA */}
        <ServiceWorkerRegistration />

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header className='bg-gray-900 border-b border-gray-800 sticky top-0 z-50'>
          <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src='/icons/icon.svg'
                alt='Fútbol Majo'
                className='w-7 h-7 rounded'
              />
              <span className='font-bold text-lg tracking-tight'>Fútbol Majo</span>
            </div>

            <nav className='flex items-center gap-4 text-sm text-gray-400'>
              <Link
                href='/'
                className='hover:text-white transition-colors'
              >
                Partidos
              </Link>
              <Link
                href='/standings'
                className='hover:text-white transition-colors'
              >
                Clasificación
              </Link>
            </nav>
          </div>
        </header>

        {/* ── CONTENIDO ──────────────────────────────────────────────────── */}
        <main className='max-w-4xl mx-auto px-4 py-6 pb-24'>{children}</main>
      </body>
    </html>
  )
}
