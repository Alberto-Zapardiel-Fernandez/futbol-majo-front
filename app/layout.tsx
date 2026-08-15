/**
 * Layout raíz de la aplicación.
 *
 * En Next.js, layout.tsx es el "molde" que envuelve TODAS las páginas.
 * Todo lo que pongas aquí aparece en todas las URLs de la app.
 * Es el lugar ideal para la barra de navegación, el footer, etc.
 */

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

/**
 * Geist es la fuente de Vercel (los creadores de Next.js).
 * Next.js la descarga automáticamente sin peticiones a Google Fonts.
 */
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist'
})

/**
 * Metadata: título y descripción que aparecen en la pestaña del navegador
 * y en los resultados de Google.
 */
export const metadata: Metadata = {
  title: 'Fútbol Majo',
  description: 'Sigue tus partidos y clasificaciones favoritas'
}

/**
 * RootLayout envuelve TODAS las páginas de la app.
 *
 * @param children - El contenido de la página actual (lo inyecta Next.js)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <body className={`${geist.variable} bg-gray-950 text-white min-h-screen font-sans`}>
        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <header className='bg-gray-900 border-b border-gray-800 sticky top-0 z-50'>
          <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center gap-2'>
              <span className='text-2xl'>⚽</span>
              <span className='font-bold text-lg tracking-tight'>Fútbol Majo</span>
            </div>

            {/* Navegación con Link de Next.js en lugar de <a> */}
            {/*
              ¿Por qué Link y no <a>?
              - <a href="..."> recarga la página entera desde cero (lento)
              - <Link href="..."> hace una navegación "suave": solo carga
                lo que cambia entre páginas, sin parpadeo ni recarga completa.
                Es como la diferencia entre recargar toda la app o solo
                cambiar la pantalla activa.
            */}
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

        {/* ── CONTENIDO DE LA PÁGINA ───────────────────────────────────── */}
        <main className='max-w-4xl mx-auto px-4 py-6 pb-24'>{children}</main>
      </body>
    </html>
  )
}
