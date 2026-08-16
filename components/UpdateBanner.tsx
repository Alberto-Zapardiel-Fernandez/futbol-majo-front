/**
 * Banner que aparece en la parte inferior de la pantalla cuando hay
 * una nueva versión de la app disponible.
 *
 * El usuario pulsa "Actualizar" → el SW activa la nueva versión →
 * la página se recarga automáticamente → listo. Sin desinstalar nada.
 */

'use client'

import { useEffect, useState } from 'react'

export default function UpdateBanner() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ registration: ServiceWorkerRegistration }>
      setRegistration(customEvent.detail.registration)
    }

    window.addEventListener('sw-update-available', handleUpdate)
    return () => window.removeEventListener('sw-update-available', handleUpdate)
  }, [])

  const handleUpdate = () => {
    if (!registration?.waiting) return
    // Le decimos al SW en espera que tome el control ahora
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    setRegistration(null)
  }

  if (!registration) return null

  return (
    <div className='fixed bottom-20 md:bottom-4 left-4 right-4 z-50 max-w-sm mx-auto'>
      <div className='bg-gray-800 border border-green-700 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold text-white'>Nueva versión disponible</p>
          <p className='text-xs text-gray-400 mt-0.5'>Pulsa para actualizar la app</p>
        </div>
        <button
          onClick={handleUpdate}
          className='px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors shrink-0'
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}
