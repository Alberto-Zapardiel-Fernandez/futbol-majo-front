/**
 * Middleware de Next.js — se ejecuta en cada petición ANTES de llegar a la página.
 *
 * Protege la ruta /admin:
 * - Si no has iniciado sesión → te redirige a la página de login
 * - Si has iniciado sesión pero no eres admin → te redirige al inicio
 *
 * Para cualquier otra ruta deja pasar sin comprobar nada.
 */

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
  const { pathname } = req.nextUrl

  // Solo protegemos /admin y sus subrutas
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Sin sesión → login
  if (!req.auth) {
    const loginUrl = new URL('/api/auth/signin', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Con sesión pero no admin → inicio
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  const userEmail = req.auth.user?.email ?? ''

  if (!adminEmails.includes(userEmail)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

// Le decimos a Next.js en qué rutas ejecutar el middleware
export const config = {
  matcher: ['/admin/:path*']
}
