import { createClient } from '@supabase/supabase-js'
import type { ChannelKey } from './channels'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Cliente público — solo lectura, seguro en el navegador */
export const supabase = createClient(url, anon)

/**
 * Crea un cliente con privilegios de servicio.
 * SOLO usar en Server Actions / Route Handlers (nunca exponer al cliente).
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  return createClient(url, serviceKey)
}

/** Obtiene los canales asignados para una lista de IDs de partido */
export async function getMatchChannels(matchIds: number[]): Promise<Record<number, ChannelKey>> {
  if (matchIds.length === 0) return {}

  const { data, error } = await supabase.from('match_channels').select('match_id, channel').in('match_id', matchIds)

  if (error || !data) return {}

  return Object.fromEntries(data.map(row => [row.match_id, row.channel as ChannelKey]))
}
