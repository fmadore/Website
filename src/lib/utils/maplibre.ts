/**
 * Shared MapLibre GL JS loader + helpers.
 *
 * Centralises the dynamic import and CSS load that every map component needs.
 *
 * ## Why `setWorkerUrl` is still needed under v6
 *
 * v6 is ESM-only: the v5 UMD bundle and its CSP variant
 * (`maplibre-gl-csp-worker.js`, which this module used to import) are no longer
 * published, and with them went the `blob:`-URL worker that Brave's shields
 * blocked and that Rolldown's CJS/ESM interop mangled into
 * `Export 'maplibre_gl_exports' is not defined in module`
 * (maplibre/maplibre-gl-js#7339).
 *
 * v6 derives its worker URL from `import.meta.url` instead, but upstream is
 * explicit that this only works for direct-from-CDN ESM: under a bundler
 * `import.meta.url` points at the emitted chunk, so the sibling
 * `maplibre-gl-worker.mjs` it computes does not exist. Skipping the call is not
 * a loud failure — the map, its controls and the style all load, and only the
 * vector tiles (which are parsed in the worker) silently never appear.
 *
 * `?worker&url` is load-bearing and not interchangeable with plain `?url`: the
 * dist worker imports its sibling `maplibre-gl-shared.mjs`, which `?url` would
 * emit the worker without, breaking it on first import in production builds
 * only. `?worker&url` runs it through Vite's worker pipeline, which emits a
 * self-contained chunk.
 */

import { browser } from '$app/environment';
// Static import so Vite resolves and emits the worker chunk at build time.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

export type MapLibreModule = typeof import('maplibre-gl');

let loadPromise: Promise<MapLibreModule> | null = null;

/**
 * Dynamically load MapLibre GL JS (module + CSS) and register the worker.
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

		// Must run before any Map is constructed, so every map uses the worker
		// chunk Vite emitted rather than the path v6 guesses from import.meta.url.
		module.setWorkerUrl(workerUrl);

		// Prewarm spins up the worker + shared resources eagerly, so the first
		// `new Map()` paints a frame or two sooner. Safe to no-op if unavailable.
		if (typeof module.prewarm === 'function') {
			try {
				module.prewarm();
			} catch {
				// prewarm() is a nice-to-have; never block map creation on it.
			}
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
 * Feature-detect WebGL 2 support.
 *
 * MapLibre v6 removed the WebGL 1 render path, so a context that only supports
 * WebGL 1 is no longer enough. Probing for `webgl` as a fallback (as this did
 * under v5) would report success and then let `new Map()` fail at construction,
 * so the check deliberately has no fallback.
 */
export function hasWebGLSupport(): boolean {
	if (!browser) return false;
	try {
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl2'));
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
