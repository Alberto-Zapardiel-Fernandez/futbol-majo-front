/**
 * Cliente API centralizado para el backend Spring Boot.
 *
 * IMPORTANTE sobre el caché de Next.js:
 * - getMatches: sin caché (no-store). Los partidos cambian cada 5 minutos
 *   cuando el scheduler los sincroniza. Cachearlo escondería los cambios.
 * - getStandings: revalidate 3600s (1 hora). La clasificación cambia poco.
 * - getLeagues: revalidate 86400s (1 día). La lista de ligas no cambia nunca.
 */

import type { League, Match, Page, StandingsResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ---------------------------------------------------------------------------
// LIGAS
// ---------------------------------------------------------------------------

/**
 * Lista de competiciones soportadas.
 * Se cachea 24 horas — no cambia casi nunca.
 */
export async function getLeagues(): Promise<League[]> {
  const response = await fetch(`${API_URL}/leagues`, {
    next: { revalidate: 86_400 }
  })
  if (!response.ok) throw new Error(`Error ligas: ${response.status}`)
  return response.json()
}

// ---------------------------------------------------------------------------
// PARTIDOS
// ---------------------------------------------------------------------------

export interface MatchFilters {
  competition?: string
  matchDay?: number
  status?: string
  page?: number
  size?: number
}

/**
 * Partidos con filtros.
 * SIN caché de Next.js (cache: 'no-store') para siempre mostrar
 * los datos más recientes del backend.
 */
export async function getMatches(filters: MatchFilters = {}): Promise<Page<Match>> {
  const params = new URLSearchParams()
  if (filters.competition) params.set('competition', filters.competition)
  if (filters.matchDay != null) params.set('matchDay', String(filters.matchDay))
  if (filters.status) params.set('status', filters.status)
  if (filters.page != null) params.set('page', String(filters.page))
  if (filters.size != null) params.set('size', String(filters.size))

  const response = await fetch(`${API_URL}/matches?${params}`, {
    cache: 'no-store' // ← Siempre frescos, nunca cacheados en Next.js
  })
  if (!response.ok) throw new Error(`Error partidos: ${response.status}`)
  return response.json()
}

// ---------------------------------------------------------------------------
// CLASIFICACIÓN
// ---------------------------------------------------------------------------

/**
 * Clasificación de una competición.
 * Cacheada 1 hora en Next.js — el backend ya la cachea 60 min con Caffeine,
 * así que esta capa es redundante pero protege ante picos de tráfico.
 */
export async function getStandings(competition = 'PD'): Promise<StandingsResponse> {
  const response = await fetch(`${API_URL}/standings?competition=${competition}`, { next: { revalidate: 3_600 } })
  if (!response.ok) throw new Error(`Error standings: ${response.status}`)
  return response.json()
}
