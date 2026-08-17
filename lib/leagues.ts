/**
 * Información visual y de configuración de cada competición.
 */

export interface LeagueVisual {
  flagUrl: string | null
  emoji: string | null
}

export const LEAGUE_VISUALS: Record<string, LeagueVisual> = {
  WC: { flagUrl: null, emoji: '🌍' },
  CL: { flagUrl: null, emoji: '🏆' },
  EC: { flagUrl: null, emoji: '⭐' },
  BL1: { flagUrl: 'https://flagcdn.com/w20/de.png', emoji: null },
  DED: { flagUrl: 'https://flagcdn.com/w20/nl.png', emoji: null },
  BSA: { flagUrl: 'https://flagcdn.com/w20/br.png', emoji: null },
  PD: { flagUrl: 'https://flagcdn.com/w20/es.png', emoji: null },
  FL1: { flagUrl: 'https://flagcdn.com/w20/fr.png', emoji: null },
  ELC: { flagUrl: 'https://flagcdn.com/w20/gb-eng.png', emoji: null },
  PPL: { flagUrl: 'https://flagcdn.com/w20/pt.png', emoji: null },
  SA: { flagUrl: 'https://flagcdn.com/w20/it.png', emoji: null },
  PL: { flagUrl: 'https://flagcdn.com/w20/gb-eng.png', emoji: null }
}

/** Nombre legible de cada competición por su código */
export const LEAGUE_NAMES: Record<string, string> = {
  WC: 'FIFA World Cup',
  CL: 'UEFA Champions League',
  BL1: 'Bundesliga',
  DED: 'Eredivisie',
  BSA: 'Brasileirao Série A',
  PD: 'Primera División',
  FL1: 'Ligue 1',
  ELC: 'Championship',
  PPL: 'Primeira Liga',
  EC: 'European Championship',
  SA: 'Serie A',
  PL: 'Premier League'
}

/** Jornadas máximas por competición */
export const MAX_MATCHDAY: Record<string, number> = {
  PD: 38,
  PL: 38,
  SA: 38,
  BSA: 38,
  FL1: 34,
  PPL: 34,
  BL1: 34,
  DED: 34, // ← FL1 corregido de 38 a 34
  ELC: 46,
  CL: 8,
  WC: 7,
  EC: 6
}
