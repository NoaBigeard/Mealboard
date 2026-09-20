const CACHE_NAME = 'mealboard-v1'

self.addEventListener('install', (event) => {
  const basePath = new URL('./', self.registration.scope).pathname
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([basePath, `${basePath}Planning`])),
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)))
})
