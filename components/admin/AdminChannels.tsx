'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Match } from '@/types'
import type { ChannelKey } from '@/lib/channels'
import { CHANNEL_LIST } from '@/lib/channels'
import { saveMatchChannel } from '@/app/admin/actions'
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

  return (
    <div className='space-y-4'>
      {/* Cabecera con selector de jornada */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold text-white'>Canales TV — LaLiga</h2>
          <p className='text-xs text-gray-500 mt-0.5'>Asigna el canal donde se verá cada partido. Se muestra en la app automáticamente.</p>
        </div>
      </div>

      {/* Navegador de jornada */}
      <div className='flex items-center gap-3 bg-gray-800/60 rounded-xl px-4 py-2.5 w-fit'>
        <a
          href={`/admin?seccion=canales&jornada=${Math.max(1, currentMatchDay - 1)}`}
          className={`text-gray-400 hover:text-white text-lg px-1 ${currentMatchDay <= 1 ? 'opacity-30 pointer-events-none' : ''}`}
        >
          ‹
        </a>
        <span className='text-sm font-bold text-white min-w-[80px] text-center'>
          Jornada {currentMatchDay}
          <span className='text-gray-600 font-normal'> / {totalMatchDays}</span>
        </span>
        <a
          href={`/admin?seccion=canales&jornada=${Math.min(totalMatchDays, currentMatchDay + 1)}`}
          className={`text-gray-400 hover:text-white text-lg px-1 ${currentMatchDay >= totalMatchDays ? 'opacity-30 pointer-events-none' : ''}`}
        >
          ›
        </a>
      </div>

      {/* Lista de partidos */}
      {matches.length === 0 ? (
        <div className='text-center py-12 text-gray-600'>
          <p className='text-3xl mb-3'>📭</p>
          <p>No hay partidos en esta jornada</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {matches.map(match => {
            const currentChannel = channelMap[match.id] ?? ''
            const isSaving = saving === match.id

            return (
              <div
                key={match.id}
                className='flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-3'
              >
                {/* Equipos */}
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  {match.homeTeam.crest && (
                    <Image
                      src={match.homeTeam.crest}
                      alt={match.homeTeam.shortName}
                      width={20}
                      height={20}
                      className='object-contain shrink-0'
                    />
                  )}
                  <span className='text-sm font-medium text-white truncate'>{match.homeTeam.shortName}</span>
                  <span className='text-gray-600 text-xs shrink-0'>vs</span>
                  <span className='text-sm font-medium text-white truncate'>{match.awayTeam.shortName}</span>
                  {match.homeTeam.crest && (
                    <Image
                      src={match.awayTeam.crest}
                      alt={match.awayTeam.shortName}
                      width={20}
                      height={20}
                      className='object-contain shrink-0'
                    />
                  )}
                </div>

                {/* Fecha y hora */}
                <span className='text-xs text-gray-500 shrink-0 hidden sm:block'>{formatDateTime(match.utcDate)}</span>

                {/* Badge actual */}
                {currentChannel && (
                  <ChannelBadge
                    channel={currentChannel as ChannelKey}
                    size='sm'
                  />
                )}

                {/* Selector de canal */}
                <select
                  value={currentChannel}
                  onChange={e => handleChannelChange(match.id, e.target.value)}
                  disabled={isSaving || pending}
                  className={`
                    bg-gray-700 border border-gray-600 text-sm text-white rounded-lg
                    px-2 py-1.5 min-w-[110px] focus:outline-none focus:ring-1 focus:ring-green-500
                    disabled:opacity-50 transition-opacity
                  `}
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
