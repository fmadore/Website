/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker';

// Unique cache name including the build version
const CACHE_NAME = `cache-${version}`;

// List of assets to cache immediately
const ASSETS_TO_CACHE = build.concat(files).concat(prerendered);

// Install event: Cache all essential assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log('[ServiceWorker] Pre-caching offline page');
				return cache.addAll(ASSETS_TO_CACHE);
			})
			.then(() => {
				self.skipWaiting(); // Activate the new service worker immediately
			})
	);
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							console.log('[ServiceWorker] Removing old cache:', cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => {
				self.clients.claim(); // Take control of all open pages
			})
	);
});

// Fetch event: Serve cached assets first, fallback to network
self.addEventListener('fetch', (event) => {
	// Ignore non-GET requests
	if (event.request.method !== 'GET') {
		return;
	}

	// Ignore requests for assets outside the app's origin (like external APIs, fonts, etc.)
	// Adjust this logic if you need to cache external resources
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			// Return cached response if found
			if (cachedResponse) {
				return cachedResponse;
			}

			// Otherwise, fetch from network
			return fetch(event.request).then((response) => {
				// Optional: Cache the newly fetched resource for future offline use
				// Be careful with caching dynamic content or API responses here
				// Example: Cache only successful responses and specific file types
				// if (!response || response.status !== 200 || response.type !== 'basic') {
				//   return response;
				// }
				// const responseToCache = response.clone();
				// caches.open(CACHE_NAME)
				//   .then(cache => {
				//     cache.put(event.request, responseToCache);
				//   });
				return response;
			});
		})
	);
});
