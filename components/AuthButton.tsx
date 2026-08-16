/**
 * Botón de login/logout.
 * Server Component — lee la sesión en el servidor.
 */

import { auth, signIn, signOut } from '@/auth'
import { isAdminEmail } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'

export default async function AuthButton() {
  const session = await auth()
  const user = session?.user
  const isAdmin = isAdminEmail(user?.email)

  if (!user) {
    return (
      <form
        action={async () => {
          'use server'
          await signIn('google')
        }}
      >
        <button
          type='submit'
          className='flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-all'
        >
          <svg
            viewBox='0 0 24 24'
            className='w-4 h-4'
            aria-hidden='true'
          >
            <path
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              fill='#4285F4'
            />
            <path
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              fill='#34A853'
            />
            <path
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              fill='#FBBC05'
            />
            <path
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              fill='#EA4335'
            />
          </svg>
          Entrar
        </button>
      </form>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      {isAdmin && (
        <Link
          href='/admin'
          className='hidden md:flex items-center gap-1 px-2 py-1 bg-green-900/50 border border-green-700 rounded-lg text-xs text-green-400 hover:bg-green-800/50 transition-colors font-medium'
        >
          ⚙️ Admin
        </Link>
      )}

      <div className='flex items-center gap-2'>
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? 'Usuario'}
            width={28}
            height={28}
            className='rounded-full ring-1 ring-gray-700'
          />
        ) : (
          <div className='w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold'>
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}

        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/' })
          }}
        >
          <button
            type='submit'
            className='text-xs text-gray-500 hover:text-gray-300 transition-colors'
            title='Cerrar sesión'
          >
            Salir
          </button>
        </form>
      </div>
    </div>
  )
}
