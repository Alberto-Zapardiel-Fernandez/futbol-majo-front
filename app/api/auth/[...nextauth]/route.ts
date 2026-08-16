/**
 * Rutas API que NextAuth necesita para funcionar.
 * Manejan: login, logout, callbacks de Google, sesión...
 * No hay que tocar este fichero nunca.
 */

import { handlers } from '@/auth'
export const { GET, POST } = handlers
