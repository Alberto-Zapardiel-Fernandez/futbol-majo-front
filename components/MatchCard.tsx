'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Match, MatchStatus } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })
}

function formatDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Madrid'
  })
}

/**
 * Calcula el minuto REAL del partido descontando el descanso.
 *
 * Problema anterior: (ahora - inicio) / 60 da el tiempo de PARED (wall time),
 * no el minuto real del partido. A los 70 min de pared el partido puede estar
 * en el minuto 55 real (45 primera parte + 15 descanso + 10 segunda parte).
 *
 * Solución:
 * - 0-48 min transcurridos  → primera parte, mostramos el minuto transcurrido
 * - 48-65 min transcurridos → zona de descanso, mostramos 45 y la barra se para
 * - 65+ min transcurridos   → segunda parte, restamos los ~17 min de descanso
 *
 * Si el status es PAUSED (backend lo confirma), siempre mostramos 45.
 */
function getMatchMinute(utcDate: string, status: MatchStatus): number {
  if (status === 'PAUSED') return 45
  if (status !== 'IN_PLAY') return 0

  const elapsed = Math.floor((Date.now() - new Date(utcDate).getTime()) / 60_000)

  const FIRST_HALF_END = 48 // 45 min + ~3 de añadido
  const HALFTIME_END = 65 // 48 + ~17 min de descanso
  const HALFTIME_LENGTH = 17 // minutos de descanso a descontar

  if (elapsed <= FIRST_HALF_END) {
    // Primera parte
    return Math.max(elapsed, 1)
  }

  if (elapsed <= HALFTIME_END) {
    // Zona de descanso — el backend aún no actualizó el status a PAUSED
    // Mostramos 45 para no saltar al minuto 50/55 de golpe
    return 45
  }

  // Segunda parte — restamos el descanso
  const secondHalfMinute = 45 + (elapsed - HALFTIME_END)
  return Math.min(secondHalfMinute, 90)
}

/**
 * Detecta datos obsoletos: partido marcado IN_PLAY pero han pasado >130 min.
 */
function isStaleMatch(utcDate: string, status: MatchStatus): boolean {
  if (status !== 'IN_PLAY' && status !== 'PAUSED') return false
  return Date.now() - new Date(utcDate).getTime() > 130 * 60 * 1000
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function TeamCrest({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <span className='text-3xl'>⚽</span>
  return (
    <Image
      src={src}
      alt={alt}
      width={36}
      height={36}
      className='object-contain'
      onError={e => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

function ProgressBar({ minute, paused }: { minute: number; paused: boolean }) {
  const pct = Math.min((minute / 90) * 100, 100)
  return (
    <div className='w-full bg-gray-700 rounded-full h-1.5 mt-2 relative overflow-visible'>
      <div
        className={`h-full rounded-full transition-all duration-[30000ms] ease-linear ${paused ? 'bg-yellow-500' : 'bg-green-500'}`}
        style={{ width: `${pct}%` }}
      />
      {/* Punto pulsante solo cuando está en juego, no en descanso */}
      {!paused && (
        <div
          className='absolute top-1/2'
          style={{ left: `${pct}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        >
          <div className='w-3 h-3 rounded-full bg-green-400 animate-ping absolute inset-0 opacity-75' />
          <div className='w-2 h-2 rounded-full bg-green-300 relative' />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Centro de la tarjeta
// ---------------------------------------------------------------------------

function MatchCenter({ match }: { match: Match }) {
  const { status, utcDate, score } = match
  const ft = score?.fullTime
  const isPaused = status === 'PAUSED'

  const [minute, setMinute] = useState(() => getMatchMinute(utcDate, status))

  useEffect(() => {
    if (status !== 'IN_PLAY') return
    const interval = setInterval(() => {
      setMinute(getMatchMinute(utcDate, status))
    }, 30_000)
    return () => clearInterval(interval)
  }, [status, utcDate])

  // Datos obsoletos
  if (isStaleMatch(utcDate, status)) {
    return (
      <div className='flex flex-col items-center gap-1 min-w-[100px]'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? '-'}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? '-'}</span>
        </div>
        <span
          className='text-xs text-gray-600 font-medium'
          title='Actualizando...'
        >
          ↻ sincronizando
        </span>
      </div>
    )
  }

  // En juego o descanso
  if (status === 'IN_PLAY' || isPaused) {
    return (
      <div className='flex flex-col items-center gap-0.5 min-w-[100px]'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? 0}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? 0}</span>
        </div>

        {isPaused ? (
          <span className='text-xs font-semibold text-yellow-400 flex items-center gap-1'>
            <span className='w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block' />
            Descanso
          </span>
        ) : (
          <span className='text-xs font-semibold text-green-400 flex items-center gap-1'>
            <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block' />
            {minute}&apos;
          </span>
        )}

        <ProgressBar
          minute={minute}
          paused={isPaused}
        />
      </div>
    )
  }

  // Terminado
  if (status === 'FINISHED') {
    return (
      <div className='flex flex-col items-center gap-1 min-w-[100px]'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? '-'}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? '-'}</span>
        </div>
        <span className='text-xs text-gray-500 font-medium'>Final</span>
      </div>
    )
  }

  // Aplazado / cancelado / suspendido
  if (['POSTPONED', 'CANCELLED', 'SUSPENDED'].includes(status)) {
    const labels: Record<string, string> = {
      POSTPONED: 'Aplazado',
      CANCELLED: 'Cancelado',
      SUSPENDED: 'Suspendido'
    }
    return (
      <div className='min-w-[100px] text-center'>
        <span className='text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-1 rounded-full'>{labels[status]}</span>
      </div>
    )
  }

  // Programado
  return (
    <div className='flex flex-col items-center gap-1 min-w-[100px]'>
      <span className='text-2xl font-bold text-white tabular-nums'>{formatTime(utcDate)}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function MatchCard({ match }: { match: Match }) {
  const stale = isStaleMatch(match.utcDate, match.status)
  const isLive = (match.status === 'IN_PLAY' || match.status === 'PAUSED') && !stale

  return (
    <div
      className={`
      border rounded-xl p-4 transition-all duration-200
      ${isLive ? 'bg-gray-800 border-green-800 shadow-lg shadow-green-950/50' : ''}
      ${stale ? 'bg-gray-800 border-gray-700 opacity-75' : ''}
      ${!isLive && !stale ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : ''}
    `}
    >
      <div className='flex justify-between items-center mb-3 text-xs text-gray-500'>
        <span>Jornada {match.matchDay}</span>
        <span>{formatDate(match.utcDate)}</span>
      </div>
      <div className='flex items-center gap-3'>
        <div className='flex flex-col items-center gap-1.5 flex-1'>
          <TeamCrest
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
          />
          <span className='text-xs text-gray-300 text-center leading-tight font-medium'>{match.homeTeam.shortName}</span>
        </div>
        <MatchCenter match={match} />
        <div className='flex flex-col items-center gap-1.5 flex-1'>
          <TeamCrest
            src={match.awayTeam.crest}
            alt={match.awayTeam.name}
          />
          <span className='text-xs text-gray-300 text-center leading-tight font-medium'>{match.awayTeam.shortName}</span>
        </div>
      </div>
    </div>
  )
}
