/**
 * Registra el Service Worker y emite un evento global cuando hay
 * una nueva versión disponible para que el UpdateBanner lo muestre.
 */

'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then(registration => {
      // Comprueba si hay una actualización disponible cada vez que la página carga
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          // El nuevo SW está listo pero esperando — hay un controlador activo
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Emitimos un evento global para que UpdateBanner lo reciba
            window.dispatchEvent(new CustomEvent('sw-update-available', { detail: { registration } }))
          }
        })
      })

      // Cuando el SW activa la nueva versión, recargamos la página
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    })
  }, [])

  return null
}
