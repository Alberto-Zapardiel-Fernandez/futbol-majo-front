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
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string
      if (token.picture) session.user.image = token.picture as string
      return session
    },
    async jwt({ token, account, profile }) {
      if (profile) {
        token.email = profile.email
        token.picture = (profile as { picture?: string }).picture
      }
      return token
    }
  }
})
