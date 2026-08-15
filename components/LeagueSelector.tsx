/**
 * Selector horizontal de ligas con banderas.
 *
 * Client Component porque necesita onClick para navegar.
 *
 * Props:
 * - basePath: ruta base de navegación ('/' para partidos, '/standings' para clasificación)
 *   Por defecto '/', lo que mantiene compatibilidad con el uso actual en page.tsx.
 */

'use client'

import { useRouter } from 'next/navigation'
import type { League } from '@/types'
import { LEAGUE_VISUALS } from '@/lib/leagues'

interface LeagueSelectorProps {
  leagues: League[]
  selected: string
  /** Ruta base. Default '/' (partidos). Usar '/standings' en la clasificación. */
  basePath?: string
}

function LeagueFlag({ code }: { code: string }) {
  const visual = LEAGUE_VISUALS[code]
  if (!visual) return <span className='text-base'>🏟️</span>

  if (visual.flagUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={visual.flagUrl}
        alt={code}
        width={20}
        height={15}
        className='rounded-sm object-cover shrink-0'
      />
    )
  }
  return <span className='text-base shrink-0'>{visual.emoji}</span>
}

export default function LeagueSelector({ leagues, selected, basePath = '/' }: LeagueSelectorProps) {
  const router = useRouter()

  const handleSelect = (code: string) => {
    // En partidos añadimos jornada=1 para resetear la jornada al cambiar de liga
    const params = new URLSearchParams({ competition: code })
    if (basePath === '/') params.set('jornada', '1')
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <div>
      <h2 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>Competición</h2>

      <div className='flex gap-2 overflow-x-auto pb-2'>
        {leagues.map(league => {
          const isSelected = selected === league.code
          return (
            <button
              key={league.code}
              onClick={() => handleSelect(league.code)}
              title={league.name}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                whitespace-nowrap transition-all duration-200 border
                shrink-0 max-w-[180px]
                ${
                  isSelected
                    ? 'bg-green-600 border-green-500 text-white font-semibold shadow-lg shadow-green-900/30'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white hover:border-gray-600'
                }
              `}
            >
              <LeagueFlag code={league.code} />
              <span className='truncate min-w-0'>{league.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
