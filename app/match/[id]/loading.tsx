export default function MatchDetailLoading() {
  return (
    <div className='space-y-6 animate-pulse'>
      {/* Botón volver */}
      <div className='h-4 w-24 bg-gray-700 rounded' />

      {/* Cabecera del partido */}
      <div className='bg-gray-800 border border-gray-700 rounded-2xl p-6'>
        <div className='h-3 w-28 bg-gray-700 rounded mx-auto mb-6' />
        <div className='flex items-center justify-between gap-4'>
          <div className='flex flex-col items-center gap-2 flex-1'>
            <div className='w-16 h-16 bg-gray-700 rounded-full' />
            <div className='h-4 w-20 bg-gray-700 rounded' />
          </div>
          <div className='flex flex-col items-center gap-2'>
            <div className='h-10 w-28 bg-gray-700 rounded' />
            <div className='h-3 w-16 bg-gray-700 rounded' />
          </div>
          <div className='flex flex-col items-center gap-2 flex-1'>
            <div className='w-16 h-16 bg-gray-700 rounded-full' />
            <div className='h-4 w-20 bg-gray-700 rounded' />
          </div>
        </div>
      </div>

      {/* Alineaciones */}
      <div className='bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4'>
        <div className='h-5 w-32 bg-gray-700 rounded' />
        <div className='grid grid-cols-2 gap-4'>
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className='flex items-center gap-2'
            >
              <div className='w-6 h-6 bg-gray-700 rounded-full shrink-0' />
              <div className='h-3 flex-1 bg-gray-700 rounded' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
