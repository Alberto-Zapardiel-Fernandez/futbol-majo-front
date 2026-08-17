/**
 * Skeleton de la página En Vivo — Next.js lo muestra automáticamente
 * mientras se obtienen los datos del servidor.
 */
export default function LiveLoading() {
  return (
    <div className='space-y-6'>
      {/* Cabecera */}
      <div className='animate-pulse'>
        <div className='h-7 w-48 bg-gray-700 rounded mb-1' />
        <div className='h-3 w-36 bg-gray-800 rounded' />
      </div>

      {/* Grupo 1 */}
      <div className='space-y-3'>
        <div className='h-4 w-32 bg-gray-700 rounded animate-pulse' />
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className='bg-gray-800 border border-gray-700 rounded-xl p-3 animate-pulse'
          >
            <div className='h-2.5 w-16 bg-gray-700 rounded mb-3' />
            <div className='flex items-center gap-2'>
              <div className='flex flex-col items-center gap-1 flex-1'>
                <div className='w-9 h-9 bg-gray-700 rounded-full' />
                <div className='h-2.5 w-14 bg-gray-700 rounded' />
              </div>
              <div className='flex flex-col items-center gap-2 min-w-[90px]'>
                <div className='h-8 w-20 bg-gray-700 rounded' />
                <div className='h-2.5 w-12 bg-gray-700 rounded' />
              </div>
              <div className='flex flex-col items-center gap-1 flex-1'>
                <div className='w-9 h-9 bg-gray-700 rounded-full' />
                <div className='h-2.5 w-14 bg-gray-700 rounded' />
              </div>
              <div className='w-12' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
