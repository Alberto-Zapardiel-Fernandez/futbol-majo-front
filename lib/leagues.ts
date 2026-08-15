/**
 * Información visual de cada competición.
 *
 * Los emojis de banderas de países NO funcionan en Windows.
 * Usamos imágenes de flagcdn.com (CDN gratuito) para los países,
 * y emojis solo para competiciones internacionales sin país específico.
 */

export interface LeagueVisual {
  /** URL de imagen de bandera, o null si usamos emoji */
  flagUrl: string | null
  /** Emoji para competiciones sin bandera de país (WC, CL, EC) */
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

/** Número máximo de jornadas por competición */
export const MAX_MATCHDAY: Record<string, number> = {
  PD: 38,
  PL: 38,
  SA: 38,
  FL1: 38,
  PPL: 34,
  BL1: 34,
  DED: 34,
  ELC: 46,
  BSA: 38,
  CL: 8,
  WC: 7,
  EC: 6
}
