'use server'

import { auth } from '@/auth'
import { isAdminEmail } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import type { ChannelKey } from '@/lib/channels'
import { revalidatePath } from 'next/cache'

/** Verifica que quien llama es admin. Lanza error si no lo es. */
async function requireAdmin() {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error('No autorizado')
  }
}

/** Guarda el canal de un partido en Supabase */
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

/** Añade un email de admin a la tabla */
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

/** Elimina un email de admin */
export async function removeAdminEmail(email: string) {
  await requireAdmin()
  const db = createAdminClient()
  await db.from('admin_emails').delete().eq('email', email)
  revalidatePath('/admin')
}

/** Obtiene todos los admins de la tabla */
export async function getAdminEmails(): Promise<string[]> {
  await requireAdmin()
  const db = createAdminClient()
  const { data } = await db.from('admin_emails').select('email').order('created_at')
  return (data ?? []).map(r => r.email)
}
