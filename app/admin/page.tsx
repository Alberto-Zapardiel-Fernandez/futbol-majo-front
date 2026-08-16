export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAdminEmail } from '@/lib/auth'
import AdminChannels from '@/components/admin/AdminChannels'
import AdminEmails from '@/components/admin/AdminEmails'
import { getAdminEmails } from '@/app/admin/actions'
import { getMatches } from '@/lib/api'
import { getMatchChannels } from '@/lib/supabase'

/**
 * Panel de administración.
 * Solo accesible para emails definidos en ADMIN_EMAILS o en la tabla admin_emails.
 * El middleware ya protege la ruta — esta comprobación es doble seguridad.
 */
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ seccion?: string; jornada?: string }> }) {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) redirect('/')

  const { seccion = 'canales', jornada = '1' } = await searchParams
  const matchDay = Math.max(1, parseInt(jornada, 10) || 1)

  // Cargamos datos necesarios según la sección activa
  const matchesPage = seccion === 'canales' ? await getMatches({ competition: 'PD', matchDay, size: 20 }).catch(() => null) : null

  const channelMap = matchesPage ? await getMatchChannels(matchesPage.content.map(m => m.id)) : {}

  const adminEmails = seccion === 'admins' ? await getAdminEmails().catch(() => []) : []

  const envAdmins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

  return (
    <div className='min-h-[calc(100vh-64px)]'>
      {/* Cabecera del panel */}
      <div className='mb-6'>
        <h1 className='text-2xl font-black text-white flex items-center gap-2'>⚙️ Panel de Administración</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Sesión activa: <span className='text-gray-300'>{session?.user?.email}</span>
        </p>
      </div>

      {/* Layout: sidebar izquierdo + línea divisoria + contenido */}
      <div className='flex gap-0'>
        {/* ── Sidebar izquierdo ─────────────────────────────────────── */}
        <aside className='w-44 shrink-0 pr-5'>
          <nav className='flex flex-col gap-1'>
            {[
              { key: 'canales', label: '📺 Canales TV', desc: 'Asignar canal por partido' },
              { key: 'admins', label: '👤 Admins', desc: 'Gestionar administradores' }
            ].map(item => (
              <a
                key={item.key}
                href={`/admin?seccion=${item.key}`}
                className={`
                  flex flex-col px-3 py-2.5 rounded-lg text-sm transition-all
                  ${
                    seccion === item.key
                      ? 'bg-green-900/40 text-green-300 border border-green-800/60'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                  }
                `}
              >
                <span className='font-semibold'>{item.label}</span>
                <span className='text-[10px] text-gray-600 mt-0.5'>{item.desc}</span>
              </a>
            ))}
          </nav>

          {/* Enlace externo para consultar los canales */}
          <div className='mt-6 pt-4 border-t border-gray-800'>
            <p className='text-[10px] text-gray-600 mb-2 uppercase tracking-wider font-semibold'>Consultar programación</p>
            <div className='flex flex-col gap-1.5'>
              <a
                href='https://www.laliga.com/es-ES/laliga-easports/calendario'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1'
              >
                📅 LaLiga Calendario
              </a>
              <a
                href='https://www.dazn.com/es-ES/schedule'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1'
              >
                📺 DAZN Schedule
              </a>
              <a
                href='https://www.movistarplus.es/guia-tv'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1'
              >
                📺 Movistar+ Guía
              </a>
            </div>
          </div>
        </aside>

        {/* Línea divisoria vertical */}
        <div className='w-px bg-gray-800 mx-0' />

        {/* ── Contenido principal ──────────────────────────────────── */}
        <main className='flex-1 pl-6'>
          {seccion === 'canales' && (
            <AdminChannels
              matches={matchesPage?.content ?? []}
              channelMap={channelMap}
              currentMatchDay={matchDay}
              totalMatchDays={38}
            />
          )}
          {seccion === 'admins' && (
            <AdminEmails
              envAdmins={envAdmins}
              dbAdmins={adminEmails}
            />
          )}
        </main>
      </div>
    </div>
  )
}
