export interface Team {
  id: number
  name: string
  shortName: string
  crest: string
}

export interface Score {
  fullTime: { home: number | null; away: number | null } | null
  halfTime: { home: number | null; away: number | null } | null
}

export interface Match {
  id: number
  status: MatchStatus
  utcDate: string
  matchDay: number
  homeTeam: Team
  awayTeam: Team
  score: Score | null
}

/**
 * Estados posibles de un partido según la API de football-data.org.
 * OJO: la API a veces devuelve "LIVE" en lugar de "IN_PLAY".
 * Los tratamos igual en toda la lógica.
 */
export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'LIVE' // ← equivale a IN_PLAY, lo devuelve el tier gratuito
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'SUSPENDED'

export interface League {
  code: string
  name: string
}

export interface TableEntry {
  position: number
  team: Team
  playedGames: number
  form: string | null
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface StandingGroup {
  stage: string
  type: string
  table: TableEntry[]
}

export interface StandingsResponse {
  standings: StandingGroup[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
