'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Match } from '@/types'
import type { ChannelKey } from '@/lib/channels'
import { CHANNEL_LIST } from '@/lib/channels'
import { saveMatchChannel, syncLeagueNow } from '@/app/admin/actions'
import ChannelBadge from '@/components/ChannelBadge'
import Image from 'next/image'

interface AdminChannelsProps {
  matches: Match[]
  channelMap: Record<number, ChannelKey>
  currentMatchDay: number
  totalMatchDays: number
}

function formatDateTime(utcDate: string) {
  return new Date(utcDate).toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })
}

export default function AdminChannels({ matches, channelMap, currentMatchDay, totalMatchDays }: AdminChannelsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saving, setSaving] = useState<number | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  const handleChannelChange = (matchId: number, channel: string) => {
    setSaving(matchId)
    startTransition(async () => {
      try {
        await saveMatchChannel(matchId, channel === '' ? null : (channel as ChannelKey))
        router.refresh()
      } finally {
        setSaving(null)
      }
    })
  }

  /**
   * Sync usando Server Action — la clave ADMIN_SYNC_KEY nunca sale del servidor.
   */
  const handleForceSyncPD = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const msg = await syncLeagueNow('PD')
      setSyncMsg(`✓ ${msg}`)
      router.refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      setSyncMsg(`✗ ${msg}`)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 5000)
    }
  }

  return (
    <div className='space-y-4'>
      {/* Cabecera con botón sync */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-lg font-bold text-white'>Canales TV — LaLiga</h2>
          <p className='text-xs text-gray-500 mt-0.5'>Asigna el canal donde se verá cada partido.</p>
        </div>

        <div className='flex flex-col items-end gap-1.5 shrink-0'>
          <button
            onClick={handleForceSyncPD}
            disabled={syncing}
            className='flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-600
                       disabled:opacity-60 text-white text-xs font-bold rounded-lg
                       transition-colors whitespace-nowrap'
          >
            {syncing ? (
              <>
                <div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Sincronizando...
              </>
            ) : (
              '⚡ Sync LaLiga ahora'
            )}
          </button>
          {syncMsg && <span className={`text-xs ${syncMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{syncMsg}</span>}
        </div>
      </div>

      {/* Navegador jornada */}
      <div className='flex items-center gap-3 bg-gray-800/60 rounded-xl px-4 py-2.5 w-fit'>
        <a
          href={`/admin?seccion=canales&jornada=${Math.max(1, currentMatchDay - 1)}`}
          className={`text-gray-400 hover:text-white text-xl px-1 leading-none
            ${currentMatchDay <= 1 ? 'opacity-30 pointer-events-none' : ''}`}
        >
          ‹
        </a>
        <span className='text-sm font-bold text-white min-w-[90px] text-center'>
          Jornada {currentMatchDay}
          <span className='text-gray-600 font-normal'> / {totalMatchDays}</span>
        </span>
        <a
          href={`/admin?seccion=canales&jornada=${Math.min(totalMatchDays, currentMatchDay + 1)}`}
          className={`text-gray-400 hover:text-white text-xl px-1 leading-none
            ${currentMatchDay >= totalMatchDays ? 'opacity-30 pointer-events-none' : ''}`}
        >
          ›
        </a>
      </div>

      {/* Partidos */}
      {matches.length === 0 ? (
        <div className='text-center py-12 text-gray-600'>
          <p className='text-3xl mb-3'>📭</p>
          <p>No hay partidos en esta jornada</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {matches.map(match => {
            const currentChannel = (channelMap as Record<number, ChannelKey | undefined>)[match.id] ?? ''
            const isSaving = saving === match.id

            return (
              <div
                key={match.id}
                className='flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-3'
              >
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  {match.homeTeam.crest && (
                    <Image
                      src={match.homeTeam.crest}
                      alt={match.homeTeam.shortName}
                      width={18}
                      height={18}
                      className='object-contain shrink-0'
                    />
                  )}
                  <span className='text-sm font-medium text-white truncate'>{match.homeTeam.shortName}</span>
                  <span className='text-gray-600 text-xs shrink-0'>vs</span>
                  <span className='text-sm font-medium text-white truncate'>{match.awayTeam.shortName}</span>
                  {match.awayTeam.crest && (
                    <Image
                      src={match.awayTeam.crest}
                      alt={match.awayTeam.shortName}
                      width={18}
                      height={18}
                      className='object-contain shrink-0'
                    />
                  )}
                </div>

                <span className='text-xs text-gray-500 shrink-0 hidden sm:block'>{formatDateTime(match.utcDate)}</span>

                {currentChannel && <ChannelBadge channel={currentChannel as ChannelKey} />}

                <select
                  value={currentChannel}
                  onChange={e => handleChannelChange(match.id, e.target.value)}
                  disabled={isSaving || pending}
                  className='bg-gray-700 border border-gray-600 text-sm text-white rounded-lg
                             px-2 py-1.5 min-w-[120px] focus:outline-none focus:ring-1
                             focus:ring-green-500 disabled:opacity-50'
                >
                  <option value=''>— Sin canal —</option>
                  {CHANNEL_LIST.map(ch => (
                    <option
                      key={ch.key}
                      value={ch.key}
                    >
                      {ch.label}
                    </option>
                  ))}
                </select>

                {isSaving && <div className='w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin shrink-0' />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
