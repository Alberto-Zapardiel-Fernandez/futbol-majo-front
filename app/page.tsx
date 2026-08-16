export const dynamic = 'force-dynamic'

import AutoRefresh from '@/components/AutoRefresh'
import LeagueSelector from '@/components/LeagueSelector'
import MatchCard from '@/components/MatchCard'
import MatchdayNavigator from '@/components/MatchDayNavigator'
import { getLeagues, getMatches } from '@/lib/api'
import { getMatchChannels } from '@/lib/supabase'
import { LEAGUE_VISUALS } from '@/lib/leagues'
import { ChannelKey } from '@/lib/channels'

interface HomePageProps {
  searchParams: Promise<{ competition?: string; jornada?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { competition = 'PD', jornada = '1' } = await searchParams
  const matchDay = Math.max(1, parseInt(jornada, 10) || 1)

  const [leaguesResult, matchesResult] = await Promise.allSettled([getLeagues(), getMatches({ competition, matchDay, size: 20 })])

  const leagues = leaguesResult.status === 'fulfilled' ? leaguesResult.value : []
  const matchesPage = matchesResult.status === 'fulfilled' ? matchesResult.value : null
  const backendDown = leaguesResult.status === 'rejected' && matchesResult.status === 'rejected'

  // Cargamos los canales asignados para los partidos de esta página
  const matchIds = matchesPage?.content.map(m => m.id) ?? []
  const channelMap = await getMatchChannels(matchIds).catch(() => ({}))

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

      <MatchdayNavigator
        competition={competition}
        current={matchDay}
      />

      {matchesPage && matchesPage.content.length > 0 ? (
        <div className='space-y-3'>
          {matchesPage.content.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              channel={(channelMap as Record<number, ChannelKey | undefined>)[match.id] ?? null}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-16 text-gray-500'>
          <p className='text-4xl mb-4'>📭</p>
          <p className='font-medium'>No hay partidos en la jornada {matchDay}</p>
        </div>
      )}
    </div>
  )
}
