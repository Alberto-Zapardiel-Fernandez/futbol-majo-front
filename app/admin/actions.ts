'use server'

import { auth } from '@/auth'
import { isAdminEmail } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import type { ChannelKey } from '@/lib/channels'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error('No autorizado')
  }
}

export async function saveMatchChannel(matchId: number, channel: ChannelKey | null) {
  await requireAdmin()
  const db = createAdminClient()

  if (channel === null) {
    await db.from('match_channels').delete().eq('match_id', matchId)
  } else {
    await db.from('match_channels').upsert({
      match_id: matchId,
      channel,
      updated_at: new Date().toISOString()
    })
  }

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function addAdminEmail(email: string) {
  await requireAdmin()
  const session = await auth()
  const db = createAdminClient()

  const normalized = email.trim().toLowerCase()
  if (!normalized.includes('@')) throw new Error('Email inválido')

  await db.from('admin_emails').upsert({
    email: normalized,
    added_by: session?.user?.email ?? 'unknown',
    created_at: new Date().toISOString()
  })

  revalidatePath('/admin')
}

export async function removeAdminEmail(email: string) {
  await requireAdmin()
  const db = createAdminClient()
  await db.from('admin_emails').delete().eq('email', email)
  revalidatePath('/admin')
}

export async function getAdminEmails(): Promise<string[]> {
  await requireAdmin()
  const db = createAdminClient()
  const { data } = await db.from('admin_emails').select('email').order('created_at')
  return (data ?? []).map(r => r.email)
}

/**
 * Dispara un sync inmediato de una liga.
 * Se ejecuta en el servidor — la clave nunca se expone al cliente.
 */
export async function syncLeagueNow(league: string): Promise<string> {
  await requireAdmin()

  const backendUrl = process.env.NEXT_PUBLIC_API_URL
  const syncKey = process.env.ADMIN_SYNC_KEY // Solo server-side

  if (!syncKey) {
    throw new Error('ADMIN_SYNC_KEY no configurada en las variables de entorno del servidor')
  }

  const res = await fetch(`${backendUrl}/admin/sync-now?league=${league.toUpperCase()}&adminKey=${syncKey}`, { method: 'POST', cache: 'no-store' })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error del backend: ${res.status} — ${text}`)
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return `Sync completado para ${league.toUpperCase()}`
}
