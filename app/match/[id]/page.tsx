export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { MatchDetailDTO } from '@/types/detail'

// Importamos el tipo desde el backend via la API
async function getMatchDetail(id: string): Promise<MatchDetailDTO | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/match/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/** Abrevia la posición inglesa a español */
function positionLabel(position: string | null): string {
  if (!position) return ''
  const map: Record<string, string> = {
    'Goalkeeper': 'POR',
    'Centre-Back': 'DFC',
    'Right Back': 'LD',
    'Left Back': 'LI',
    'Defensive Midfield': 'MCD',
    'Central Midfield': 'MC',
    'Attacking Midfield': 'MCO',
    'Right Midfield': 'MD',
    'Left Midfield': 'MI',
    'Right Winger': 'ED',
    'Left Winger': 'EI',
    'Centre-Forward': 'DC'
  }
  return (
    map[position] ??
    position
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
  )
}

function formatDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })
}

/** Badge de estado del partido */
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; className: string }> = {
    IN_PLAY: { label: '● En juego', className: 'text-green-400 bg-green-900/40 border-green-800' },
    LIVE: { label: '● En juego', className: 'text-green-400 bg-green-900/40 border-green-800' },
    PAUSED: { label: 'Descanso', className: 'text-yellow-400 bg-yellow-900/30 border-yellow-800' },
    FINISHED: { label: 'Finalizado', className: 'text-gray-400 bg-gray-800 border-gray-700' },
    TIMED: { label: 'Programado', className: 'text-blue-400 bg-blue-900/30 border-blue-800' },
    SCHEDULED: { label: 'Programado', className: 'text-blue-400 bg-blue-900/30 border-blue-800' },
    POSTPONED: { label: 'Aplazado', className: 'text-red-400 bg-red-900/30 border-red-800' }
  }
  const c = cfg[status] ?? cfg['TIMED']
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.className}`}>{c.label}</span>
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = await getMatchDetail(id)

  if (!match) notFound()

  const ft = match.score?.fullTime
  const ht = match.score?.halfTime
  const isLive = match.status === 'IN_PLAY' || match.status === 'LIVE' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const hasScore = ft?.home != null || ft?.away != null

  // Separamos las alineaciones por equipo
  const homeLineup = match.lineups?.find(l => l.team.id === match.homeTeam.id)
  const awayLineup = match.lineups?.find(l => l.team.id === match.awayTeam.id)
  const hasLineups = (homeLineup?.startXI?.length ?? 0) > 0 || (awayLineup?.startXI?.length ?? 0) > 0

  return (
    <div className='space-y-5 max-w-2xl mx-auto'>
      {/* ── Botón volver ──────────────────────────────────────────────── */}
      <Link
        href='/'
        className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors'
      >
        ← Volver a partidos
      </Link>

      {/* ── Cabecera del partido ───────────────────────────────────────── */}
      <div className='bg-gray-800 border border-gray-700 rounded-2xl p-6'>
        {/* Fecha + estado */}
        <div className='flex flex-col items-center gap-2 mb-6'>
          <p className='text-xs text-gray-500 capitalize'>{formatDate(match.utcDate)}</p>
          <StatusBadge status={match.status} />
        </div>

        {/* Equipos + marcador */}
        <div className='flex items-center justify-between gap-2'>
          {/* Local */}
          <div className='flex flex-col items-center gap-2 flex-1'>
            {match.homeTeam.crest && (
              <Image
                src={match.homeTeam.crest}
                alt={match.homeTeam.name}
                width={56}
                height={56}
                className='object-contain'
              />
            )}
            <p className='text-sm font-semibold text-white text-center leading-tight'>{match.homeTeam.shortName}</p>
          </div>

          {/* Marcador */}
          <div className='flex flex-col items-center gap-1 min-w-[100px]'>
            {hasScore ? (
              <>
                <div className='flex items-center gap-3'>
                  <span className='text-4xl font-black text-white tabular-nums'>{ft?.home}</span>
                  <span className='text-2xl text-gray-600'>-</span>
                  <span className='text-4xl font-black text-white tabular-nums'>{ft?.away}</span>
                </div>
                {/* Marcador del descanso si está disponible */}
                {ht?.home != null && ht?.away != null && (
                  <p className='text-xs text-gray-600'>
                    ({ht.home} - {ht.away}) descanso
                  </p>
                )}
                {isFinished && <p className='text-xs text-gray-500 font-medium mt-1'>Final</p>}
              </>
            ) : (
              <div className='flex items-center gap-2'>
                <span className='text-4xl font-black text-gray-600 tabular-nums'>-</span>
                <span className='text-2xl text-gray-700'>-</span>
                <span className='text-4xl font-black text-gray-600 tabular-nums'>-</span>
              </div>
            )}
          </div>

          {/* Visitante */}
          <div className='flex flex-col items-center gap-2 flex-1'>
            {match.awayTeam.crest && (
              <Image
                src={match.awayTeam.crest}
                alt={match.awayTeam.name}
                width={56}
                height={56}
                className='object-contain'
              />
            )}
            <p className='text-sm font-semibold text-white text-center leading-tight'>{match.awayTeam.shortName}</p>
          </div>
        </div>

        {/* Jornada */}
        {match.matchDay && <p className='text-center text-xs text-gray-600 mt-4'>Jornada {match.matchDay}</p>}
      </div>

      {/* ── Alineaciones ────────────────────────────────────────────────── */}
      {hasLineups ? (
        <div className='bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-5'>
          {/* Formaciones */}
          {(homeLineup?.formation || awayLineup?.formation) && (
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span className='font-mono bg-gray-700 px-2 py-0.5 rounded'>{homeLineup?.formation ?? '—'}</span>
              <span className='text-gray-600 font-semibold'>Formación</span>
              <span className='font-mono bg-gray-700 px-2 py-0.5 rounded'>{awayLineup?.formation ?? '—'}</span>
            </div>
          )}

          {/* Titulares */}
          <div>
            <h2 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>Once inicial</h2>

            <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
              {/* Columna local */}
              <div className='space-y-2'>
                {homeLineup?.startXI?.map(({ player }) => (
                  <div
                    key={player.id}
                    className='flex items-center gap-2'
                  >
                    <span className='text-[10px] text-gray-600 w-4 text-right tabular-nums shrink-0'>{player.shirtNumber}</span>
                    <span className='text-xs text-gray-300 truncate flex-1'>{player.name}</span>
                    {player.position && (
                      <span className='text-[9px] text-gray-600 bg-gray-700 px-1 py-0.5 rounded shrink-0'>{positionLabel(player.position)}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Columna visitante */}
              <div className='space-y-2'>
                {awayLineup?.startXI?.map(({ player }) => (
                  <div
                    key={player.id}
                    className='flex items-center gap-2'
                  >
                    <span className='text-[10px] text-gray-600 w-4 text-right tabular-nums shrink-0'>{player.shirtNumber}</span>
                    <span className='text-xs text-gray-300 truncate flex-1'>{player.name}</span>
                    {player.position && (
                      <span className='text-[9px] text-gray-600 bg-gray-700 px-1 py-0.5 rounded shrink-0'>{positionLabel(player.position)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suplentes */}
          {((homeLineup?.substitutes?.length ?? 0) > 0 || (awayLineup?.substitutes?.length ?? 0) > 0) && (
            <div>
              <h2 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pt-3 border-t border-gray-700'>Suplentes</h2>
              <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                <div className='space-y-1.5'>
                  {homeLineup?.substitutes?.map(({ player }) => (
                    <div
                      key={player.id}
                      className='flex items-center gap-2'
                    >
                      <span className='text-[10px] text-gray-700 w-4 text-right tabular-nums shrink-0'>{player.shirtNumber}</span>
                      <span className='text-xs text-gray-500 truncate flex-1'>{player.name}</span>
                    </div>
                  ))}
                </div>
                <div className='space-y-1.5'>
                  {awayLineup?.substitutes?.map(({ player }) => (
                    <div
                      key={player.id}
                      className='flex items-center gap-2'
                    >
                      <span className='text-[10px] text-gray-700 w-4 text-right tabular-nums shrink-0'>{player.shirtNumber}</span>
                      <span className='text-xs text-gray-500 truncate flex-1'>{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sin alineaciones disponibles */
        <div className='bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center'>
          <p className='text-3xl mb-3'>📋</p>
          <p className='text-sm font-medium text-gray-400'>
            {isLive
              ? 'Cargando alineaciones...'
              : isFinished
                ? 'Alineaciones no disponibles'
                : 'Las alineaciones se publicarán cuando empiece el partido'}
          </p>
        </div>
      )}
    </div>
  )
}
