'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { addAdminEmail, removeAdminEmail } from '@/app/admin/actions'

interface AdminEmailsProps {
  envAdmins: string[] // Admins fijos de variables de entorno
  dbAdmins: string[] // Admins añadidos dinámicamente
}

export default function AdminEmails({ envAdmins, dbAdmins }: AdminEmailsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')

  const handleAdd = () => {
    setError('')
    if (!newEmail.includes('@')) {
      setError('Email no válido')
      return
    }

    startTransition(async () => {
      try {
        await addAdminEmail(newEmail)
        setNewEmail('')
        router.refresh()
      } catch (e) {
        setError('Error al añadir el email')
      }
    })
  }

  const handleRemove = (email: string) => {
    startTransition(async () => {
      await removeAdminEmail(email)
      router.refresh()
    })
  }

  return (
    <div className='space-y-6 max-w-lg'>
      <div>
        <h2 className='text-lg font-bold text-white'>Gestión de Administradores</h2>
        <p className='text-xs text-gray-500 mt-0.5'>Los admins pueden acceder al panel y asignar canales de TV.</p>
      </div>

      {/* Admins fijos (env var) */}
      <div>
        <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2'>Admins principales (Vercel env var)</p>
        <div className='space-y-1.5'>
          {envAdmins.map(email => (
            <div
              key={email}
              className='flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2'
            >
              <span className='text-green-400 text-sm'>⭐</span>
              <span className='text-sm text-gray-200 flex-1'>{email}</span>
              <span className='text-[10px] text-gray-600 bg-gray-700 px-1.5 py-0.5 rounded'>fijo</span>
            </div>
          ))}
        </div>
        <p className='text-[10px] text-gray-600 mt-2'>
          Para modificar los admins principales, cambia la variable <code className='text-green-400'>ADMIN_EMAILS</code> en Vercel.
        </p>
      </div>

      {/* Admins dinámicos (Supabase) */}
      <div>
        <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2'>Admins adicionales (base de datos)</p>

        {dbAdmins.length > 0 ? (
          <div className='space-y-1.5 mb-3'>
            {dbAdmins.map(email => (
              <div
                key={email}
                className='flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2'
              >
                <span className='text-sm text-gray-200 flex-1'>{email}</span>
                <button
                  onClick={() => handleRemove(email)}
                  disabled={isPending}
                  className='text-red-500 hover:text-red-400 text-xs px-2 py-0.5 rounded hover:bg-red-900/20 transition-colors disabled:opacity-50'
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-600 mb-3 italic'>No hay admins adicionales.</p>
        )}

        {/* Añadir nuevo */}
        <div className='flex gap-2'>
          <input
            type='email'
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder='nuevo@email.com'
            className='flex-1 bg-gray-700 border border-gray-600 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder:text-gray-500'
          />
          <button
            onClick={handleAdd}
            disabled={isPending || !newEmail}
            className='px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors'
          >
            {isPending ? '...' : 'Añadir'}
          </button>
        </div>

        {error && <p className='text-xs text-red-400 mt-1.5'>{error}</p>}
      </div>
    </div>
  )
}
