/**
 * Configuración de zonas de clasificación por competición.
 *
 * Cada zona define el rango de posiciones, el texto descriptivo y los
 * colores CSS para el indicador lateral de cada fila de la tabla.
 *
 * Si añades una liga nueva, añade aquí sus zonas de clasificación.
 */

export interface Zone {
  from: number // Posición inicial (inclusive)
  to: number // Posición final (inclusive)
  label: string // Texto para la leyenda
  color: string // Color CSS hex para el indicador lateral
  dotBg: string // Clase Tailwind para el punto de leyenda
}

/** Zonas de clasificación por código de competición */
export const LEAGUE_ZONES: Record<string, Zone[]> = {
  PD: [
    // LaLiga
    { from: 1, to: 4, label: 'Champions League', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 5, to: 5, label: 'Europa League', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 6, to: 6, label: 'Conference League', color: '#22c55e', dotBg: 'bg-green-500' },
    { from: 18, to: 20, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  PL: [
    // Premier League
    { from: 1, to: 4, label: 'Champions League', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 5, to: 5, label: 'Europa League', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 6, to: 6, label: 'Conference League', color: '#22c55e', dotBg: 'bg-green-500' },
    { from: 18, to: 20, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  SA: [
    // Serie A
    { from: 1, to: 4, label: 'Champions League', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 5, to: 6, label: 'Europa League', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 7, to: 7, label: 'Conference League', color: '#22c55e', dotBg: 'bg-green-500' },
    { from: 18, to: 20, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  BL1: [
    // Bundesliga
    { from: 1, to: 4, label: 'Champions League', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 5, to: 6, label: 'Europa League', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 7, to: 7, label: 'Conference League', color: '#22c55e', dotBg: 'bg-green-500' },
    { from: 16, to: 16, label: 'Playoff descenso', color: '#eab308', dotBg: 'bg-yellow-500' },
    { from: 17, to: 18, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  FL1: [
    // Ligue 1
    { from: 1, to: 3, label: 'Champions League', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 4, to: 5, label: 'Europa League', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 6, to: 6, label: 'Conference League', color: '#22c55e', dotBg: 'bg-green-500' },
    { from: 16, to: 16, label: 'Playoff descenso', color: '#eab308', dotBg: 'bg-yellow-500' },
    { from: 17, to: 18, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  ELC: [
    // Championship (Segunda inglesa)
    { from: 1, to: 2, label: 'Ascenso directo', color: '#22c55e', dotBg: 'bg-green-500' },
    { from: 3, to: 6, label: 'Playoff ascenso', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 22, to: 24, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  PPL: [
    // Primeira Liga
    { from: 1, to: 3, label: 'Champions League', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 4, to: 4, label: 'Europa League', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 5, to: 6, label: 'Conference League', color: '#22c55e', dotBg: 'bg-green-500' },
    { from: 16, to: 18, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  DED: [
    // Eredivisie
    { from: 1, to: 2, label: 'Champions League', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 3, to: 5, label: 'Europa League', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 16, to: 18, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ],

  BSA: [
    // Brasileirao
    { from: 1, to: 6, label: 'Libertadores', color: '#3b82f6', dotBg: 'bg-blue-500' },
    { from: 7, to: 12, label: 'Sudamericana', color: '#f97316', dotBg: 'bg-orange-500' },
    { from: 17, to: 20, label: 'Descenso', color: '#ef4444', dotBg: 'bg-red-500' }
  ]
}

/**
 * Devuelve la zona correspondiente a una posición en una liga concreta.
 * Si la posición no pertenece a ninguna zona especial, devuelve null.
 */
export function getZone(competition: string, position: number): Zone | null {
  const zones = LEAGUE_ZONES[competition] ?? []
  return zones.find(z => position >= z.from && position <= z.to) ?? null
}

/**
 * Devuelve todas las zonas únicas que aparecen en una tabla de clasificación.
 * Se usa para construir la leyenda al pie de la tabla.
 */
export function getLeagueZones(competition: string): Zone[] {
  return LEAGUE_ZONES[competition] ?? []
}
