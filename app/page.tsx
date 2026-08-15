/**
 * Página de inicio — URL: /
 *
 * Por ahora muestra las ligas disponibles para confirmar que el frontend
 * se comunica correctamente con el backend.
 */

import { getLeagues } from '@/lib/api'
import type { League } from '@/types'

export default async function HomePage() {
  // Tipamos leagues explícitamente como League[] para que TypeScript
  // sepa exactamente qué forma tienen los objetos de este array.
  let leagues: League[] = []
  let error: string | null = null

  try {
    leagues = await getLeagues()
  } catch {
    // En TypeScript moderno puedes escribir catch sin variable cuando
    // no necesitas acceder al objeto de error. Más limpio que catch (e)
    // si luego no usas "e" para nada.
    error = 'No se pudo conectar con el backend. ¿Está arrancado en localhost:8080?'
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Ligas disponibles</h1>

      {/* Mensaje de error si el backend no responde */}
      {error && <div className='bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300'>⚠️ {error}</div>}

      {/* Lista de ligas */}
      <div className='grid grid-cols-2 gap-3'>
        {leagues.map((league: League) => (
          <div
            key={league.code}
            className='bg-gray-800 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-700 transition-colors cursor-pointer'
          >
            <span className='bg-green-600 text-white text-xs font-bold px-2 py-1 rounded'>{league.code}</span>
            <span className='text-sm text-gray-200'>{league.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
