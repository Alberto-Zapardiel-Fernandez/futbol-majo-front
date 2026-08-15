/**
 * Tarjeta visual de un partido con marcador en tiempo real.
 *
 * Es un Client Component porque:
 * 1. Usa onError en <Image> (event handler).
 * 2. Usa useState + useEffect para actualizar el minuto cada 30 segundos
 *    sin necesidad de recargar la página.
 */

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
 * Calcula el minuto aproximado de un partido en juego.
 *
 * La API gratuita no devuelve el minuto exacto del partido, así que lo
 * estimamos a partir de la hora de inicio (utcDate) y el tiempo transcurrido.
 * Limitamos el resultado entre 1 y 90 minutos.
 */
function getElapsedMinutes(utcDate: string, status: MatchStatus): number {
  if (status === 'PAUSED') return 45
  if (status !== 'IN_PLAY') return 0

  const kickoff = new Date(utcDate).getTime()
  const elapsed = Math.floor((Date.now() - kickoff) / 60_000)
  return Math.min(Math.max(elapsed, 1), 90)
}

// ---------------------------------------------------------------------------
// Sub-componente: escudo
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

// ---------------------------------------------------------------------------
// Sub-componente: barra de progreso animada
// ---------------------------------------------------------------------------

/**
 * Barra verde que muestra el avance del partido.
 *
 * - La longitud representa el minuto actual (1-90).
 * - En el extremo derecho hay un punto con efecto "ping" (onda expansiva)
 *   que da sensación de dinamismo aunque la página no se recargue.
 * - El minuto se actualiza automáticamente desde el componente padre.
 */
function ProgressBar({ minute }: { minute: number }) {
  const pct = Math.min((minute / 90) * 100, 100)

  return (
    <div className='w-full bg-gray-700 rounded-full h-1.5 mt-2 relative'>
      {/* Barra rellena */}
      <div
        className='h-full rounded-full bg-green-500 transition-all duration-30000 ease-linear'
        style={{ width: `${pct}%` }}
      />

      {/*
        Punto pulsante en el extremo de la barra.
        - animate-ping: crea una onda expansiva que parece un sonar/radar.
          Es el efecto visual más efectivo para indicar "en vivo" en apps móviles.
        - El div exterior posiciona el punto en el extremo de la barra.
        - overflow-visible en el padre permite que la onda se expanda fuera.
      */}
      <div
        className='absolute top-1/2 -translate-y-1/2'
        style={{ left: `${pct}%`, transform: `translateX(-50%) translateY(-50%)` }}
      >
        {/* Onda expansiva */}
        <div className='w-3 h-3 rounded-full bg-green-400 animate-ping absolute inset-0 opacity-75' />
        {/* Punto sólido encima */}
        <div className='w-2 h-2 rounded-full bg-green-300 relative' />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: centro de la tarjeta (hora, marcador o estado)
// ---------------------------------------------------------------------------

function MatchCenter({ match }: { match: Match }) {
  const { status, utcDate, score } = match
  const ft = score?.fullTime

  /*
    useState + useEffect para actualizar el minuto en tiempo real.
    
    - El estado inicial se calcula una sola vez al montar el componente.
    - El setInterval actualiza el minuto cada 30 segundos.
    - El cleanup (return) cancela el intervalo cuando el componente se desmonta,
      evitando memory leaks.
    
    Resultado: el minuto se mueve solo, sin recargar la página.
  */
  const [minute, setMinute] = useState(() => getElapsedMinutes(utcDate, status))

  useEffect(() => {
    if (status !== 'IN_PLAY') return

    const interval = setInterval(() => {
      setMinute(getElapsedMinutes(utcDate, status))
    }, 30_000) // Actualiza cada 30 segundos

    return () => clearInterval(interval)
  }, [status, utcDate])

  // ── En juego o descanso ──────────────────────────────────────────────────
  if (status === 'IN_PLAY' || status === 'PAUSED') {
    return (
      <div className='flex flex-col items-center gap-0.5 min-w-25'>
        {/* Marcador */}
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? 0}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? 0}</span>
        </div>

        {/* Minuto o "Descanso" */}
        {status === 'PAUSED' ? (
          <span className='text-xs font-semibold text-yellow-400'>Descanso</span>
        ) : (
          <span className='text-xs font-semibold text-green-400 flex items-center gap-1'>
            <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block' />
            {minute}&apos;
          </span>
        )}

        {/* Barra de progreso con punto pulsante */}
        <ProgressBar minute={minute} />
      </div>
    )
  }

  // ── Terminado ────────────────────────────────────────────────────────────
  if (status === 'FINISHED') {
    return (
      <div className='flex flex-col items-center gap-1 min-w-25'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.home ?? '-'}</span>
          <span className='text-gray-500'>-</span>
          <span className='text-2xl font-black text-white tabular-nums'>{ft?.away ?? '-'}</span>
        </div>
        <span className='text-xs text-gray-500 font-medium'>Final</span>
      </div>
    )
  }

  // ── Aplazado / cancelado / suspendido ────────────────────────────────────
  if (['POSTPONED', 'CANCELLED', 'SUSPENDED'].includes(status)) {
    const labels: Record<string, string> = {
      POSTPONED: 'Aplazado',
      CANCELLED: 'Cancelado',
      SUSPENDED: 'Suspendido'
    }
    return (
      <div className='min-w-25 text-center'>
        <span className='text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-1 rounded-full'>{labels[status]}</span>
      </div>
    )
  }

  // ── Programado → hora ────────────────────────────────────────────────────
  return (
    <div className='flex flex-col items-center gap-1 min-w-25'>
      <span className='text-2xl font-bold text-white tabular-nums'>{formatTime(utcDate)}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'

  return (
    <div
      className={`
      border rounded-xl p-4 transition-all duration-200
      ${isLive ? 'bg-gray-800 border-green-800 shadow-lg shadow-green-950/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}
    `}
    >
      {/* Cabecera */}
      <div className='flex justify-between items-center mb-3 text-xs text-gray-500'>
        <span>Jornada {match.matchDay}</span>
        <span>{formatDate(match.utcDate)}</span>
      </div>

      {/* Equipos + marcador */}
      <div className='flex items-center gap-3'>
        {/* Local */}
        <div className='flex flex-col items-center gap-1.5 flex-1'>
          <TeamCrest
            src={match.homeTeam.crest}
            alt={match.homeTeam.name}
          />
          <span className='text-xs text-gray-300 text-center leading-tight font-medium'>{match.homeTeam.shortName}</span>
        </div>

        {/* Centro */}
        <MatchCenter match={match} />

        {/* Visitante */}
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
