/**
 * Registra el Service Worker cuando la app carga en el navegador.
 *
 * Debe ser un Client Component ('use client') porque necesita acceso
 * a APIs del navegador (navigator.serviceWorker) que no existen en el servidor.
 *
 * No renderiza nada visible — es pura lógica de registro.
 */

'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Solo en producción y si el navegador soporta Service Workers
    // (todos los navegadores modernos lo soportan)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registrado:', registration.scope)
        })
        .catch(error => {
          console.error('Error registrando SW:', error)
        })
    }
  }, [])

  return null
}
