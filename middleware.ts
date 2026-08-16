/**
 * Middleware de Next.js.
 * Protege /admin: redirige si no hay sesión o el usuario no es admin.
 */

import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth(function middleware(req: NextRequest & { auth: unknown }) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (!req.auth) {
    const loginUrl = new URL('/api/auth/signin', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  // @ts-expect-error - auth está en req por NextAuth
  const userEmail = req.auth?.user?.email ?? ''

  if (!adminEmails.includes(userEmail)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*']
}
