export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { MatchDetailDTO, TeamDetail } from '@/types/detail'

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function getMatchDetail(id: string): Promise<MatchDetailDTO | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/match/${id}`, {
      cache: 'no-store'
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getTeamDetail(teamId: number): Promise<TeamDetail | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/${teamId}`, {
      next: { revalidate: 3_600 }
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Utilidades de posición
// ---------------------------------------------------------------------------

const POSITION_MAP: Record<string, string> = {
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
  'Centre-Forward': 'DC',
  'Offence': 'DEL',
  'Midfield': 'MC',
  'Defence': 'DEF'
}

const POSITION_ORDER = [
  'Goalkeeper',
  'Centre-Back',
  'Right Back',
  'Left Back',
  'Defensive Midfield',
  'Central Midfield',
  'Attacking Midfield',
  'Right Midfield',
  'Left Midfield',
  'Right Winger',
  'Left Winger',
  'Centre-Forward'
]

function posLabel(pos: string | null): string {
  if (!pos) return ''
  return (
    POSITION_MAP[pos] ??
    pos
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
  )
}

function sortSquad(squad: TeamDetail['squad']) {
  return [...squad].sort((a, b) => {
    const ia = POSITION_ORDER.indexOf(a.position ?? '')
    const ib = POSITION_ORDER.indexOf(b.position ?? '')
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

// ---------------------------------------------------------------------------
// Colores de camiseta
// ---------------------------------------------------------------------------

const COLOR_CSS: Record<string, string> = {
  'Red': '#dc2626',
  'Blue': '#2563eb',
  'White': '#f1f5f9',
  'Black': '#1f2937',
  'Yellow': '#fbbf24',
  'Green': '#16a34a',
  'Orange': '#f97316',
  'Purple': '#7c3aed',
  'Grey': '#6b7280',
  'Gray': '#6b7280',
  'Gold': '#d97706',
  'Navy Blue': '#1e3a8a',
  'Navy': '#1e3a8a',
  'Dark Blue': '#1e40af',
  'Light Blue': '#38bdf8',
  'Maroon': '#7f1d1d',
  'Pink': '#ec4899',
  'Brown': '#92400e'
}

function parseClubColors(clubColors: string | null): [string, string] {
  if (!clubColors) return ['#4b5563', '#4b5563']
  const parts = clubColors.split('/').map(s => s.trim())
  const primary = COLOR_CSS[parts[0]] ?? '#4b5563'
  const secondary = parts[1] ? (COLOR_CSS[parts[1]] ?? primary) : primary
  return [primary, secondary]
}

/**
 * Camiseta SVG con los colores del equipo.
 * Primaria = cuerpo, secundaria = cuello/mangas.
 */
function Shirt({ primary, secondary, size = 28 }: { primary: string; secondary: string; size?: number }) {
  return (
    <svg
      viewBox='0 0 40 34'
      width={size}
      height={Math.round(size * 0.85)}
      aria-hidden='true'
    >
      {/* Cuerpo */}
      <path
        d='M13,3 L2,13 L8,15 L7,31 L33,31 L32,15 L38,13 L27,3 C24,7 16,7 13,3 Z'
        fill={primary}
        stroke='rgba(0,0,0,0.15)'
        strokeWidth='1'
      />
      {/* Cuello y mangas en color secundario */}
      <path
        d='M13,3 C16,7 24,7 27,3'
        fill='none'
        stroke={secondary}
        strokeWidth='2.5'
        strokeLinecap='round'
      />
      <path
        d='M2,13 L8,15'
        stroke={secondary}
        strokeWidth='2'
        strokeLinecap='round'
        fill='none'
      />
      <path
        d='M38,13 L32,15'
        stroke={secondary}
        strokeWidth='2'
        strokeLinecap='round'
        fill='none'
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Badge de estado
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    IN_PLAY: { label: '● En juego', cls: 'text-green-400 bg-green-900/40 border-green-800' },
    LIVE: { label: '● En juego', cls: 'text-green-400 bg-green-900/40 border-green-800' },
    PAUSED: { label: 'Descanso', cls: 'text-yellow-400 bg-yellow-900/30 border-yellow-800' },
    FINISHED: { label: 'Finalizado', cls: 'text-gray-400 bg-gray-800 border-gray-700' },
    TIMED: { label: 'Programado', cls: 'text-blue-400 bg-blue-900/30 border-blue-800' },
    SCHEDULED: { label: 'Programado', cls: 'text-blue-400 bg-blue-900/30 border-blue-800' },
    POSTPONED: { label: 'Aplazado', cls: 'text-red-400 bg-red-900/30 border-red-800' }
  }
  const c = cfg[status] ?? cfg['TIMED']
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.cls}`}>{c.label}</span>
}

// ---------------------------------------------------------------------------
// Componente: columna de plantilla de un equipo
// ---------------------------------------------------------------------------

function SquadColumn({
  team,
  colors,
  squad,
  align
}: {
  team: { shortName: string; crest: string }
  colors: [string, string]
  squad: TeamDetail['squad']
  align: 'left' | 'right'
}) {
  const sorted = sortSquad(squad)
  const isRight = align === 'right'

  return (
    <div className={`flex flex-col gap-0.5 ${isRight ? 'items-end' : 'items-start'}`}>
      {/* Cabecera del equipo */}
      <div className={`flex items-center gap-2 mb-3 ${isRight ? 'flex-row-reverse' : ''}`}>
        {team.crest && (
          <Image
            src={team.crest}
            alt={team.shortName}
            width={22}
            height={22}
            className='object-contain shrink-0'
          />
        )}
        <span className='text-sm font-bold text-white truncate max-w-[110px]'>{team.shortName}</span>
        <Shirt
          primary={colors[0]}
          secondary={colors[1]}
          size={22}
        />
      </div>

      {/* Lista de jugadores */}
      {sorted.map(player => (
        <div
          key={player.id}
          className={`flex items-center gap-1.5 w-full ${isRight ? 'flex-row-reverse' : ''}`}
        >
          {/* Dorsal */}
          <span className='text-[10px] text-gray-600 tabular-nums w-5 text-center shrink-0'>{player.shirtNumber ?? '—'}</span>

          {/* Nombre */}
          <span className={`text-xs text-gray-300 truncate flex-1 ${isRight ? 'text-right' : 'text-left'}`}>{player.name.split(' ').pop()}</span>

          {/* Posición */}
          {player.position && <PosBadge position={player.position} />}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

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
/** Badge de posición con color según el rol del jugador */
function PosBadge({ position }: { position: string | null }) {
  if (!position) return null

  const label = posLabel(position)

  const colorClass =
    position === 'Goalkeeper'
      ? 'bg-green-700/90 text-green-100'
      : position.includes('Back') || position === 'Defence'
        ? 'bg-purple-700/90 text-purple-100'
        : position.includes('Midfield') || position === 'Midfield'
          ? 'bg-blue-700/90 text-blue-100'
          : 'bg-red-700/90 text-red-100' // Forwards y extremos

  return <span className={`text-[9px] px-1 py-0.5 rounded shrink-0 font-mono font-bold ${colorClass}`}>{label}</span>
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Cargamos match + ambos equipos en paralelo
  const [match, homeTeam, awayTeam] = await Promise.all([
    getMatchDetail(id),
    // Los IDs de equipo los necesitamos del match, así que esperamos al match
    getMatchDetail(id).then(m => (m ? getTeamDetail(m.homeTeam.id) : null)),
    getMatchDetail(id).then(m => (m ? getTeamDetail(m.awayTeam.id) : null))
  ])

  if (!match) notFound()

  const ft = match.score?.fullTime
  const ht = match.score?.halfTime
  const hasScore = ft?.home != null || ft?.away != null
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'IN_PLAY' || match.status === 'LIVE' || match.status === 'PAUSED'

  // Alineaciones reales de la API (si las hay)
  const homeLineup = match.lineups?.find(l => l.team.id === match.homeTeam.id)
  const awayLineup = match.lineups?.find(l => l.team.id === match.awayTeam.id)
  const hasLineups = (homeLineup?.startXI?.length ?? 0) > 0

  // Colores de las camisetas
  const homeColors = parseClubColors(homeTeam?.clubColors ?? null)
  const awayColors = parseClubColors(awayTeam?.clubColors ?? null)

  return (
    <div className='space-y-4 max-w-2xl mx-auto'>
      {/* Volver */}
      <Link
        href='/'
        className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors'
      >
        ← Volver
      </Link>

      {/* ── Cabecera del partido ──────────────────────────────────────── */}
      <div className='bg-gray-800 border border-gray-700 rounded-2xl p-5'>
        {/* Fecha + estado */}
        <div className='flex flex-col items-center gap-2 mb-5'>
          <p className='text-xs text-gray-500 capitalize text-center'>{formatDate(match.utcDate)}</p>
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
                width={52}
                height={52}
                className='object-contain'
              />
            )}
            <Shirt
              primary={homeColors[0]}
              secondary={homeColors[1]}
              size={24}
            />
            <p className='text-sm font-bold text-white text-center leading-tight'>{match.homeTeam.shortName}</p>
          </div>

          {/* Marcador central */}
          <div className='flex flex-col items-center gap-1'>
            {hasScore ? (
              <>
                <div className='flex items-center gap-3'>
                  <span className='text-4xl font-black text-white tabular-nums'>{ft?.home}</span>
                  <span className='text-2xl text-gray-600'>-</span>
                  <span className='text-4xl font-black text-white tabular-nums'>{ft?.away}</span>
                </div>
                {ht?.home != null && (
                  <p className='text-xs text-gray-600'>
                    ({ht.home} - {ht.away}) desc.
                  </p>
                )}
                {isFinished && <p className='text-xs text-gray-500 font-medium'>Final</p>}
              </>
            ) : (
              <div className='flex items-center gap-3'>
                <span className='text-4xl font-black text-gray-600'>-</span>
                <span className='text-2xl text-gray-700'>-</span>
                <span className='text-4xl font-black text-gray-600'>-</span>
              </div>
            )}
          </div>

          {/* Visitante */}
          <div className='flex flex-col items-center gap-2 flex-1'>
            {match.awayTeam.crest && (
              <Image
                src={match.awayTeam.crest}
                alt={match.awayTeam.name}
                width={52}
                height={52}
                className='object-contain'
              />
            )}
            <Shirt
              primary={awayColors[0]}
              secondary={awayColors[1]}
              size={24}
            />
            <p className='text-sm font-bold text-white text-center leading-tight'>{match.awayTeam.shortName}</p>
          </div>
        </div>

        {/* Estadio + jornada */}
        <div className='mt-4 pt-4 border-t border-gray-700/60 flex items-center justify-center gap-4 text-xs text-gray-500'>
          {homeTeam?.venue && <span className='flex items-center gap-1'>🏟️ {homeTeam.venue}</span>}
          {match.matchDay && <span>Jornada {match.matchDay}</span>}
        </div>
      </div>

      {/* ── Alineaciones o Plantillas ─────────────────────────────────── */}
      <div className='bg-gray-800 border border-gray-700 rounded-2xl p-5'>
        {/* Cabecera de sección */}
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>{hasLineups ? 'Alineación titular' : 'Plantillas'}</h2>
          {!hasLineups && (
            <span className='text-[10px] text-gray-600 bg-gray-700 px-2 py-0.5 rounded-full'>
              {isLive ? 'Alineación no confirmada' : isFinished ? 'Plantilla de la temporada' : 'Disponible al inicio del partido'}
            </span>
          )}
        </div>

        {/* Formaciones si las hay */}
        {hasLineups && (homeLineup?.formation || awayLineup?.formation) && (
          <div className='flex items-center justify-between text-xs text-gray-500 mb-4 pb-3 border-b border-gray-700/50'>
            <span className='font-mono bg-gray-700 px-2 py-0.5 rounded'>{homeLineup?.formation ?? '—'}</span>
            <span className='text-gray-600'>Formación</span>
            <span className='font-mono bg-gray-700 px-2 py-0.5 rounded'>{awayLineup?.formation ?? '—'}</span>
          </div>
        )}

        {/* Dos columnas: local | visitante */}
        <div className='grid grid-cols-2 gap-4'>
          {/* Local */}
          {hasLineups ? (
            /* Alineación real de la API */
            <div className='flex flex-col gap-0.5'>
              <div className='flex items-center gap-2 mb-3'>
                <Shirt
                  primary={homeColors[0]}
                  secondary={homeColors[1]}
                  size={22}
                />
                <span className='text-sm font-bold text-white'>{match.homeTeam.shortName}</span>
              </div>
              {homeLineup?.startXI?.map(({ player }) => (
                <div
                  key={player.id}
                  className='flex items-center gap-1.5'
                >
                  <span className='text-[10px] text-gray-600 w-5 text-center tabular-nums shrink-0'>{player.shirtNumber}</span>
                  <span className='text-xs text-gray-300 truncate flex-1'>{player.name.split(' ').pop()}</span>
                  {player.position && <PosBadge position={player.position} />}
                </div>
              ))}
            </div>
          ) : homeTeam?.squad && homeTeam.squad.length > 0 ? (
            /* Plantilla completa */
            <SquadColumn
              team={match.homeTeam}
              colors={homeColors}
              squad={homeTeam.squad}
              align='left'
            />
          ) : (
            <div className='flex items-center justify-center text-xs text-gray-600 py-8'>Sin datos</div>
          )}

          {/* Visitante */}
          {hasLineups ? (
            /* Alineación real de la API */
            <div className='flex flex-col gap-0.5 items-end'>
              <div className='flex items-center gap-2 mb-3 flex-row-reverse'>
                <Shirt
                  primary={awayColors[0]}
                  secondary={awayColors[1]}
                  size={22}
                />
                <span className='text-sm font-bold text-white'>{match.awayTeam.shortName}</span>
              </div>
              {awayLineup?.startXI?.map(({ player }) => (
                <div
                  key={player.id}
                  className='flex items-center gap-1.5 flex-row-reverse w-full'
                >
                  <span className='text-[10px] text-gray-600 w-5 text-center tabular-nums shrink-0'>{player.shirtNumber}</span>
                  <span className='text-xs text-gray-300 truncate flex-1 text-right'>{player.name.split(' ').pop()}</span>
                  {player.position && <PosBadge position={player.position} />}
                </div>
              ))}
            </div>
          ) : awayTeam?.squad && awayTeam.squad.length > 0 ? (
            <SquadColumn
              team={match.awayTeam}
              colors={awayColors}
              squad={awayTeam.squad}
              align='right'
            />
          ) : (
            <div className='flex items-center justify-center text-xs text-gray-600 py-8'>Sin datos</div>
          )}
        </div>

        {/* Suplentes si hay alineación real */}
        {hasLineups && (homeLineup?.substitutes?.length ?? 0) > 0 && (
          <div className='mt-4 pt-4 border-t border-gray-700/50'>
            <h3 className='text-xs text-gray-600 uppercase tracking-wider mb-3'>Suplentes</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                {homeLineup?.substitutes?.map(({ player }) => (
                  <div
                    key={player.id}
                    className='flex items-center gap-1.5'
                  >
                    <span className='text-[10px] text-gray-700 w-5 text-center tabular-nums'>{player.shirtNumber}</span>
                    <span className='text-xs text-gray-500 truncate'>{player.name.split(' ').pop()}</span>
                  </div>
                ))}
              </div>
              <div className='space-y-1'>
                {awayLineup?.substitutes?.map(({ player }) => (
                  <div
                    key={player.id}
                    className='flex items-center gap-1.5 flex-row-reverse'
                  >
                    <span className='text-[10px] text-gray-700 w-5 text-center tabular-nums'>{player.shirtNumber}</span>
                    <span className='text-xs text-gray-500 truncate text-right'>{player.name.split(' ').pop()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Info del club local ──────────────────────────────────────── */}
      {(homeTeam?.founded || homeTeam?.clubColors) && (
        <div className='grid grid-cols-2 gap-3'>
          {homeTeam && (
            <div className='bg-gray-800 border border-gray-700 rounded-xl p-3 space-y-1.5'>
              <div className='flex items-center gap-2 mb-2'>
                {homeTeam.crest && (
                  <Image
                    src={homeTeam.crest}
                    alt=''
                    width={16}
                    height={16}
                    className='object-contain'
                  />
                )}
                <span className='text-xs font-semibold text-gray-400'>{homeTeam.shortName}</span>
              </div>
              {homeTeam.founded && <p className='text-xs text-gray-500'>🗓️ Fundado en {homeTeam.founded}</p>}
              {homeTeam.venue && <p className='text-xs text-gray-500'>🏟️ {homeTeam.venue}</p>}
              {homeTeam.clubColors && (
                <div className='flex items-center gap-1.5'>
                  <Shirt
                    primary={homeColors[0]}
                    secondary={homeColors[1]}
                    size={16}
                  />
                  <span className='text-xs text-gray-500'>{homeTeam.clubColors}</span>
                </div>
              )}
            </div>
          )}
          {awayTeam && (
            <div className='bg-gray-800 border border-gray-700 rounded-xl p-3 space-y-1.5'>
              <div className='flex items-center gap-2 mb-2'>
                {awayTeam.crest && (
                  <Image
                    src={awayTeam.crest}
                    alt=''
                    width={16}
                    height={16}
                    className='object-contain'
                  />
                )}
                <span className='text-xs font-semibold text-gray-400'>{awayTeam.shortName}</span>
              </div>
              {awayTeam.founded && <p className='text-xs text-gray-500'>🗓️ Fundado en {awayTeam.founded}</p>}
              {awayTeam.venue && <p className='text-xs text-gray-500'>🏟️ {awayTeam.venue}</p>}
              {awayTeam.clubColors && (
                <div className='flex items-center gap-1.5'>
                  <Shirt
                    primary={awayColors[0]}
                    secondary={awayColors[1]}
                    size={16}
                  />
                  <span className='text-xs text-gray-500'>{awayTeam.clubColors}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
