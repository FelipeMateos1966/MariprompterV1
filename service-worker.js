const CACHE_NAME = 'mariprompter-cache-v1';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  // Agrega aquí todas las rutas a tus iconos
  'images/icon-192.png',
  'images/icon-512.png',
  // Si tu CSS es externo, añade su ruta (actualmente está inline, lo cual está bien)
  // Si tu JS es externo (aparte del service worker), añade su ruta
];

// Evento 'install': Se ejecuta cuando el Service Worker se instala
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': Intercepta las solicitudes de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si el recurso está en caché, lo devuelve
        if (response) {
          return response;
        }
        // Si no está en caché, lo busca en la red
        return fetch(event.request)
          .then((networkResponse) => {
            // Si la respuesta de la red es válida, la guarda en caché y la devuelve
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          });
      })
      .catch(() => {
        // Esto se ejecuta si la red falla y el recurso no está en caché
        // Puedes devolver una página offline aquí si lo deseas
        console.log('Error fetching, returning offline page (if available)');
        // return caches.match('/offline.html'); // Ejemplo para una página offline
      })
  );
});

// Evento 'activate': Limpia cachés antiguas si hay nuevas versiones
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('mariprompter-cache-') && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
