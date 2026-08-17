/**
 * Tipos para el detalle de partido.
 * Replica los records anidados de MatchDetailDTO.java.
 */

export interface PlayerInfo {
  id: number
  name: string
  position: string | null
  shirtNumber: number | null
}

export interface LineupPlayer {
  player: PlayerInfo
}

export interface Lineup {
  team: { id: number; name: string }
  formation: string | null
  startXI: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export interface MatchDetailDTO {
  id: number
  status: string
  utcDate: string
  matchDay: number | null
  homeTeam: { id: number; name: string; shortName: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; crest: string }
  score: {
    fullTime: { home: number | null; away: number | null } | null
    halfTime: { home: number | null; away: number | null } | null
  } | null
  lineups: Lineup[]
}
