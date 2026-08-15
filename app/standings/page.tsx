/**
 * Página de clasificación — URL: /standings
 *
 * Muestra la tabla de clasificación completa de la liga seleccionada
 * con todos los datos: posición, victorias, empates, derrotas, GF, GC,
 * diferencia de goles, puntos y forma de los últimos 5 partidos.
 *
 * Las zonas (Champions, Europa, Conference, Descenso) se marcan con
 * un indicador lateral de color y una leyenda al pie de la tabla.
 *
 * La clasificación viene cacheada 60 minutos en el backend para
 * no superar el límite de la API gratuita.
 */

import LeagueSelector from '@/components/LeagueSelector'
import StandingsTable from '@/components/StandingsTable'
import { getLeagues, getStandings } from '@/lib/api'
import { LEAGUE_VISUALS } from '@/lib/leagues'

interface StandingsPageProps {
  searchParams: Promise<{ competition?: string }>
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const { competition = 'PD' } = await searchParams

  // Cargamos ligas y clasificación en paralelo
  const [leaguesResult, standingsResult] = await Promise.allSettled([getLeagues(), getStandings(competition)])

  const leagues = leaguesResult.status === 'fulfilled' ? leaguesResult.value : []
  const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null
  const error = standingsResult.status === 'rejected'

  /*
    La API devuelve múltiples tipos de clasificación (TOTAL, HOME, AWAY).
    Cogemos TOTAL (clasificación general) como primera opción,
    y si no existe, el primero que haya.
  */
  const totalGroup = standingsData?.standings?.find(s => s.type === 'TOTAL') ?? standingsData?.standings?.[0]

  const selectedLeague = leagues.find(l => l.code === competition)
  const leagueName = selectedLeague?.name ?? competition
  const visual = LEAGUE_VISUALS[competition]

  return (
    <div className='space-y-5'>
      {/* Error de conexión */}
      {error && (
        <div className='bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm'>
          ⚠️ No se pudo cargar la clasificación. Comprueba que el backend está arrancado.
        </div>
      )}

      {/* Selector de ligas — reutilizamos el mismo componente que en partidos */}
      {leagues.length > 0 && (
        <LeagueSelector
          leagues={leagues}
          selected={competition}
          basePath='/standings'
        />
      )}

      {/* Cabecera de sección */}
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold flex items-center gap-2'>
          {visual?.emoji && <span>{visual.emoji}</span>}
          <span>{leagueName}</span>
        </h1>

        {/* Número de equipos en la tabla */}
        {totalGroup && <span className='text-xs text-gray-500'>{totalGroup.table.length} equipos</span>}
      </div>

      {/* Tabla de clasificación */}
      {totalGroup ? (
        <StandingsTable
          table={totalGroup.table}
          competition={competition}
        />
      ) : !error ? (
        // No hay datos — probablemente competición sin fase de liga (WC, EC)
        <div className='text-center py-16 text-gray-500'>
          <p className='text-4xl mb-4'>📊</p>
          <p className='font-medium'>Clasificación no disponible</p>
          <p className='text-sm mt-2'>Esta competición puede estar en fase de grupos o eliminatorias.</p>
        </div>
      ) : null}
    </div>
  )
}
