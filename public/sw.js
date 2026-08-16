const CACHE_NAME = 'futbol-majo-v2' // ← incrementar versión en cada deploy importante
const PRECACHE_URLS = ['/', '/standings']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    // NO llamamos a skipWaiting aquí — esperamos confirmación del usuario
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

/**
 * Cuando el banner de actualización llama a registration.waiting.postMessage,
 * el SW activa la nueva versión y le dice a todos los tabs que recarguen.
 */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (url.hostname.includes('onrender.com') || url.hostname.includes('football-data')) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request).then(cached => cached ?? caches.match('/'))))
    return
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        return response
      })
    })
  )
})
