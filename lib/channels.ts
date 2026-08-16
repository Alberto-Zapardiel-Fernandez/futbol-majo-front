export type ChannelKey = 'DAZN' | 'MOVISTAR_PLUS' | 'PRIME_VIDEO' | 'RTVE_PLAY' | 'CANAL_PLUS'

export interface Channel {
  key: ChannelKey
  label: string
  shortLabel: string
  logo: string // Ruta al SVG en /public/channels/
  bg: string // Color de fondo para el contenedor del logo
}

export const CHANNELS: Record<ChannelKey, Channel> = {
  DAZN: {
    key: 'DAZN',
    label: 'DAZN',
    shortLabel: 'DAZN',
    logo: '/channels/dazn.svg',
    bg: '#F5FF00'
  },
  MOVISTAR_PLUS: {
    key: 'MOVISTAR_PLUS',
    label: 'Movistar+',
    shortLabel: 'M+',
    logo: '/channels/movistar.svg',
    bg: '#019DF4'
  },
  PRIME_VIDEO: {
    key: 'PRIME_VIDEO',
    label: 'Prime Video',
    shortLabel: 'Prime',
    logo: '/channels/prime.svg',
    bg: '#232F3E'
  },
  RTVE_PLAY: {
    key: 'RTVE_PLAY',
    label: 'RTVE Play',
    shortLabel: 'RTVE',
    logo: '/channels/rtve.svg',
    bg: '#E62929'
  },
  CANAL_PLUS: {
    key: 'CANAL_PLUS',
    label: 'Canal+',
    shortLabel: 'C+',
    logo: '/channels/canalplus.svg',
    bg: '#111111'
  }
}

export const CHANNEL_LIST = Object.values(CHANNELS)
