import type { ChannelKey } from '@/lib/channels'
import { CHANNELS } from '@/lib/channels'

interface ChannelBadgeProps {
  channel: ChannelKey
  size?: 'sm' | 'md'
}

/**
 * Badge del canal de TV con colores de marca.
 * Se muestra en la tarjeta de partido y en el panel admin.
 */
export default function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
  const cfg = CHANNELS[channel]
  if (!cfg) return null

  return (
    <span
      className={`
        inline-flex items-center justify-center font-black rounded
        border tracking-tight leading-none
        ${cfg.bg} ${cfg.text} ${cfg.border}
        ${size === 'sm' ? 'text-[9px] px-1 py-0.5 min-w-[28px]' : 'text-xs px-2 py-1 min-w-[40px]'}
      `}
    >
      {size === 'sm' ? cfg.shortLabel : cfg.label}
    </span>
  )
}
