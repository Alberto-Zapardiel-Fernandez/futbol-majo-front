export const dynamic = 'force-dynamic'

import AutoRefresh from '@/components/AutoRefresh'
import LeagueSelector from '@/components/LeagueSelector'
import StandingsTable from '@/components/StandingsTable'
import { getLeagues, getStandings } from '@/lib/api'
import { LEAGUE_VISUALS } from '@/lib/leagues'

interface StandingsPageProps {
  searchParams: Promise<{ competition?: string }>
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const { competition = 'PD' } = await searchParams

  const [leaguesResult, standingsResult] = await Promise.allSettled([getLeagues(), getStandings(competition)])

  const leagues = leaguesResult.status === 'fulfilled' ? leaguesResult.value : []
  const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null
  const error = standingsResult.status === 'rejected'

  const totalGroup = standingsData?.standings?.find(s => s.type === 'TOTAL') ?? standingsData?.standings?.[0]

  const selectedLeague = leagues.find(l => l.code === competition)
  const leagueName = selectedLeague?.name ?? competition
  const visual = LEAGUE_VISUALS[competition]

  return (
    <div className='space-y-5'>
      <AutoRefresh intervalMs={300_000} />

      {error && (
        <div className='bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm'>
          ⚠️ No se pudo cargar la clasificación. Inténtalo de nuevo.
        </div>
      )}

      {leagues.length > 0 && (
        <LeagueSelector
          leagues={leagues}
          selected={competition}
          basePath='/standings'
        />
      )}

      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold flex items-center gap-2'>
          {visual?.emoji && <span>{visual.emoji}</span>}
          <span>{leagueName}</span>
        </h1>
        {totalGroup && <span className='text-xs text-gray-500'>{totalGroup.table.length} equipos</span>}
      </div>

      {totalGroup ? (
        <StandingsTable
          table={totalGroup.table}
          competition={competition}
        />
      ) : !error ? (
        <div className='text-center py-16 text-gray-500'>
          <p className='text-4xl mb-4'>📊</p>
          <p className='font-medium'>Clasificación no disponible</p>
          <p className='text-sm mt-2'>Esta competición puede estar en fase eliminatoria.</p>
        </div>
      ) : null}
    </div>
  )
}
