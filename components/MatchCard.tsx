'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Match, MatchStatus } from '@/types'
import type { ChannelKey } from '@/lib/channels'
import ChannelBadge from '@/components/ChannelBadge'

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

/** Fecha corta: "sáb. 15 ago." */
function formatDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Madrid'
  })
}

function getMatchMinute(utcDate: string, status: MatchStatus): number {
  if (status === 'PAUSED') return 45
  if (status !== 'IN_PLAY') return 0

  const elapsed = Math.floor((Date.now() - new Date(utcDate).getTime()) / 60_000)
  if (elapsed <= 48) return Math.max(elapsed, 1)
  if (elapsed <= 65) return 45
  return Math.min(45 + (elapsed - 65), 90)
}

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
    <div className='w-full bg-gray-700 rounded-full h-1.5 mt-1.5 relative overflow-visible'>
      <div
        className={`h-full rounded-full transition-all duration-[30000ms] ease-linear
          ${paused ? 'bg-yellow-500' : 'bg-green-500'}`}
        style={{ width: `${pct}%` }}
      />
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
// Centro: hora/marcador/estado — ahora con fecha encima de la hora
// ---------------------------------------------------------------------------

function MatchCenter({ match }: { match: Match }) {
  const { status, utcDate, score } = match
  const ft = score?.fullTime
  const isPaused = status === 'PAUSED'

  const [minute, setMinute] = useState(() => getMatchMinute(utcDate, status))

  useEffect(() => {
    if (status !== 'IN_PLAY') return
    const interval = setInterval(() => setMinute(getMatchMinute(utcDate, status)), 30_000)
    return () => clearInterval(interval)
  }, [status, utcDate])

  // Datos obsoletos
  if (isStaleMatch(utcDate, status)) {
    return (
      <div className='flex flex-col items-center gap-1 min-w-[90px]'>
        <p className='text-[10px] text-gray-600'>{formatDate(utcDate)}</p>
        <div className='flex items-center gap-1.5'>
          <span className='text-xl font-black text-white tabular-nums'>{ft?.home ?? '-'}</span>
          <span className='text-gray-500 text-sm'>-</span>
          <span className='text-xl font-black text-white tabular-nums'>{ft?.away ?? '-'}</span>
        </div>
        <span className='text-[10px] text-gray-600'>↻ sincronizando</span>
      </div>
    )
  }

  // En juego / descanso
  if (status === 'IN_PLAY' || isPaused) {
    return (
      <div className='flex flex-col items-center gap-0.5 min-w-[90px]'>
        <div className='flex items-center gap-1.5'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? 0}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? 0}</span>
        </div>
        {isPaused ? (
          <span className='text-[11px] font-semibold text-yellow-400'>⏸ Descanso</span>
        ) : (
          <span className='text-[11px] font-semibold text-green-400 flex items-center gap-1'>
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
      <div className='flex flex-col items-center gap-1 min-w-[90px]'>
        <p className='text-[10px] text-gray-600'>{formatDate(utcDate)}</p>
        <div className='flex items-center gap-1.5'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? '-'}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? '-'}</span>
        </div>
        <span className='text-[11px] text-gray-500 font-medium'>Final</span>
      </div>
    )
  }

  // Aplazado / cancelado
  if (['POSTPONED', 'CANCELLED', 'SUSPENDED'].includes(status)) {
    const labels: Record<string, string> = {
      POSTPONED: 'Aplazado',
      CANCELLED: 'Cancelado',
      SUSPENDED: 'Suspendido'
    }
    return (
      <div className='min-w-[90px] text-center'>
        <p className='text-[10px] text-gray-600 mb-1'>{formatDate(utcDate)}</p>
        <span className='text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full'>{labels[status]}</span>
      </div>
    )
  }

  // Programado — fecha encima de la hora
  return (
    <div className='flex flex-col items-center gap-0.5 min-w-[90px]'>
      <p className='text-[10px] text-gray-500 font-medium'>{formatDate(utcDate)}</p>
      <span className='text-2xl font-bold text-white tabular-nums'>{formatTime(utcDate)}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

interface MatchCardProps {
  match: Match
  channel?: ChannelKey | null
}

export default function MatchCard({ match, channel }: MatchCardProps) {
  const stale = isStaleMatch(match.utcDate, match.status)
  const isLive = (match.status === 'IN_PLAY' || match.status === 'PAUSED') && !stale

  return (
    <div
      className={`
      border rounded-xl p-3 transition-all duration-200
      ${isLive ? 'bg-gray-800 border-green-800 shadow-lg shadow-green-950/50' : ''}
      ${stale ? 'bg-gray-800 border-gray-700 opacity-70' : ''}
      ${!isLive && !stale ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : ''}
    `}
    >
      {/* Solo la jornada arriba — la fecha se mueve al centro */}
      <p className='text-[10px] text-gray-600 mb-2.5'>Jornada {match.matchDay}</p>

      {/* Fila principal: equipo local — centro — equipo visitante — [canal] */}
      <div className='flex items-center gap-2'>
        {/* Equipo local */}
        <div className='flex flex-col items-center gap-1 flex-1 min-w-0'>
          <TeamCrest
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
          />
          <span className='text-[11px] text-gray-300 text-center leading-tight font-medium truncate w-full text-center'>
            {match.homeTeam.shortName}
          </span>
        </div>

        {/* Centro: fecha + hora/marcador/estado */}
        <MatchCenter match={match} />

        {/* Equipo visitante */}
        <div className='flex flex-col items-center gap-1 flex-1 min-w-0'>
          <TeamCrest
            src={match.awayTeam.crest}
            alt={match.awayTeam.name}
          />
          <span className='text-[11px] text-gray-300 text-center leading-tight font-medium truncate w-full text-center'>
            {match.awayTeam.shortName}
          </span>
        </div>

        {/*
          Canal de TV — columna derecha, ocupa la mitad del alto de la card.
          Solo visible si se asignó canal.
        */}
        {channel ? (
          <div className='flex flex-col items-center justify-center self-stretch pl-2 border-l border-gray-700/60 min-w-[36px]'>
            <ChannelBadge
              channel={channel}
              size='sm'
            />
          </div>
        ) : (
          // Espacio reservado para mantener el layout consistente
          <div className='min-w-[36px]' />
        )}
      </div>
    </div>
  )
}
