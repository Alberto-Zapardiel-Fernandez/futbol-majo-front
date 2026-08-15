/**
 * Componente que se auto-ejecuta al montarse para sincronizar una liga sin datos.
 *
 * ¿Cuándo aparece? Cuando el usuario navega a una liga que el backend todavía
 * no ha sincronizado (ej. liga rara que no estaba en el arranque automático).
 *
 * ¿Qué hace?
 * 1. Muestra un spinner mientras llama al endpoint /sync del backend.
 * 2. Cuando termina, llama a router.refresh() para que Next.js re-ejecute
 *    el Server Component de la página y cargue los partidos nuevos.
 * 3. Si hay error, muestra un botón para reintentar.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AutoSyncTriggerProps {
  competition: string
  matchDay: number
}

export default function AutoSyncTrigger({ competition, matchDay }: AutoSyncTriggerProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'syncing' | 'done' | 'error'>('syncing')

  useEffect(() => {
    const doSync = async () => {
      try {
        setStatus('syncing')

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync?league=${competition}`, { method: 'POST' })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        setStatus('done')
        // Refresca el Server Component para cargar los partidos nuevos
        router.refresh()
      } catch (err) {
        console.error('Error en auto-sync:', err)
        setStatus('error')
      }
    }

    doSync()
  }, [competition, router])

  // ── Cargando ─────────────────────────────────────────────────────────────
  if (status === 'syncing') {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4'>
        <div className='relative'>
          {/* Spinner */}
          <div className='w-12 h-12 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin' />
        </div>
        <div className='text-center'>
          <p className='text-gray-300 font-medium'>Cargando datos de la liga...</p>
          <p className='text-gray-500 text-sm mt-1'>Primera vez que cargas esta competición</p>
        </div>
        {/* Barra de progreso indeterminada */}
        <div className='w-48 h-1 bg-gray-800 rounded-full overflow-hidden'>
          <div
            className='h-full bg-green-500 rounded-full animate-pulse'
            style={{ width: '60%' }}
          />
        </div>
      </div>
    )
  }

  // ── Completado (router.refresh() en marcha) ───────────────────────────────
  if (status === 'done') {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-3'>
        <div className='w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center'>
          <span className='text-green-400 text-xl'>✓</span>
        </div>
        <p className='text-gray-300'>Datos cargados, actualizando pantalla...</p>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  return (
    <div className='flex flex-col items-center justify-center py-20 gap-4'>
      <div className='w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center'>
        <span className='text-red-400 text-xl'>⚠</span>
      </div>
      <div className='text-center'>
        <p className='text-red-400 font-medium'>No se pudieron cargar los datos</p>
        <p className='text-gray-500 text-sm mt-1'>Comprueba que el backend está arrancado en localhost:8080</p>
      </div>
      <button
        onClick={() => router.push(`?competition=${competition}&jornada=${matchDay}`)}
        className='px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors'
      >
        Reintentar
      </button>
    </div>
  )
}
