// Service Worker for caching static assets and 3D models
const CACHE_NAME = 'amanda-portfolio-v10';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/about.html',
    '/portfolio.html',
    '/contact.html',
    '/css/style.css',
    '/css/animations.css',
    '/css/portfolio-gallery.css',
    '/css/persistent-header.css',
    '/css/page-content.css',
    '/js/background.js',
    '/js/page-nav.js',
    '/js/portfolio-gallery.js',
    '/js/sanity-client.js',
    '/js/PLYLoader.js',
    '/js/dat.gui.min.js',
    '/js/cssParticles.js',
    // 3D Models - these are the heavy files
    '/Models/orchid.ply',
    '/Models/about.ply',
    '/Models/contact.ply',
    '/Models/clients.ply',
    // Images
    '/images/profile.webp'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('Service Worker: All assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Only handle http and https requests (skip chrome-extension, etc.)
    if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
        return;
    }

    // Skip Sanity API requests - always fetch fresh
    if (event.request.url.includes('sanity.io') || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed:', error);
                        throw error;
                    });
            })
    );
});
