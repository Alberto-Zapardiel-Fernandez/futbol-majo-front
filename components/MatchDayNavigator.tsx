'use client'

import { useRouter } from 'next/navigation'
import { MAX_MATCHDAY } from '@/lib/leagues'

interface MatchdayNavigatorProps {
  competition: string
  current: number
}

export default function MatchdayNavigator({ competition, current }: MatchdayNavigatorProps) {
  const router = useRouter()
  const max = MAX_MATCHDAY[competition] ?? 38

  const go = (jornada: number) => {
    router.push(`?competition=${competition}&jornada=${jornada}`)
  }

  return (
    <div className='flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3'>
      {/* Botón anterior */}
      <button
        onClick={() => go(current - 1)}
        disabled={current <= 1}
        className='w-9 h-9 flex items-center justify-center rounded-lg
                   text-gray-400 hover:text-white hover:bg-gray-700
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all'
      >
        ‹
      </button>

      {/* Jornada actual */}
      <div className='text-center'>
        <p className='text-xs text-gray-500 uppercase tracking-wider'>Jornada</p>
        <p className='text-xl font-bold text-white'>{current}</p>
        <p className='text-xs text-gray-600'>de {max}</p>
      </div>

      {/* Botón siguiente */}
      <button
        onClick={() => go(current + 1)}
        disabled={current >= max}
        className='w-9 h-9 flex items-center justify-center rounded-lg
                   text-gray-400 hover:text-white hover:bg-gray-700
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all'
      >
        ›
      </button>
    </div>
  )
}
