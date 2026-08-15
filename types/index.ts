/**
 * Tipos TypeScript que replican los DTOs del backend Spring Boot.
 * Si cambias un DTO en Java, actualiza también este fichero.
 */

/** Réplica de TeamDTO.java */
export interface Team {
  id: number
  name: string
  shortName: string
  crest: string // URL del escudo del equipo
}

/** Réplica de MatchDTO.java */
export interface Match {
  id: number
  status: MatchStatus
  utcDate: string // ISO-8601, ej: "2026-08-15T18:00:00Z"
  matchDay: number
  homeTeam: Team
  awayTeam: Team
}

/** Estados posibles de un partido según la API de football-data.org */
export type MatchStatus =
  | 'SCHEDULED' // Programado (fecha conocida, no empieza todavía)
  | 'TIMED' // Fecha y hora confirmadas
  | 'IN_PLAY' // En juego ahora mismo
  | 'PAUSED' // Descanso
  | 'FINISHED' // Terminado
  | 'POSTPONED' // Aplazado
  | 'CANCELLED' // Cancelado
  | 'SUSPENDED' // Suspendido

/** Réplica de LeagueDTO.java */
export interface League {
  code: string // "PD", "CL", "PL"...
  name: string // "Primera División", "UEFA Champions League"...
}

/** Réplica de TableEntryDTO.java — una fila de la clasificación */
export interface TableEntry {
  position: number
  team: Team
  playedGames: number
  form: string | null // Últimos 5 resultados: "W,W,D,L,W"
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

/** Réplica de StandingGroupDTO.java — un grupo de clasificación */
export interface StandingGroup {
  stage: string // "REGULAR_SEASON"
  type: string // "TOTAL", "HOME", "AWAY"
  table: TableEntry[]
}

/** Réplica de StandingsResponseDTO.java */
export interface StandingsResponse {
  standings: StandingGroup[]
}

/** Respuesta paginada del backend — lo que devuelve /matches */
export interface Page<T> {
  content: T[] // Los datos de esta página
  totalElements: number // Total de registros en BD
  totalPages: number // Total de páginas
  number: number // Página actual (empieza en 0)
  size: number // Elementos por página
}
