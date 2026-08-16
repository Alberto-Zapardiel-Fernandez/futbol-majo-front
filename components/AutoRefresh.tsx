/**
 * Componente invisible que refresca los datos de la página automáticamente.
 *
 * ¿Cómo funciona?
 * - router.refresh() le dice a Next.js que vuelva a ejecutar los Server Components
 *   de la página actual (getMatches, getLeagues...) sin recargar el navegador.
 * - Es como pulsar F5 pero solo para los datos, no para el estado del cliente.
 * - Se ejecuta cada `intervalMs` milisegundos (por defecto 5 minutos,
 *   sincronizado con el scheduler del backend).
 *
 * No renderiza nada visible — es pura lógica de refresco.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AutoRefreshProps {
  /** Intervalo de refresco en milisegundos. Default: 5 minutos. */
  intervalMs?: number
}

export default function AutoRefresh({ intervalMs = 300_000 }: AutoRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, intervalMs)

    // Cleanup: cancelamos el intervalo si el usuario navega a otra página
    return () => clearInterval(interval)
  }, [router, intervalMs])

  // No renderiza nada
  return null
}
