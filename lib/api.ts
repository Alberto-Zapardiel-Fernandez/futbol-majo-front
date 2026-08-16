import type { League, Match, Page, StandingsResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

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

export async function getMatches(filters: MatchFilters = {}): Promise<Page<Match>> {
  const params = new URLSearchParams()
  if (filters.competition) params.set('competition', filters.competition)
  if (filters.matchDay != null) params.set('matchDay', String(filters.matchDay))
  if (filters.status) params.set('status', filters.status)
  if (filters.page != null) params.set('page', String(filters.page))
  if (filters.size != null) params.set('size', String(filters.size))
  // Ordenamos siempre por fecha para que el fallback también tenga orden lógico
  params.set('sort', 'utcDate,asc')

  const response = await fetch(`${API_URL}/matches?${params}`, {
    cache: 'no-store'
  })
  if (!response.ok) throw new Error(`Error partidos: ${response.status}`)
  return response.json()
}

/**
 * Obtiene partidos sin filtrar por jornada.
 * Usado como fallback cuando una liga tiene datos pero
 * el campo matchDay es NULL (leagues que aún no han empezado
 * o el API gratuito no lo proporciona).
 */
export async function getMatchesNoJornada(competition: string, size = 30): Promise<Page<Match>> {
  const params = new URLSearchParams({
    competition,
    size: String(size),
    sort: 'utcDate,asc'
  })

  const response = await fetch(`${API_URL}/matches?${params}`, {
    cache: 'no-store'
  })
  if (!response.ok) throw new Error(`Error partidos sin jornada: ${response.status}`)
  return response.json()
}

export async function getStandings(competition = 'PD'): Promise<StandingsResponse> {
  const response = await fetch(`${API_URL}/standings?competition=${competition}`, { next: { revalidate: 300 } })
  if (!response.ok) throw new Error(`Error standings: ${response.status}`)
  return response.json()
}
