/**
 * Shared MapLibre GL JS loader + helpers.
 *
 * Centralises the dynamic import, CSS load, and — critically — the worker
 * configuration that every map component needs.
 *
 * ## Why `setWorkerUrl` with the CSP worker
 *
 * `maplibre-gl`'s default bundle (`dist/maplibre-gl.js`) ships a UMD file with
 * a custom AMD `define()` wrapper that instantiates its Web Worker from a
 * `blob:` URL. Two things go wrong with that wrapper in this project:
 *
 * 1. **Brave + other privacy browsers** — Shields/fingerprinting protection
 *    can block blob-URL workers, which manifests in the console as
 *    `Export 'maplibre_gl_exports' is not defined in module` because the
 *    worker fails to boot and the module's export wiring never completes.
 *    Plain static sites that load MapLibre from a CDN via `<script>` don't
 *    hit this because they never go through a bundler-generated chunk.
 *
 * 2. **Vite 8 / Rolldown** — the custom AMD wrapper interacts badly with
 *    Rolldown's CJS↔ESM interop and manual chunk splitting, producing the
 *    same "maplibre_gl_exports is not defined" error even outside Brave.
 *    Tracked upstream in maplibre/maplibre-gl-js#7339.
 *
 * The recommended workaround is to import the CSP-safe worker file as a URL
 * (Vite fingerprints and emits it as a static asset) and register it via
 * `setWorkerUrl` before any `Map` instance is constructed.
 */

import { browser } from '$app/environment';
// `?url` makes Vite emit the file as a hashed static asset and hand us its URL.
// Must be a static import so Vite resolves it at build time.
import cspWorkerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url';

export type MapLibreModule = typeof import('maplibre-gl');

let loadPromise: Promise<MapLibreModule> | null = null;

/**
 * Dynamically load MapLibre GL JS (module + CSS) and register the CSP worker.
 *
 * The returned promise is cached, so concurrent map components share a single
 * module load and the worker URL is only configured once.
 */
export async function loadMapLibre(): Promise<MapLibreModule> {
	if (!browser) {
		throw new Error('loadMapLibre() can only be called in the browser');
	}

	loadPromise ??= (async () => {
		const [module] = await Promise.all([
			import('maplibre-gl'),
			import('maplibre-gl/dist/maplibre-gl.css')
		]);

		// setWorkerUrl is a named export in ESM. Call it once, before any Map is
		// constructed, so every subsequent map uses our static worker URL.
		if (typeof module.setWorkerUrl === 'function') {
			module.setWorkerUrl(cspWorkerUrl);
		}

		return module;
	})();

	return loadPromise;
}

/**
 * CartoCDN basemap styles chosen to match the site's light/dark themes.
 */
export const MAP_STYLES = Object.freeze({
	light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
	dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
});

/**
 * Feature-detect WebGL support. MapLibre requires WebGL (1 or 2).
 */
export function hasWebGLSupport(): boolean {
	if (!browser) return false;
	try {
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
	} catch {
		return false;
	}
}

/**
 * Respect `prefers-reduced-motion` for map transitions (flyTo/easeTo/panBy).
 */
export function prefersReducedMotion(): boolean {
	if (!browser) return false;
	return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

/**
 * Wait until a container element has non-zero layout dimensions. MapLibre
 * throws if the container has zero width/height at construction time.
 *
 * Returns true when the container is ready, false if it never becomes ready
 * or gets disconnected from the DOM while waiting.
 */
export async function waitForContainerLayout(
	container: HTMLElement,
	{ maxWaitMs = 500 }: { maxWaitMs?: number } = {}
): Promise<boolean> {
	if (!browser) return false;

	const hasSize = (el: HTMLElement) => {
		const rect = el.getBoundingClientRect();
		return rect.width >= 1 && rect.height >= 1;
	};

	// Yield a frame first — the typical case where layout is pending.
	await new Promise((resolve) => requestAnimationFrame(resolve));
	if (!container.isConnected) return false;
	if (hasSize(container)) return true;

	// Poll a handful of frames before giving up.
	const deadline = performance.now() + maxWaitMs;
	while (performance.now() < deadline) {
		await new Promise((resolve) => setTimeout(resolve, 50));
		if (!container.isConnected) return false;
		if (hasSize(container)) return true;
	}

	return false;
}
