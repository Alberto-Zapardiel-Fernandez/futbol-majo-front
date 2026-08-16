/**
 * Versión "fantasma" de una tarjeta de partido.
 * Misma estructura visual que MatchCard pero con bloques grises animados.
 * animate-pulse hace que los bloques "respiren" suavemente — efecto shimmer.
 */
export default function MatchCardSkeleton() {
  return (
    <div className='bg-gray-800 border border-gray-700 rounded-xl p-4 animate-pulse'>
      {/* Cabecera: jornada + fecha */}
      <div className='flex justify-between mb-3'>
        <div className='h-3 w-16 bg-gray-700 rounded' />
        <div className='h-3 w-20 bg-gray-700 rounded' />
      </div>

      {/* Equipos y marcador/hora */}
      <div className='flex items-center gap-3'>
        {/* Equipo local */}
        <div className='flex flex-col items-center gap-1.5 flex-1'>
          <div className='w-9 h-9 bg-gray-700 rounded-full' />
          <div className='h-3 w-14 bg-gray-700 rounded' />
        </div>

        {/* Centro: hora o marcador */}
        <div className='flex flex-col items-center gap-2 min-w-[100px]'>
          <div className='h-8 w-24 bg-gray-700 rounded' />
          <div className='h-3 w-10 bg-gray-700 rounded' />
        </div>

        {/* Equipo visitante */}
        <div className='flex flex-col items-center gap-1.5 flex-1'>
          <div className='w-9 h-9 bg-gray-700 rounded-full' />
          <div className='h-3 w-14 bg-gray-700 rounded' />
        </div>
      </div>
    </div>
  )
}
