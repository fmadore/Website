/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker';

// Cast self to ServiceWorkerGlobalScope for proper typing
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

// Cache names
const CACHE_NAME = `cache-v${version}`;
const RUNTIME_CACHE = `runtime-v${version}`;

// Assets to precache
const ASSETS_TO_CACHE = [...build, ...files, ...prerendered];

// Cache strategies
const CACHE_FIRST_ROUTES = [
    '/images/',
    '/icons/',
    '/_app/',
    '/app/',
    '.css',
    '.js',
    '.woff2',
    '.woff',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.svg',
    '.ico'
];

const STALE_WHILE_REVALIDATE_ROUTES = [
    '/api/',
    '.json'
];

// Install event: Cache essential assets and enable navigation preload
sw.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker v' + version);
    
    event.waitUntil(
        Promise.all([
            // Cache essential assets
            caches.open(CACHE_NAME)
                .then((cache) => {
                    console.log('[SW] Pre-caching offline assets');
                    return cache.addAll(ASSETS_TO_CACHE);
                }),
            // Enable navigation preload if supported
            sw.registration.navigationPreload?.enable()
        ]).then(() => {
            console.log('[SW] Installation complete');
            sw.skipWaiting(); // Activate immediately
        })
    );
});

// Activate event: Clean up old caches and claim clients
sw.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker v' + version);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[SW] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Cache cleanup complete');
                return sw.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event: Intelligent caching strategies
sw.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests (except for fonts/CDN assets you want to cache)
    if (url.origin !== sw.location.origin) {
        // Allow caching of Google Fonts and other CDN assets
        if (url.hostname === 'fonts.googleapis.com' || 
            url.hostname === 'fonts.gstatic.com' ||
            url.hostname === 'api.iconify.design') {
            event.respondWith(handleCDNRequest(request));
        }
        return;
    }

    // Handle different types of requests with appropriate strategies
    if (shouldUseCacheFirst(url.pathname)) {
        event.respondWith(handleCacheFirst(request));
    } else if (shouldUseStaleWhileRevalidate(url.pathname)) {
        event.respondWith(handleStaleWhileRevalidate(request));
    } else {
        event.respondWith(handleNetworkFirst(request, event));
    }
});

// Cache-first strategy for static assets
async function handleCacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.warn('[SW] Cache-first fetch failed:', error);
        // Return offline fallback if available
        return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
}

// Stale-while-revalidate for dynamic content
async function handleStaleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    // Start fetch in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);

    // Return cached version immediately if available, otherwise wait for network
    return cached || fetchPromise;
}

// Network-first strategy for navigation and dynamic content
async function handleNetworkFirst(request, event) {
    try {
        // Use navigation preload response if available
        const preloadResponse = event ? await event.preloadResponse : null;
        if (preloadResponse) {
            return preloadResponse;
        }

        const response = await fetch(request);
        
        // Cache successful responses
        if (response.ok && response.status < 400) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.warn('[SW] Network-first fetch failed:', error);
        
        // Try cache as fallback
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Return appropriate offline fallback
        if (request.destination === 'document') {
            return caches.match('/offline.html') || 
                   new Response('You are offline', { 
                       status: 503,
                       statusText: 'Service Unavailable',
                       headers: { 'Content-Type': 'text/html' }
                   });
        }

        throw error;
    }
}

// Handle CDN requests with longer caching
async function handleCDNRequest(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return cached || new Response('CDN resource unavailable', { status: 503 });
    }
}

// Helper functions to determine caching strategy
function shouldUseCacheFirst(pathname) {
    return CACHE_FIRST_ROUTES.some(route => 
        pathname.includes(route) || pathname.endsWith(route)
    );
}

function shouldUseStaleWhileRevalidate(pathname) {
    return STALE_WHILE_REVALIDATE_ROUTES.some(route => 
        pathname.includes(route) || pathname.endsWith(route)
    );
}

// Handle push notifications (if you plan to implement them)
sw.addEventListener('push', (event) => {
    if (!event.data) return;

    const options = {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'academic-update',
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icons/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/action-dismiss.png'
            }
        ]
    };

    event.waitUntil(
        sw.registration.showNotification('Academic Update', options)
    );
});

// Handle notification clicks
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'view') {
		event.waitUntil(
			sw.clients.openWindow('/')
		);
	}
});

// Handle messages from clients
sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		sw.skipWaiting();
	}
});