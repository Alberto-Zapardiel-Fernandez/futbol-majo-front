/**
 * Fuerza que esta página NUNCA se pre-renderice en el build.
 * Siempre se ejecuta en el servidor en cada petición con datos frescos.
 * Sin esto, Vercel puede servir una versión cacheada del build inicial
 * cuando la BD todavía no tenía datos.
 */
export const dynamic = 'force-dynamic'

import AutoRefresh from '@/components/AutoRefresh'
import LeagueSelector from '@/components/LeagueSelector'
import MatchCard from '@/components/MatchCard'
import MatchdayNavigator from '@/components/MatchDayNavigator'
import { getLeagues, getMatches } from '@/lib/api'
import { LEAGUE_VISUALS } from '@/lib/leagues'

interface HomePageProps {
  searchParams: Promise<{ competition?: string; jornada?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { competition = 'PD', jornada = '1' } = await searchParams
  const matchDay = Math.max(1, parseInt(jornada, 10) || 1)

  // Cargamos ligas y partidos en paralelo
  // Promise.allSettled nunca lanza error — cada resultado puede ser
  // 'fulfilled' (ok) o 'rejected' (falló), los manejamos por separado
  const [leaguesResult, matchesResult] = await Promise.allSettled([getLeagues(), getMatches({ competition, matchDay, size: 20 })])

  const leagues = leaguesResult.status === 'fulfilled' ? leaguesResult.value : []
  const matchesPage = matchesResult.status === 'fulfilled' ? matchesResult.value : null

  // Mostramos error solo si el backend no responde en absoluto
  const backendDown = leaguesResult.status === 'rejected' && matchesResult.status === 'rejected'

  const selectedLeague = leagues.find(l => l.code === competition)
  const leagueName = selectedLeague?.name ?? competition
  const visual = LEAGUE_VISUALS[competition]

  return (
    <div className='space-y-5'>
      {/* Auto-refresca los datos cada 5 minutos */}
      <AutoRefresh intervalMs={300_000} />

      {/* Error de conexión — solo si el backend está completamente caído */}
      {backendDown && (
        <div className='bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm'>
          ⚠️ No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.
        </div>
      )}

      {/* Selector de ligas */}
      {leagues.length > 0 && (
        <LeagueSelector
          leagues={leagues}
          selected={competition}
          basePath='/'
        />
      )}

      {/* Cabecera de sección */}
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold flex items-center gap-2'>
          {visual?.emoji && <span>{visual.emoji}</span>}
          <span>{leagueName}</span>
        </h1>
        <span className='text-xs text-gray-500'>{matchesPage?.totalElements ?? 0} partidos</span>
      </div>

      {/* Navegador de jornadas */}
      <MatchdayNavigator
        competition={competition}
        current={matchDay}
      />

      {/* Lista de partidos */}
      {matchesPage && matchesPage.content.length > 0 ? (
        <div className='space-y-3'>
          {matchesPage.content.map(match => (
            <MatchCard
              key={match.id}
              match={match}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-16 text-gray-500'>
          <p className='text-4xl mb-4'>📭</p>
          <p className='font-medium'>No hay partidos en la jornada {matchDay}</p>
          <p className='text-sm mt-2 text-gray-600'>{matchesPage ? 'Prueba con otra jornada.' : 'El servidor está cargando los datos...'}</p>
        </div>
      )}
    </div>
  )
}
