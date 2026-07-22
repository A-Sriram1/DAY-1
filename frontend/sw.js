/* ================================================
   SERVICE WORKER — CarETL Dashboard PWA
   Caches all assets for offline use
   ================================================ */

const CACHE_NAME = 'caretl-cache-v1';

// All files to cache for offline use
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/reports.html',
    '/settings.html',
    '/css/style.css',
    '/js/app.js',
    '/js/reports.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// INSTALL: Cache all assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching all assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ACTIVATE: Remove old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[Service Worker] Removing old cache:', key);
                        return caches.delete(key);
                    })
            );
        })
    );
    self.clients.claim();
});

// FETCH: Network first, then cache fallback
self.addEventListener('fetch', event => {
    // Skip API calls from caching (always fetch fresh data)
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/cars') ||
        url.pathname.startsWith('/stats') ||
        url.pathname.startsWith('/search') ||
        url.pathname.startsWith('/filter') ||
        url.pathname.startsWith('/clean')) {
        return; // Let API calls go through normally
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response and cache it
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // Network failed, serve from cache
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    // If no cache, return offline page
                    return caches.match('/index.html');
                });
            })
    );
});
