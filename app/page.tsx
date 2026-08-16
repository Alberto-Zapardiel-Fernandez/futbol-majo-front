import AutoSyncTrigger from '@/components/AutoSyncTrigger'
import LeagueSelector from '@/components/LeagueSelector'
import MatchCard from '@/components/MatchCard'
import AutoRefresh from '@/components/AutoRefresh'
import MatchdayNavigator from '@/components/MatchDayNavigator'
import { getLeagues, getMatches } from '@/lib/api'
import { LEAGUE_VISUALS } from '@/lib/leagues'

interface HomePageProps {
  searchParams: Promise<{ competition?: string; jornada?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { competition = 'PD', jornada = '1' } = await searchParams
  const matchDay = Math.max(1, parseInt(jornada, 10) || 1)

  // Lanzamos 3 peticiones en paralelo:
  // 1. Lista de ligas (para el selector)
  // 2. Partidos de esta jornada (para mostrar en pantalla)
  // 3. Comprobación de si la liga tiene ALGÚN dato (sin filtrar por jornada)
  //    — necesaria para distinguir "jornada vacía" de "liga sin sincronizar"
  const [leaguesResult, matchesResult, leagueDataCheckResult] = await Promise.allSettled([
    getLeagues(),
    getMatches({ competition, matchDay, size: 20 }),
    getMatches({ competition, size: 1 }) // Solo 1 resultado, es muy rápido
  ])

  const leagues = leaguesResult.status === 'fulfilled' ? leaguesResult.value : []
  const matchesPage = matchesResult.status === 'fulfilled' ? matchesResult.value : null
  const backendError = leaguesResult.status === 'rejected'

  // ¿Tiene la liga ALGÚN partido en BD? (independientemente de la jornada)
  const leagueHasData = leagueDataCheckResult.status === 'fulfilled' ? leagueDataCheckResult.value.totalElements > 0 : true // Si la comprobación falló, asumimos que hay datos para no bloquear

  const selectedLeague = leagues.find(l => l.code === competition)
  const leagueName = selectedLeague?.name ?? competition
  const visual = LEAGUE_VISUALS[competition]

  return (
    <div className='space-y-5'>
      <AutoRefresh intervalMs={300_000} />
      {/* Error de conexión con el backend */}
      {backendError && (
        <div className='bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm'>
          ⚠️ No se pudo conectar con el backend. Comprueba que Spring Boot está arrancado en localhost:8080.
        </div>
      )}

      {/* Selector de ligas */}
      {leagues.length > 0 && (
        <LeagueSelector
          leagues={leagues}
          selected={competition}
        />
      )}

      {/* Cabecera */}
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold flex items-center gap-2'>
          {visual?.emoji && <span>{visual.emoji}</span>}
          <span>{leagueName}</span>
        </h1>
        <span className='text-xs text-gray-500'>{matchesPage?.totalElements ?? 0} partidos</span>
      </div>

      {/*
        ¿La liga no tiene datos todavía?
        → AutoSyncTrigger llama al backend, muestra spinner y refresca al terminar.
        La diferencia con el estado vacío normal es que aquí NO se muestra el
        navegador de jornadas (no tiene sentido navegar jornadas si no hay nada).
      */}
      {!leagueHasData ? (
        <AutoSyncTrigger
          competition={competition}
          matchDay={matchDay}
        />
      ) : (
        <>
          {/* Navegador de jornadas */}
          <MatchdayNavigator
            competition={competition}
            current={matchDay}
          />

          {/* Partidos de la jornada */}
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
            // La liga tiene datos, pero esta jornada concreta está vacía
            <div className='text-center py-16 text-gray-500'>
              <p className='text-4xl mb-4'>📭</p>
              <p className='font-medium'>No hay partidos en la jornada {matchDay}</p>
              <p className='text-sm mt-2'>Prueba con otra jornada.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
