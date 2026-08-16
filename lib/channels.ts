/**
 * Canales de TV soportados con sus colores de marca.
 * Usamos badges estilizados en lugar de imágenes externas
 * para evitar problemas de copyright y links rotos.
 */

export type ChannelKey = 'DAZN' | 'MOVISTAR_PLUS' | 'PRIME_VIDEO' | 'RTVE_PLAY' | 'CANAL_PLUS'

export interface Channel {
  key: ChannelKey
  label: string
  shortLabel: string
  bg: string // Tailwind bg class
  text: string // Tailwind text class
  border: string // Tailwind border class
}

export const CHANNELS: Record<ChannelKey, Channel> = {
  DAZN: {
    key: 'DAZN',
    label: 'DAZN',
    shortLabel: 'DAZN',
    bg: 'bg-[#F5FF00]',
    text: 'text-black',
    border: 'border-[#d4dd00]'
  },
  MOVISTAR_PLUS: {
    key: 'MOVISTAR_PLUS',
    label: 'Movistar+',
    shortLabel: 'M+',
    bg: 'bg-[#019df4]',
    text: 'text-white',
    border: 'border-[#0182cc]'
  },
  PRIME_VIDEO: {
    key: 'PRIME_VIDEO',
    label: 'Prime Video',
    shortLabel: 'Prime',
    bg: 'bg-[#00A8E0]',
    text: 'text-white',
    border: 'border-[#007faa]'
  },
  RTVE_PLAY: {
    key: 'RTVE_PLAY',
    label: 'RTVE Play',
    shortLabel: 'RTVE',
    bg: 'bg-red-700',
    text: 'text-white',
    border: 'border-red-900'
  },
  CANAL_PLUS: {
    key: 'CANAL_PLUS',
    label: 'Canal+',
    shortLabel: 'C+',
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-600'
  }
}

export const CHANNEL_LIST = Object.values(CHANNELS)
