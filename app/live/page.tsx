export const dynamic = 'force-dynamic'

import AutoRefresh from '@/components/AutoRefresh'
import MatchCard from '@/components/MatchCard'
import { getLiveMatches } from '@/lib/api'
import { getMatchChannels } from '@/lib/supabase'
import { LEAGUE_NAMES, LEAGUE_VISUALS } from '@/lib/leagues'
import type { Match } from '@/types'
import type { ChannelKey } from '@/lib/channels'

/**
 * Agrupa una lista de partidos por código de competición,
 * manteniendo el orden original (ya llegan ordenados por fecha).
 */
function groupByLeague(matches: Match[]): Map<string, Match[]> {
  const map = new Map<string, Match[]>()
  for (const match of matches) {
    const code = match.competitionCode ?? 'UNKNOWN'
    if (!map.has(code)) map.set(code, [])
    map.get(code)!.push(match)
  }
  return map
}

/** Decide si algún partido del array está en curso ahora */
function hasLiveMatch(matches: Match[]): boolean {
  return matches.some(m => m.status === 'IN_PLAY' || m.status === 'LIVE' || m.status === 'PAUSED')
}

export default async function LivePage() {
  let matches: Match[] = []
  let error = false

  try {
    matches = await getLiveMatches()
  } catch {
    error = true
  }

  // Canales asignados para los partidos visibles
  const channelMap =
    matches.length > 0 ? ((await getMatchChannels(matches.map(m => m.id)).catch(() => ({}))) as Record<number, ChannelKey | undefined>) : {}

  const grouped = groupByLeague(matches)
  const anyLive = hasLiveMatch(matches)
  const totalLive = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'LIVE' || m.status === 'PAUSED').length
  const totalUpcoming = matches.length - totalLive

  return (
    <div className='space-y-6'>
      {/* Auto-refresh cada 60 segundos */}
      <AutoRefresh intervalMs={60_000} />

      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <div>
        <h1 className='text-2xl font-black text-white flex items-center gap-2'>
          {anyLive && (
            <span className='relative flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75' />
              <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500' />
            </span>
          )}
          En Vivo & Próximos
        </h1>

        {/* Resumen de lo que hay */}
        <p className='text-sm text-gray-500 mt-1'>
          {error
            ? 'No se pudo conectar con el servidor'
            : totalLive > 0 && totalUpcoming > 0
              ? `${totalLive} en juego · ${totalUpcoming} próximos`
              : totalLive > 0
                ? `${totalLive} partido${totalLive > 1 ? 's' : ''} en juego ahora`
                : totalUpcoming > 0
                  ? `${totalUpcoming} próximo${totalUpcoming > 1 ? 's' : ''}`
                  : 'Sin partidos próximos'}
        </p>
      </div>

      {/* Error de conexión */}
      {error && (
        <div className='bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm'>
          ⚠️ No se pudo conectar con el servidor. Inténtalo de nuevo.
        </div>
      )}

      {/* ── Partidos agrupados por liga ─────────────────────────────────── */}
      {matches.length > 0 ? (
        <div className='space-y-6'>
          {[...grouped.entries()].map(([code, leagueMatches]) => {
            const visual = LEAGUE_VISUALS[code]
            const leagueName = LEAGUE_NAMES[code] ?? code
            const leagueLive = hasLiveMatch(leagueMatches)

            return (
              <div
                key={code}
                className='space-y-3'
              >
                {/* Cabecera de la liga */}
                <div className='flex items-center gap-2'>
                  {/* Bandera o emoji */}
                  {visual?.flagUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={visual.flagUrl}
                      alt={code}
                      width={18}
                      height={14}
                      className='rounded-sm object-cover opacity-90'
                    />
                  ) : (
                    <span className='text-sm'>{visual?.emoji ?? '🏟️'}</span>
                  )}

                  <span className='text-sm font-semibold text-gray-300'>{leagueName}</span>

                  {/* Indicador "en vivo" a nivel de liga */}
                  {leagueLive && (
                    <span className='text-[10px] font-bold text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded-full uppercase tracking-wide'>Live</span>
                  )}

                  {/* Línea separadora */}
                  <div className='flex-1 h-px bg-gray-800' />
                </div>

                {/* Partidos de esta liga */}
                {leagueMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    channel={channelMap[match.id] ?? null}
                  />
                ))}
              </div>
            )
          })}
        </div>
      ) : !error ? (
        <div className='text-center py-20 text-gray-500'>
          <p className='text-5xl mb-4'>📭</p>
          <p className='font-semibold text-lg'>Sin actividad por ahora</p>
          <p className='text-sm mt-2 text-gray-600'>Aquí aparecerán los partidos en vivo y los próximos en arrancar.</p>
        </div>
      ) : null}
    </div>
  )
}
