/**
 * Refresca los datos cada 60 segundos pero solo cuando la pestaña está activa.
 * Si el usuario tiene la app en segundo plano no consume batería/red.
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) router.refresh()
    }
    const interval = setInterval(refresh, intervalMs)
    return () => clearInterval(interval)
  }, [router, intervalMs])

  return null
}
