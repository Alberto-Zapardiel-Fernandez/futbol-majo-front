/**
 * Badge del canal de TV usando el logo SVG oficial.
 * Muestra el logo como imagen en un contenedor del color de la marca.
 */

import type { ChannelKey } from '@/lib/channels'
import { CHANNELS } from '@/lib/channels'

interface ChannelBadgeProps {
  channel: ChannelKey
  size?: 'sm' | 'md'
}

export default function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
  const cfg = CHANNELS[channel]
  if (!cfg) return null

  const isSmall = size === 'sm'

  return (
    <div
      className={`
        flex items-center justify-center rounded overflow-hidden
        ${isSmall ? 'w-10 h-6' : 'w-16 h-9'}
      `}
      title={cfg.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cfg.logo}
        alt={cfg.label}
        className='w-full h-full object-contain'
      />
    </div>
  )
}
