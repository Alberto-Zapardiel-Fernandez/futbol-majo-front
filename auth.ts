/**
 * Configuración central de NextAuth v5 (Auth.js).
 *
 * Este fichero exporta las funciones que usaremos en toda la app:
 * - handlers: las rutas API de autenticación (GET /api/auth/...)
 * - auth: función para obtener la sesión en Server Components
 * - signIn / signOut: funciones para iniciar/cerrar sesión
 */

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],

  callbacks: {
    /**
     * Se ejecuta en cada petición con sesión activa.
     * Añadimos el email del usuario al token JWT para
     * poder comprobar si es admin desde cualquier componente.
     */
    async jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email
      }
      return token
    },

    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email as string
      }
      return session
    }
  },

  pages: {
    // Página de error personalizada (opcional, por ahora usamos la de NextAuth)
    error: '/auth/error'
  }
})
