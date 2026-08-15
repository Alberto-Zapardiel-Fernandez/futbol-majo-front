/**
 * Cliente API centralizado para comunicarse con el backend Spring Boot.
 *
 * Todas las funciones de este fichero usan la URL base definida en
 * la variable de entorno NEXT_PUBLIC_API_URL (.env.local).
 *
 * Si el backend devuelve un error, lanzamos un Error con el mensaje
 * para que el componente que llama pueda mostrarlo al usuario.
 */

import type { League, Match, Page, StandingsResponse } from '@/types'

/** URL base del backend, leída desde la variable de entorno */
const API_URL = process.env.NEXT_PUBLIC_API_URL

// ---------------------------------------------------------------------------
// LIGAS
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de todas las competiciones soportadas.
 * Llama a: GET /api/football/laliga/leagues
 */
export async function getLeagues(): Promise<League[]> {
  const response = await fetch(`${API_URL}/leagues`)
  if (!response.ok) {
    throw new Error(`Error al obtener las ligas: ${response.status}`)
  }
  return response.json()
}

// ---------------------------------------------------------------------------
// PARTIDOS
// ---------------------------------------------------------------------------

/** Parámetros opcionales para filtrar la consulta de partidos */
export interface MatchFilters {
  competition?: string
  matchDay?: number
  status?: string
  page?: number
  size?: number
}

/**
 * Obtiene partidos desde la BD con filtros opcionales y paginación.
 * Llama a: GET /api/football/laliga/matches
 */
export async function getMatches(filters: MatchFilters = {}): Promise<Page<Match>> {
  // Construimos los query params solo con los valores que existan
  const params = new URLSearchParams()
  if (filters.competition) params.set('competition', filters.competition)
  if (filters.matchDay) params.set('matchDay', String(filters.matchDay))
  if (filters.status) params.set('status', filters.status)
  if (filters.page != null) params.set('page', String(filters.page))
  if (filters.size != null) params.set('size', String(filters.size))

  const url = `${API_URL}/matches?${params.toString()}`
  const response = await fetch(url, {
    // next: { revalidate: 60 } → Next.js cachea esta petición 60 segundos
    // Así no machacamos el backend con cada visita a la página
    next: { revalidate: 60 }
  })

  if (!response.ok) {
    throw new Error(`Error al obtener partidos: ${response.status}`)
  }
  return response.json()
}

// ---------------------------------------------------------------------------
// CLASIFICACIÓN
// ---------------------------------------------------------------------------

/**
 * Obtiene la clasificación de una competición.
 * El backend ya cachea esto 60 min con Caffeine.
 * Llama a: GET /api/football/laliga/standings?competition=PD
 */
export async function getStandings(competition: string = 'PD'): Promise<StandingsResponse> {
  const response = await fetch(`${API_URL}/standings?competition=${competition}`, {
    next: { revalidate: 3600 } // Next.js también cachea 1 hora en su capa
  })

  if (!response.ok) {
    throw new Error(`Error al obtener clasificación: ${response.status}`)
  }
  return response.json()
}
