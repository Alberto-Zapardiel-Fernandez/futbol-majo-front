import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import { auth } from '@/auth'
import { isAdminEmail } from '@/lib/auth'
import AuthButton from '@/components/AuthButton'
import BottomNav from '@/components/BottomNav'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import SessionProvider from '@/components/SessionProvider'
import UpdateBanner from '@/components/UpdateBanner'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Fútbol Majo',
  description: 'Sigue tus partidos y clasificaciones favoritas en tiempo real',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Fútbol Majo' },
  icons: { icon: '/icons/icon.svg', apple: '/icons/icon.svg' }
}

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAdmin = isAdminEmail(session?.user?.email)

  return (
    <html lang='es'>
      <body className={`${geist.variable} bg-gray-950 text-white min-h-screen font-sans`}>
        <SessionProvider>
          <ServiceWorkerRegistration />
          <UpdateBanner />

          <header className='bg-gray-900 border-b border-gray-800 sticky top-0 z-40'>
            <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
              <Link
                href='/'
                className='flex items-center gap-2 hover:opacity-80 transition-opacity'
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='/icons/icon.svg'
                  alt=''
                  className='w-7 h-7 rounded'
                  aria-hidden
                />
                <span className='font-bold text-lg tracking-tight'>Fútbol Majo</span>
              </Link>

              <div className='flex items-center gap-2'>
                <nav className='hidden md:flex items-center gap-1'>
                  <Link
                    href='/'
                    className='px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all'
                  >
                    Partidos
                  </Link>
                  <Link
                    href='/standings'
                    className='px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all'
                  >
                    Clasificación
                  </Link>
                  {isAdmin && (
                    <Link
                      href='/admin'
                      className='px-3 py-2 rounded-lg text-sm text-green-400 hover:text-green-300 hover:bg-green-900/20 transition-all font-medium'
                    >
                      ⚙️ Admin
                    </Link>
                  )}
                </nav>

                {/* AuthButton solo muestra avatar + salir, sin duplicar Admin */}
                <AuthButton />
              </div>
            </div>
          </header>

          <main className='max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8'>{children}</main>

          <BottomNav isAdmin={isAdmin} />
        </SessionProvider>
      </body>
    </html>
  )
}
