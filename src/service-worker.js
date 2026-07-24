/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { version } from '$service-worker';

// Cast self to ServiceWorkerGlobalScope for proper typing
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

// Cache names
const CACHE_NAME = `cache-v${version}`;
const RUNTIME_CACHE = `runtime-v${version}`;

// Assets to precache — app shell + offline fallback ONLY.
// Previously this precached [...build, ...files, ...prerendered], which on a
// first visit downloaded the entire site (~84 MB: every build chunk incl. the
// ~2 MB ECharts/MapLibre bundles the home page never uses, ~80 MB of static
// media, and all 186 prerendered pages). That contended for bandwidth on the
// initial load and ballooned the network dependency tree. The fetch handler
// below already caches JS/CSS/assets cache-first and navigations network-first
// on demand, so any visited page still works offline without the upfront bulk.
// The three latin font subsets are what offline.html (and any cached page)
// renders with — a few dozen KB that keep the offline fallback on-brand.
const ASSETS_TO_CACHE = [
	'/',
	'/offline.html',
	'/manifest.webmanifest',
	'/fonts/web/archivo-normal-latin.woff2',
	'/fonts/web/newsreader-normal-latin.woff2',
	'/fonts/web/spline-sans-mono-normal-latin.woff2'
];

// Cache strategies. Entries starting with '.' are file extensions and must
// match the END of the pathname; everything else is a path-prefix substring.
// (Substring-matching extensions is how '.json' used to match the '.js' rule,
// which routed all JSON to cache-first and made stale-while-revalidate dead
// code — data was served stale until the next deploy.)
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

const STALE_WHILE_REVALIDATE_ROUTES = ['/api/', '.json'];

// Bound the runtime cache so it can't grow without limit between deploys.
const RUNTIME_CACHE_MAX_ENTRIES = 150;

// Install event: Cache essential assets
sw.addEventListener('install', (event) => {
	console.log('[SW] Installing service worker v' + version);

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(async (cache) => {
				console.log('[SW] Pre-caching offline assets');
				// Add assets individually so a single 404 doesn't abort the whole install
				// (cache.addAll is atomic — any failure rejects the entire operation).
				const results = await Promise.allSettled(ASSETS_TO_CACHE.map((asset) => cache.add(asset)));
				const failed = results.filter((r) => r.status === 'rejected').length;
				if (failed > 0) {
					console.warn(`[SW] ${failed}/${ASSETS_TO_CACHE.length} assets failed to precache`);
				}
			})
			.then(() => {
				console.log('[SW] Installation complete');
				sw.skipWaiting(); // Activate immediately
			})
	);
});

// Activate event: Clean up old caches, enable navigation preload, and claim clients
sw.addEventListener('activate', (event) => {
	console.log('[SW] Activating service worker v' + version);

	event.waitUntil(
		Promise.all([
			// Clean up old caches
			caches.keys().then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
							console.log('[SW] Removing old cache:', cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			}),
			// Enable navigation preload if supported (must be done during activate)
			sw.registration.navigationPreload?.enable().catch((error) => {
				console.log('[SW] Navigation preload not available:', error.message);
			})
		]).then(() => {
			console.log('[SW] Activation complete');
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

	// Skip cross-origin requests (except CDN assets we want to cache).
	// Fonts are self-hosted now, so the only cacheable third-party origin left
	// is the iconify API fallback (bundled icons normally make it unnecessary).
	if (url.origin !== sw.location.origin) {
		if (url.hostname === 'api.iconify.design') {
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
	const fetchPromise = fetch(request)
		.then((response) => {
			if (response.ok) {
				putRuntime(cache, request, response.clone());
			}
			return response;
		})
		.catch(() => cached);

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
			putRuntime(cache, request, response.clone());
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
			return (
				caches.match('/offline.html') ||
				new Response('You are offline', {
					status: 503,
					statusText: 'Service Unavailable',
					headers: { 'Content-Type': 'text/html' }
				})
			);
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
			putRuntime(cache, request, response.clone());
		}
		return response;
	} catch {
		return cached || new Response('CDN resource unavailable', { status: 503 });
	}
}

// Helper functions to determine caching strategy
function matchesRoute(pathname, route) {
	return route.startsWith('.') ? pathname.endsWith(route) : pathname.includes(route);
}

function shouldUseCacheFirst(pathname) {
	return CACHE_FIRST_ROUTES.some((route) => matchesRoute(pathname, route));
}

function shouldUseStaleWhileRevalidate(pathname) {
	return STALE_WHILE_REVALIDATE_ROUTES.some((route) => matchesRoute(pathname, route));
}

// Store a response in the runtime cache, evicting oldest entries past the cap.
async function putRuntime(cache, request, response) {
	await cache.put(request, response);
	const keys = await cache.keys();
	if (keys.length > RUNTIME_CACHE_MAX_ENTRIES) {
		await Promise.all(
			keys.slice(0, keys.length - RUNTIME_CACHE_MAX_ENTRIES).map((key) => cache.delete(key))
		);
	}
}

// Handle push notifications (if you plan to implement them)
sw.addEventListener('push', (event) => {
	if (!event.data) return;

	const options = {
		body: event.data.text(),
		icon: '/icons/favicon.png',
		badge: '/icons/favicon.png',
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

	event.waitUntil(sw.registration.showNotification('Academic Update', options));
});

// Handle notification clicks
sw.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'view') {
		event.waitUntil(sw.clients.openWindow('/'));
	}
});

// Handle messages from clients
sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		sw.skipWaiting();
	}
});
