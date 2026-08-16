export const dynamic = 'force-dynamic'

import AutoRefresh from '@/components/AutoRefresh'
import LeagueSelector from '@/components/LeagueSelector'
import MatchCard from '@/components/MatchCard'
import MatchdayNavigator from '@/components/MatchDayNavigator'
import { getLeagues, getMatches, getMatchesNoJornada } from '@/lib/api'
import { getMatchChannels } from '@/lib/supabase'
import { LEAGUE_VISUALS } from '@/lib/leagues'
import type { ChannelKey } from '@/lib/channels'

interface HomePageProps {
  searchParams: Promise<{ competition?: string; jornada?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { competition = 'PD', jornada = '1' } = await searchParams
  const matchDay = Math.max(1, parseInt(jornada, 10) || 1)

  const [leaguesResult, matchesResult] = await Promise.allSettled([getLeagues(), getMatches({ competition, matchDay, size: 20 })])

  const leagues = leaguesResult.status === 'fulfilled' ? leaguesResult.value : []
  let matchesPage = matchesResult.status === 'fulfilled' ? matchesResult.value : null
  const backendDown = leaguesResult.status === 'rejected' && matchesResult.status === 'rejected'

  /*
   * FALLBACK: si la jornada 1 devuelve vacío pero la liga SÍ tiene datos,
   * es porque matchDay = NULL en BD (liga sin empezar o API sin matchday).
   * En ese caso mostramos todos los partidos ordenados por fecha.
   */
  const needsFallback = matchesPage !== null && matchesPage.content.length === 0
  let usingFallback = false

  if (needsFallback) {
    const fallback = await getMatchesNoJornada(competition, 30).catch(() => null)
    if (fallback && fallback.content.length > 0) {
      matchesPage = fallback
      usingFallback = true
    }
  }

  // Cargamos canales asignados para los partidos visibles
  const matchIds = matchesPage?.content.map(m => m.id) ?? []
  const channelMap = (await getMatchChannels(matchIds).catch(() => ({}))) as Record<number, ChannelKey | undefined>

  const visual = LEAGUE_VISUALS[competition]
  const leagueName = leagues.find(l => l.code === competition)?.name ?? competition

  return (
    <div className='space-y-5'>
      <AutoRefresh intervalMs={60_000} />

      {backendDown && (
        <div className='bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm'>⚠️ No se pudo conectar con el servidor.</div>
      )}

      {leagues.length > 0 && (
        <LeagueSelector
          leagues={leagues}
          selected={competition}
          basePath='/'
        />
      )}

      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold flex items-center gap-2'>
          {visual?.emoji && <span>{visual.emoji}</span>}
          <span>{leagueName}</span>
        </h1>
        <span className='text-xs text-gray-500'>{matchesPage?.totalElements ?? 0} partidos</span>
      </div>

      {/*
        Mostramos el navegador de jornadas solo si tenemos datos reales por jornada.
        Si usamos el fallback (matchDay=NULL), el navegador no tiene sentido.
      */}
      {!usingFallback && (
        <MatchdayNavigator
          competition={competition}
          current={matchDay}
        />
      )}

      {/*
        Aviso informativo cuando mostramos partidos sin jornada definida.
        Típico en ligas que aún no han empezado o el API no tiene matchdays.
      */}
      {usingFallback && (
        <div className='bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-500 flex items-center gap-2'>
          <span>📅</span>
          <span>Mostrando todos los partidos ordenados por fecha — jornadas no disponibles aún</span>
        </div>
      )}

      {/* Lista de partidos */}
      {matchesPage && matchesPage.content.length > 0 ? (
        <div className='space-y-3'>
          {matchesPage.content.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              channel={channelMap[match.id] ?? null}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-16 text-gray-500'>
          <p className='text-4xl mb-4'>📭</p>
          <p className='font-medium'>No hay partidos disponibles</p>
          <p className='text-sm mt-2 text-gray-600'>
            {!usingFallback ? `No hay partidos en la jornada ${matchDay}. Prueba con otra.` : 'Esta liga no tiene partidos sincronizados aún.'}
          </p>
        </div>
      )}
    </div>
  )
}
