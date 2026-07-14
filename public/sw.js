const CACHE_NAME = 'bom-samaritano-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/church_pwa_icon.jpg'
];

// Install Event - cache the shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// Fetch Event - Dynamic and Offline caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and avoid extension scripts or external API calls being forced to cache unexpectedly
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only handle requests to our own origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Dynamic caching strategy:
      // For static assets (js, css, images, fonts), we prefer Cache-First to keep loading instant
      const isStaticAsset = 
        url.pathname.includes('/assets/') || 
        url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.jpg') || 
        url.pathname.endsWith('.png') || 
        url.pathname.endsWith('.svg') || 
        url.pathname.endsWith('.woff2') || 
        url.pathname.endsWith('.json');

      if (isStaticAsset && cachedResponse) {
        return cachedResponse;
      }

      // Network-First for other resources (HTML, API endpoints like Bible verses)
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Cache the response clone for offline capability
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline, return from cache if available
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigating pages or requesting root and we are offline, fallback to cached '/' or '/index.html'
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
