// Service Worker for QWEN Restaurant PWA
const CACHE_NAME = 'qwen-restaurant-v1';
const RUNTIME_CACHE = 'qwen-runtime-v1';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/menu',
  '/cart',
  '/checkout',
  '/manifest.json',
  '/notification.mp3',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls for real-time data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network first strategy for other requests
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        });
    })
  );
});

// Handle push notifications (optional for future)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New update from QWEN Restaurant',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'qwen-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'QWEN Restaurant', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
