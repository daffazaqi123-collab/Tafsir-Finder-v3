const CACHE_NAME = 'finding-tafsir-v3';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon.svg'
];

// Install: Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches if any
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch: Strategy for "Offline Total"
self.addEventListener('fetch', (event) => {
  // 1. Navigation Requests (HTML): Try Network, Fallback to Cache, Fallback to /index.html
  // This ensures if you open the app offline, it loads the main page instead of 404.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              // CRITICAL FIX: If navigation fails, return the main index.html
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // 2. Asset Requests (JS, CSS, Images): Cache First, then Network (and update cache)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache valid responses for next time (e.g., React from esm.sh)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' || networkResponse.type === 'cors') {
           const responseToCache = networkResponse.clone();
           caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, responseToCache);
           });
        }
        return networkResponse;
      });
    })
  );
});