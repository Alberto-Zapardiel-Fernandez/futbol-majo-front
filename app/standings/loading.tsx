/**
 * Pantalla de carga de la página de clasificación.
 * Misma lógica que app/loading.tsx — Next.js la muestra automáticamente.
 */

export default function StandingsLoading() {
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

      {/* Cabecera */}
      <div className='flex items-center justify-between animate-pulse'>
        <div className='h-7 w-44 bg-gray-700 rounded' />
        <div className='h-3 w-16 bg-gray-700 rounded' />
      </div>

      {/* Tabla skeleton */}
      <div className='bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'>
        {/* Fila cabecera */}
        <div className='bg-gray-900/80 border-b border-gray-700 px-4 py-3 animate-pulse'>
          <div className='h-3 w-full bg-gray-700 rounded' />
        </div>

        {/* 20 filas de equipo */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className='flex items-center gap-3 px-4 py-3 border-b border-gray-700/50 last:border-0 animate-pulse'
          >
            {/* Indicador zona */}
            <div className='w-0.5 h-5 bg-gray-700 rounded' />
            {/* Posición */}
            <div className='w-5 h-4 bg-gray-700 rounded' />
            {/* Logo */}
            <div className='w-6 h-6 bg-gray-700 rounded-full shrink-0' />
            {/* Nombre equipo */}
            <div className='flex-1 h-4 bg-gray-700 rounded' />
            {/* Stats (desktop) */}
            <div className='hidden md:block w-6 h-4 bg-gray-700 rounded' />
            <div className='hidden md:block w-6 h-4 bg-gray-700 rounded' />
            <div className='hidden md:block w-6 h-4 bg-gray-700 rounded' />
            <div className='hidden md:block w-6 h-4 bg-gray-700 rounded' />
            {/* GF/GC */}
            <div className='hidden sm:block w-6 h-4 bg-gray-700 rounded' />
            <div className='hidden sm:block w-6 h-4 bg-gray-700 rounded' />
            {/* DG */}
            <div className='w-8 h-4 bg-gray-700 rounded' />
            {/* Pts */}
            <div className='w-8 h-5 bg-gray-600 rounded' />
            {/* Forma */}
            <div className='hidden md:flex gap-1'>
              {[...Array(5)].map((_, j) => (
                <div
                  key={j}
                  className='w-2.5 h-2.5 bg-gray-700 rounded-full'
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
