'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Match, MatchStatus } from '@/types'
import type { ChannelKey } from '@/lib/channels'
import ChannelBadge from '@/components/ChannelBadge'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type EffectiveStatus = MatchStatus | 'ESTIMATED_LIVE' | 'ESTIMATED_FINISHED'

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
 * Convierte TIMED/SCHEDULED en un estado estimado según el tiempo transcurrido.
 *
 * El plan gratuito de football-data.org NO actualiza los estados en tiempo real.
 * Estimamos el estado con estas reglas:
 * - < 0 min:    todavía no ha empezado → TIMED
 * - 0-110 min:  estimamos que está en juego → ESTIMATED_LIVE
 * - 110+ min:   estimamos que ha terminado → ESTIMATED_FINISHED
 *
 * Si la API actualiza el estado real (FINISHED, IN_PLAY, etc.),
 * usamos ese dato real en lugar de la estimación.
 */
function getEffectiveStatus(status: MatchStatus, utcDate: string): EffectiveStatus {
  // Si la API ya tiene un estado real actualizado, lo usamos tal cual
  if (status !== 'TIMED' && status !== 'SCHEDULED') return status

  const elapsedMin = (Date.now() - new Date(utcDate).getTime()) / 60_000

  if (elapsedMin < 0) return status // No ha empezado
  if (elapsedMin < 110) return 'ESTIMATED_LIVE' // Estimamos en juego
  return 'ESTIMATED_FINISHED' // Estimamos terminado
}

/**
 * Calcula el minuto aproximado descontando el descanso (~17 min).
 */
function getMatchMinute(utcDate: string, effectiveStatus: EffectiveStatus): number {
  if (effectiveStatus === 'PAUSED') return 45
  if (effectiveStatus !== 'IN_PLAY' && effectiveStatus !== 'ESTIMATED_LIVE') return 0

  const elapsed = Math.floor((Date.now() - new Date(utcDate).getTime()) / 60_000)
  if (elapsed <= 48) return Math.max(elapsed, 1)
  if (elapsed <= 65) return 45
  return Math.min(45 + (elapsed - 65), 90)
}

