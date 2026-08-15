/**
 * Tabla de clasificación profesional con datos completos.
 *
 * Características:
 * - Indicador lateral de zona (Champions, Europa, Conference, Descenso)
 * - Goles a favor en verde, en contra en rojo, diferencia con +/−
 * - Últimas 5 jornadas con círculos coloreados (Victoria, Empate, Derrota)
 * - Responsive: columnas secundarias ocultas en móvil
 * - Leyenda explicativa al pie
 */

'use client'

import Image from 'next/image'
import type { TableEntry } from '@/types'
import { getZone, getLeagueZones, type Zone } from '@/lib/standings'

// ---------------------------------------------------------------------------
// Sub-componente: escudo del equipo
// ---------------------------------------------------------------------------

function TeamLogo({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <span className='text-lg'>⚽</span>
  return (
    <Image
      src={src}
      alt={alt}
      width={22}
      height={22}
      className='object-contain shrink-0'
      onError={e => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: últimas 5 jornadas (forma)
// ---------------------------------------------------------------------------

/**
 * La API devuelve la forma como "W,D,L,W,W".
 * Mostramos los últimos 5 resultados como círculos coloreados.
 */
function FormBadges({ form }: { form: string | null }) {
  // Procesamos la cadena y cogemos los últimos 5 resultados
  const raw = form ? form.split(',').filter(Boolean) : []
  const last5 = raw.slice(-5)

  // Rellenamos con vacíos si hay menos de 5 partidos jugados
  const padded = [...Array(5 - last5.length).fill(''), ...last5]

  const config: Record<string, { bg: string; label: string }> = {
    W: { bg: 'bg-green-500', label: 'Victoria' },
    D: { bg: 'bg-gray-500', label: 'Empate' },
    L: { bg: 'bg-red-500', label: 'Derrota' },
    '': { bg: 'bg-gray-800', label: '' }
  }

  return (
    <div className='flex items-center gap-1'>
      {padded.map((r, i) => {
        const c = config[r] ?? config['']
        return (
          <span
            key={i}
            title={c.label}
            className={`
              inline-block w-2.5 h-2.5 rounded-full ${c.bg}
              ring-1 ring-black/20
            `}
          />
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-componente: diferencia de goles coloreada
// ---------------------------------------------------------------------------

function GoalDiff({ gd }: { gd: number }) {
  if (gd > 0) return <span className='text-green-400 font-semibold'>+{gd}</span>
  if (gd < 0) return <span className='text-red-400 font-semibold'>{gd}</span>
  return <span className='text-gray-600'>0</span>
}

// ---------------------------------------------------------------------------
// Sub-componente: leyenda de zonas al pie de la tabla
// ---------------------------------------------------------------------------

function ZoneLegend({ zones }: { zones: Zone[] }) {
  if (zones.length === 0) return null

  return (
    <div className='flex flex-wrap gap-x-5 gap-y-2 px-1'>
      {zones.map(zone => (
        <div
          key={zone.label}
          className='flex items-center gap-1.5 text-xs text-gray-500'
        >
          <span
            className='inline-block w-2.5 h-2.5 rounded-sm shrink-0'
            style={{ backgroundColor: zone.color }}
          />
          {zone.label}
        </div>
      ))}
      {/* Forma */}
      <div className='flex items-center gap-2.5 text-xs text-gray-500 ml-auto'>
        <span className='flex items-center gap-1'>
          <span className='w-2.5 h-2.5 rounded-full bg-green-500 inline-block ring-1 ring-black/20' />
          Victoria
        </span>
        <span className='flex items-center gap-1'>
          <span className='w-2.5 h-2.5 rounded-full bg-gray-500 inline-block ring-1 ring-black/20' />
          Empate
        </span>
        <span className='flex items-center gap-1'>
          <span className='w-2.5 h-2.5 rounded-full bg-red-500 inline-block ring-1 ring-black/20' />
          Derrota
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

interface StandingsTableProps {
  table: TableEntry[]
  competition: string
}

export default function StandingsTable({ table, competition }: StandingsTableProps) {
  const zones = getLeagueZones(competition)

  return (
    <div className='space-y-3'>
      {/* Tabla */}
      <div className='bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'>
        <table className='w-full text-sm'>
          {/* Cabecera */}
          <thead>
            <tr className='bg-gray-900/80 border-b border-gray-700'>
              {/* Columna de zona (indicador lateral) — invisible pero ocupa espacio */}
              <th className='w-0.5 py-3' />

              {/* Posición */}
              <th className='text-center py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8'>#</th>

              {/* Equipo */}
              <th className='text-left py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Equipo</th>

              {/* Jugados — visible en desktop */}
              <th className='text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8 hidden md:table-cell'>PJ</th>

              {/* Victorias — visible en desktop */}
              <th className='text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8 hidden md:table-cell'>G</th>

              {/* Empates — visible en desktop */}
              <th className='text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8 hidden md:table-cell'>E</th>

              {/* Derrotas — visible en desktop */}
              <th className='text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8 hidden md:table-cell'>P</th>

              {/* Goles a favor — verde */}
              <th className='text-center py-3 px-2 text-xs font-semibold text-green-600 uppercase tracking-wider w-9 hidden sm:table-cell'>GF</th>

              {/* Goles en contra — rojo */}
              <th className='text-center py-3 px-2 text-xs font-semibold text-red-700 uppercase tracking-wider w-9 hidden sm:table-cell'>GC</th>

              {/* Diferencia de goles */}
              <th className='text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10'>DG</th>

              {/* Puntos — siempre visible, destacado */}
              <th className='text-center py-3 px-3 text-xs font-semibold text-white uppercase tracking-wider w-10'>Pts</th>

              {/* Forma — visible en desktop */}
              <th className='text-left py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell'>Forma</th>
            </tr>
          </thead>

          {/* Cuerpo */}
          <tbody className='divide-y divide-gray-700/50'>
            {table.map((entry, index) => {
              const zone = getZone(competition, entry.position)

              // Separadores visuales entre zonas
              // Si la siguiente fila empieza una zona nueva, añadimos un borde más grueso
              const nextEntry = table[index + 1]
              const nextZone = nextEntry ? getZone(competition, nextEntry.position) : null
              const isZoneBoundary = zone?.label !== nextZone?.label

              return (
                <tr
                  key={entry.team.id}
                  className={`
                    group hover:bg-gray-700/30 transition-colors
                    ${isZoneBoundary ? 'border-b-2 border-gray-700' : ''}
                  `}
                >
                  {/*
                    Indicador lateral de zona: una línea de 3px de ancho con el color
                    de la zona europea/descenso. Si no hay zona, es transparente.
                    Colocamos el color en el estilo inline porque necesitamos el hex
                    exacto, no una clase Tailwind predefinida.
                  */}
                  <td className='w-0.5 p-0'>
                    <div
                      className='w-0.5 h-full min-h-[52px]'
                      style={{ backgroundColor: zone?.color ?? 'transparent' }}
                    />
                  </td>

                  {/* Posición */}
                  <td className='text-center py-3 px-3 w-8'>
                    <span
                      className={`
                      text-sm font-bold
                      ${entry.position <= 3 ? 'text-white' : 'text-gray-400'}
                    `}
                    >
                      {entry.position}
                    </span>
                  </td>

                  {/* Equipo: logo + nombre */}
                  <td className='py-3 pr-4'>
                    <div className='flex items-center gap-2.5'>
                      <TeamLogo
                        src={entry.team.crest}
                        alt={entry.team.name}
                      />
                      {/* Nombre completo en desktop, abreviado en móvil */}
                      <span className='font-medium text-gray-200 truncate hidden md:block max-w-[180px]'>{entry.team.name}</span>
                      <span className='font-medium text-gray-200 truncate md:hidden max-w-[120px]'>{entry.team.shortName}</span>
                    </div>
                  </td>

                  {/* PJ */}
                  <td className='text-center py-3 px-2 text-sm text-gray-400 hidden md:table-cell'>{entry.playedGames}</td>

                  {/* G */}
                  <td className='text-center py-3 px-2 text-sm text-gray-300 hidden md:table-cell'>{entry.won}</td>

                  {/* E */}
                  <td className='text-center py-3 px-2 text-sm text-gray-400 hidden md:table-cell'>{entry.draw}</td>

                  {/* P */}
                  <td className='text-center py-3 px-2 text-sm text-gray-400 hidden md:table-cell'>{entry.lost}</td>

                  {/* GF — verde */}
                  <td className='text-center py-3 px-2 text-sm font-medium text-green-400 hidden sm:table-cell'>{entry.goalsFor}</td>

                  {/* GC — rojo */}
                  <td className='text-center py-3 px-2 text-sm font-medium text-red-400 hidden sm:table-cell'>{entry.goalsAgainst}</td>

                  {/* DG */}
                  <td className='text-center py-3 px-2 text-sm'>
                    <GoalDiff gd={entry.goalDifference} />
                  </td>

                  {/* PTS — el dato más importante */}
                  <td className='text-center py-3 px-3'>
                    <span className='text-base font-black text-white'>{entry.points}</span>
                  </td>

                  {/* Forma */}
                  <td className='py-3 pr-4 hidden md:table-cell'>
                    <FormBadges form={entry.form} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda de zonas */}
      <ZoneLegend zones={zones} />
    </div>
  )
}
