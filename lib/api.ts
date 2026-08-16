import type { League, Match, Page, StandingsResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Lista de competiciones. Se cachea 24h — no cambia nunca.
 */
export async function getLeagues(): Promise<League[]> {
  const response = await fetch(`${API_URL}/leagues`, {
    next: { revalidate: 86_400 }
  })
  if (!response.ok) throw new Error(`Error ligas: ${response.status}`)
  return response.json()
}

export interface MatchFilters {
  competition?: string
  matchDay?: number
  status?: string
  page?: number
  size?: number
}

/**
 * Partidos. Sin caché — siempre frescos del backend.
 */
export async function getMatches(filters: MatchFilters = {}): Promise<Page<Match>> {
  const params = new URLSearchParams()
  if (filters.competition) params.set('competition', filters.competition)
  if (filters.matchDay != null) params.set('matchDay', String(filters.matchDay))
  if (filters.status) params.set('status', filters.status)
  if (filters.page != null) params.set('page', String(filters.page))
  if (filters.size != null) params.set('size', String(filters.size))

  const response = await fetch(`${API_URL}/matches?${params}`, {
    cache: 'no-store'
  })
  if (!response.ok) throw new Error(`Error partidos: ${response.status}`)
  return response.json()
}

/**
 * Clasificación.
 *
 * Estrategia de caché en dos capas:
 * - Backend (Caffeine): cachea 60 min → protege el límite de la API externa.
 *   Se invalida con @CacheEvict cuando se hace sync de partidos.
 * - Next.js: revalida cada 5 min → garantiza que cuando el backend
 *   tenga datos nuevos (tras un sync), el frontend los recoge pronto.
 *
 * La combinación es eficiente: football-data.org se llama como máximo
 * 1 vez/hora por competición, pero el navegador siempre ve datos frescos.
 */
export async function getStandings(competition = 'PD'): Promise<StandingsResponse> {
  const response = await fetch(
    `${API_URL}/standings?competition=${competition}`,
    { next: { revalidate: 300 } } // ← 5 min, antes era 3600 (1 hora)
  )
  if (!response.ok) throw new Error(`Error standings: ${response.status}`)
  return response.json()
}