/**
 * Partido marcado IN_PLAY en BD pero han pasado más de 130 min → datos obsoletos.
 * Solo aplica a partidos que la API SÍ actualizó a IN_PLAY pero no a FINISHED.
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
// Centro de la tarjeta
// ---------------------------------------------------------------------------

function MatchCenter({ match }: { match: Match }) {
  const { status, utcDate, score } = match
  const effectiveStatus = getEffectiveStatus(status, utcDate)
  const ft = score?.fullTime
  const isPaused = effectiveStatus === 'PAUSED'
  const isEstLive = effectiveStatus === 'ESTIMATED_LIVE'
  const isEstFinished = effectiveStatus === 'ESTIMATED_FINISHED'

  const [minute, setMinute] = useState(() => getMatchMinute(utcDate, effectiveStatus))

  useEffect(() => {
    if (effectiveStatus !== 'IN_PLAY' && effectiveStatus !== 'ESTIMATED_LIVE') return
    const interval = setInterval(() => {
      setMinute(getMatchMinute(utcDate, effectiveStatus))
    }, 30_000)
    return () => clearInterval(interval)
  }, [effectiveStatus, utcDate])

  // ── Datos obsoletos (IN_PLAY en BD pero >130 min) ───────────────────────
  if (isStaleMatch(utcDate, status)) {
    return (
      <div className='flex flex-col items-center gap-1 min-w-[90px]'>
        <p className='text-[10px] text-gray-600'>{formatDate(utcDate)}</p>
        <div className='flex items-center gap-1.5'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? '-'}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? '-'}</span>
        </div>
        <span className='text-[10px] text-gray-600'>↻ actualizando</span>
      </div>
    )
  }

  // ── En juego real (API lo confirmó) ─────────────────────────────────────
  if (effectiveStatus === 'IN_PLAY' || isPaused) {
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

  // ── Terminado real (API lo confirmó) ────────────────────────────────────
  if (effectiveStatus === 'FINISHED') {
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

  // ── En juego ESTIMADO (API no actualizó, lo deducimos por la hora) ───────
  if (isEstLive) {
    return (
      <div className='flex flex-col items-center gap-0.5 min-w-[90px]'>
        <div className='flex items-center gap-1.5'>
          <span className='text-2xl font-black text-gray-400 tabular-nums'>-</span>
          <span className='text-gray-600'>-</span>
          <span className='text-2xl font-black text-gray-400 tabular-nums'>-</span>
        </div>
        <span className='text-[11px] font-semibold text-green-400/80 flex items-center gap-1'>
          <span className='w-1.5 h-1.5 rounded-full bg-green-400/80 animate-pulse inline-block' />~{minute}&apos;
        </span>
        <ProgressBar
          minute={minute}
          paused={false}
        />
      </div>
    )
  }

  // ── Terminado ESTIMADO (han pasado >110 min, la API no actualizó) ────────
  if (isEstFinished) {
    return (
      <div className='flex flex-col items-center gap-1 min-w-[90px]'>
        <p className='text-[10px] text-gray-600'>{formatDate(utcDate)}</p>
        <div className='flex items-center gap-1.5'>
          <span className='text-2xl font-black text-gray-500 tabular-nums'>-</span>
          <span className='text-gray-600'>-</span>
          <span className='text-2xl font-black text-gray-500 tabular-nums'>-</span>
        </div>
        {/* Indicamos que es aproximado para ser honestos con el usuario */}
        <span className='text-[11px] text-gray-600 font-medium'>~Final</span>
      </div>
    )
  }

  // ── Aplazado / cancelado ─────────────────────────────────────────────────
  if (['POSTPONED', 'CANCELLED', 'SUSPENDED'].includes(effectiveStatus as string)) {
    const labels: Record<string, string> = {
      POSTPONED: 'Aplazado',
      CANCELLED: 'Cancelado',
      SUSPENDED: 'Suspendido'
    }
    return (
      <div className='min-w-[90px] text-center'>
        <p className='text-[10px] text-gray-600 mb-1'>{formatDate(utcDate)}</p>
        <span className='text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full'>{labels[effectiveStatus as string]}</span>
      </div>
    )
  }

  // ── Programado → fecha + hora ────────────────────────────────────────────
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
  const effectiveStatus = getEffectiveStatus(match.status, match.utcDate)
  const stale = isStaleMatch(match.utcDate, match.status)
  const isLive = !stale && (effectiveStatus === 'IN_PLAY' || effectiveStatus === 'PAUSED' || effectiveStatus === 'ESTIMATED_LIVE')

  return (
    <div
      className={`
      border rounded-xl p-3 transition-all duration-200
      ${isLive && effectiveStatus !== 'ESTIMATED_LIVE' ? 'bg-gray-800 border-green-800 shadow-lg shadow-green-950/50' : ''}
      ${isLive && effectiveStatus === 'ESTIMATED_LIVE' ? 'bg-gray-800 border-green-900/50 shadow-md shadow-green-950/30' : ''}
      ${!isLive ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : ''}
    `}
    >
      <p className='text-[10px] text-gray-600 mb-2.5'>Jornada {match.matchDay}</p>

      <div className='flex items-center gap-2'>
        {/* Equipo local */}
        <div className='flex flex-col items-center gap-1 flex-1 min-w-0'>
          <TeamCrest
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
          />
          <span className='text-[11px] text-gray-300 text-center leading-tight font-medium truncate w-full'>{match.homeTeam.shortName}</span>
        </div>

        {/* Marcador / hora */}
        <MatchCenter match={match} />

        {/* Equipo visitante */}
        <div className='flex flex-col items-center gap-1 flex-1 min-w-0'>
          <TeamCrest
            src={match.awayTeam.crest}
            alt={match.awayTeam.name}
          />
          <span className='text-[11px] text-gray-300 text-center leading-tight font-medium truncate w-full'>{match.awayTeam.shortName}</span>
        </div>

        {/* Canal — 90% del alto de la card, centrado verticalmente */}
        <div className='self-stretch flex items-center pl-2 border-l border-gray-700/50'>
          {channel ? <ChannelBadge channel={channel} /> : <div className='w-12' />}
        </div>
      </div>
    </div>
  )
}
