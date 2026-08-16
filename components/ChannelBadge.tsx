import type { ChannelKey } from '@/lib/channels'
import { CHANNELS } from '@/lib/channels'

interface ChannelBadgeProps {
  channel: ChannelKey
}

/**
 * Badge del canal. Ocupa todo el alto disponible (self-stretch del padre)
 * y se centra verticalmente. Ancho fijo de 48px.
 */
export default function ChannelBadge({ channel }: ChannelBadgeProps) {
  const cfg = CHANNELS[channel]
  if (!cfg) return null

  return (
    <div
      className='w-12 flex items-center justify-center'
      style={{ minHeight: '52px' }}
      title={cfg.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cfg.logo}
        alt={cfg.label}
        style={{ width: '44px', height: '44px', objectFit: 'contain' }}
      />
    </div>
  )
}
