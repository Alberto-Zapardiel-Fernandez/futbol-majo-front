/**
 * Pantalla de carga de la página principal.
 *
 * Next.js muestra este componente AUTOMÁTICAMENTE mientras el Server Component
 * de page.tsx está obteniendo los datos del backend. En cuanto llegan los datos,
 * lo reemplaza con el contenido real sin ningún código extra de nuestra parte.
 *
 * El resultado: el usuario ve estructura inmediatamente en vez de pantalla en blanco.
 */

import MatchCardSkeleton from '@/components/MatchCardSkeleton'

export default function Loading() {
  return (
    <div className='space-y-5'>
      {/* Selector de ligas skeleton */}
      <div>
        <div className='h-3 w-20 bg-gray-700 rounded mb-3 animate-pulse' />
        <div className='flex gap-2 overflow-hidden pb-2'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-9 w-32 bg-gray-800 border border-gray-700 rounded-lg animate-pulse shrink-0'
            />
          ))}
        </div>
      </div>

      {/* Cabecera: título + contador */}
      <div className='flex items-center justify-between animate-pulse'>
        <div className='h-7 w-44 bg-gray-700 rounded' />
        <div className='h-3 w-16 bg-gray-700 rounded' />
      </div>

      {/* Navegador de jornada */}
      <div className='bg-gray-800/60 rounded-xl px-4 py-3 flex items-center justify-between animate-pulse'>
        <div className='w-9 h-9 bg-gray-700 rounded-lg' />
        <div className='flex flex-col items-center gap-1.5'>
          <div className='h-3 w-14 bg-gray-700 rounded' />
          <div className='h-7 w-6 bg-gray-600 rounded' />
          <div className='h-3 w-10 bg-gray-700 rounded' />
        </div>
        <div className='w-9 h-9 bg-gray-700 rounded-lg' />
      </div>

      {/* 8 tarjetas de partido skeleton */}
      <div className='space-y-3'>
        {[...Array(8)].map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
