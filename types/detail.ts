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

export interface SquadMember {
  id: number
  name: string
  position: string | null
  dateOfBirth: string | null
  nationality: string | null
  shirtNumber: number | null
}

export interface TeamDetail {
  id: number
  name: string
  shortName: string
  crest: string
  venue: string | null
  founded: number | null
  clubColors: string | null
  website: string | null
  squad: SquadMember[]
}
