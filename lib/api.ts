import type { League, Match, Page, StandingsResponse } from '@/types'
import { TeamDetail } from '@/types/detail'

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
  params.set('sort', 'utcDate,asc')

  const response = await fetch(`${API_URL}/matches?${params}`, {
    cache: 'no-store'
  })
  if (!response.ok) throw new Error(`Error partidos: ${response.status}`)
  return response.json()
}

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

/**
 * Partidos en curso y próximos de todas las ligas.
 * El backend aplica la lógica de ventana + fallback a los próximos 10.
 * Sin caché — datos siempre frescos.
 */
export async function getLiveMatches(): Promise<Match[]> {
  const response = await fetch(`${API_URL}/live`, {
    cache: 'no-store'
  })
  if (!response.ok) throw new Error(`Error live: ${response.status}`)
  return response.json()
}

export async function getStandings(competition = 'PD'): Promise<StandingsResponse> {
  const response = await fetch(`${API_URL}/standings?competition=${competition}`, { next: { revalidate: 300 } })
  if (!response.ok) throw new Error(`Error standings: ${response.status}`)
  return response.json()
}

/**
 * Detalle de un equipo: plantilla, estadio y colores del club.
 * Cacheado 1 hora en Next.js (el backend también lo cachea 60 min).
 */
export async function getTeamDetail(teamId: number): Promise<TeamDetail> {
  const response = await fetch(`${API_URL}/team/${teamId}`, {
    next: { revalidate: 3_600 }
  })
  if (!response.ok) throw new Error(`Error team detail: ${response.status}`)
  return response.json()
}
