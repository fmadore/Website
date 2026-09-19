/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { version } from '$service-worker';
import { chooseStrategy } from './service-worker-routes';
import { createCacheHandler } from './service-worker-cache';

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
// "Network-first" includes the navigation-preload response: that is the body a
// preload-enabled browser actually serves, so it is cached on the same terms as
// a plain fetch — otherwise every navigation made while preload was active
// returned a page that was never written to the runtime cache, and the sentence
// above was false for exactly the pages a reader had visited.
// Fonts are deliberately absent: see the note on CACHE_FIRST_ROUTES in
// ./service-worker-routes —
// nothing here serves them, so precaching them would only cost install traffic.
const ASSETS_TO_CACHE = ['/', '/offline.html', '/manifest.webmanifest'];

// Bound the runtime cache so it can't grow without limit between deploys.
const handleRequest = createCacheHandler({
	storage: caches,
	fetch: (request) => fetch(request),
	assetCache: CACHE_NAME,
	runtimeCache: RUNTIME_CACHE,
	maxEntries: 150
});

// Install event: Cache essential assets
sw.addEventListener('install', (event) => {
	console.log('[SW] Installing service worker v' + version);

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(async (cache) => {
				console.log('[SW] Pre-caching offline assets');
				// Add assets individually so a single 404 doesn't abort the whole install
				// (cache.addAll is atomic — any failure rejects the entire operation),
				// and store an un-redirected copy rather than using cache.add: a host
				// that answers '/offline.html' through a redirect gives cache.add a
				// response with redirected === true, and respondWith() refuses to
				// serve such a response to a navigation, so the offline fallback
				// failed precisely when it was needed.
				const results = await Promise.allSettled(
					ASSETS_TO_CACHE.map((asset) => precacheAsset(cache, asset))
				);
				const failed = results.filter((r) => r.status === 'rejected').length;
				if (failed > 0) {
					console.warn(`[SW] ${failed}/${ASSETS_TO_CACHE.length} assets failed to precache`);
				}
			})
			.then(() => console.log('[SW] Installation complete'))
	);
});

// Fetch one precache asset and store a copy whose `redirected` flag is false.
// A Response constructed from a body is never marked redirected, which is what
// makes it legal to hand back from respondWith() during a navigation.
async function precacheAsset(cache, asset) {
	const response = await fetch(asset, { cache: 'reload' });
	if (!response.ok || response.status >= 400) {
		throw new Error(`[SW] ${asset} responded ${response.status}`);
	}
	const body = await response.blob();
	// Only the content type is carried over. `blob()` hands back decoded bytes,
	// so copying the original headers wholesale would keep a `Content-Encoding:
	// gzip` that no longer describes the body, and the browser would try to
	// inflate plain HTML.
	const headers = new Headers();
	const type = response.headers.get('Content-Type');
	if (type) headers.set('Content-Type', type);
	await cache.put(asset, new Response(body, { status: 200, statusText: 'OK', headers }));
}

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

	// Cross-origin data and tiles already have service-specific browser caching;
	// leave them outside this site's runtime-cache lifecycle.
	if (url.origin !== sw.location.origin) {
		return;
	}

	// Which strategy applies is a pure decision, tested in
	// service-worker-routes.test.ts. 'passthrough' means no respondWith() at all,
	// which is the only way a request keeps its own cache headers and the
	// browser's preload cache — the fonts and the version file both need that.
	const strategy = chooseStrategy(url.pathname, request.destination);

	if (strategy === 'passthrough') return;
	const { response, done } = handleRequest(request, strategy, event.preloadResponse);
	event.waitUntil(done);
	event.respondWith(response);
});

// Handle messages from clients
sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		sw.skipWaiting();
	}
});
