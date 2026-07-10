/**
 * MapLibre Initialization Hook
 *
 * Centralized lifecycle management for MapLibre map components, mirroring
 * `useECharts`. Handles WebGL feature detection, container-layout waiting,
 * dynamic import (module + CSS + CSP worker via `loadMapLibre`), map
 * construction with the standard control set, theme-driven style swapping,
 * data updates, and cleanup.
 *
 * Usage:
 * ```svelte
 * <script lang="ts">
 *   const ml = useMapLibre({
 *     getContainer: () => mapContainer,
 *     getMapOptions: () => ({ center: [10, 30], zoom: 2 }),
 *     isDark: () => darkModeDetected,
 *     onStyleReady: () => addMarkers(),
 *     watchData: () => data,
 *     onDataChange: () => addMarkers(),
 *     onCleanup: () => clearMarkers()
 *   });
 *   const map = $derived(ml.map);
 * </script>
 * ```
 *
 * Contract:
 * - `onStyleReady` runs after the initial `load` event and again after every
 *   theme-driven `setStyle` finishes loading (sources/layers/markers are
 *   cleared by `setStyle`, so re-register everything there).
 * - `onDataChange` runs untracked whenever `watchData()`'s value changes, so
 *   theme-only changes (e.g. resolved colors read inside the callback) do NOT
 *   retrigger it — recoloring happens via the `onStyleReady` path instead.
 */

import { untrack } from 'svelte';
import { browser } from '$app/environment';
import type { Map as MapLibreMap, MapOptions } from 'maplibre-gl';
import {
	MAP_STYLES,
	hasWebGLSupport,
	loadMapLibre,
	waitForContainerLayout,
	type MapLibreModule
} from '$lib/utils/maplibre';

export interface UseMapLibreOptions {
	/** Returns the container element (may be undefined during initial render). */
	getContainer: () => HTMLElement | undefined;
	/**
	 * Map constructor options minus `container`/`style` (owned by the hook).
	 * Read once at init — not reactive.
	 */
	getMapOptions: () => Omit<MapOptions, 'container' | 'style'>;
	/** Reactive theme getter; drives the light/dark basemap style swap. */
	isDark: () => boolean;
	/** Called once right after construction (extra controls, event handlers). */
	onInit?: (map: MapLibreMap, gl: MapLibreModule) => void;
	/**
	 * Called whenever a style is ready: after the initial `load` and after each
	 * theme-driven `setStyle`. Register sources/layers/markers here.
	 */
	onStyleReady: (map: MapLibreMap, gl: MapLibreModule) => void;
	/** Reactive dependency for data updates (e.g. `() => data`). */
	watchData?: () => unknown;
	/** Runs (untracked) when `watchData()` changes after the map has loaded. */
	onDataChange?: (map: MapLibreMap, gl: MapLibreModule) => void;
	/** Component-specific teardown run before `map.remove()`. */
	onCleanup?: () => void;
}

export interface UseMapLibreReturn {
	/** The MapLibre map instance (reactive). */
	readonly map: MapLibreMap | null;
	/** The loaded maplibre-gl module (reactive). */
	readonly maplibregl: MapLibreModule | null;
	/** True once the initial style has loaded (reactive). */
	readonly isMapLoaded: boolean;
	/** Human-readable initialization error, if any (reactive). */
	readonly importError: string | null;
}

export function useMapLibre(options: UseMapLibreOptions): UseMapLibreReturn {
	const {
		getContainer,
		getMapOptions,
		isDark,
		onInit,
		onStyleReady,
		watchData,
		onDataChange,
		onCleanup
	} = options;

	let map = $state<MapLibreMap | null>(null);
	let maplibregl = $state<MapLibreModule | null>(null);
	let isMapLoaded = $state(false);
	let importError = $state<string | null>(null);
	// The style currently applied to the map; compared against isDark() to
	// decide when a setStyle is actually needed.
	let currentThemeIsDark: boolean | null = null;

	// Initialization + cleanup. Deliberately tracks only the container — theme
	// and data are handled by the dedicated effects below, and everything else
	// is read untracked so prop changes don't tear the map down.
	$effect(() => {
		const container = getContainer();
		if (!browser || !container) return;

		let cancelled = false;

		(async () => {
			try {
				if (!hasWebGLSupport()) {
					importError =
						'WebGL is not supported in your browser. Please enable hardware acceleration or try a different browser.';
					return;
				}

				const ready = await waitForContainerLayout(container);
				if (cancelled) return;
				if (!ready) {
					importError = 'Map container has no dimensions. Please try refreshing the page.';
					return;
				}

				const gl = await loadMapLibre();
				if (cancelled || !container.isConnected) return;
				maplibregl = gl;

				const initialDarkMode = untrack(isDark);
				currentThemeIsDark = initialDarkMode;

				const mapInstance = new gl.Map({
					container,
					style: initialDarkMode ? MAP_STYLES.dark : MAP_STYLES.light,
					// Ctrl/Cmd + scroll (or two-finger gesture) required to zoom, so the
					// map doesn't steal scroll on long visualisation pages.
					cooperativeGestures: true,
					...untrack(getMapOptions)
				});
				map = mapInstance;

				mapInstance.addControl(new gl.NavigationControl(), 'top-right');
				// Default to the mercator (flat) projection; the GlobeControl button
				// lets visitors switch to globe if they want.
				mapInstance.addControl(new gl.GlobeControl(), 'top-right');
				mapInstance.addControl(new gl.FullscreenControl(), 'top-right');

				untrack(() => onInit?.(mapInstance, gl));

				mapInstance.on('load', () => {
					if (cancelled) return;
					isMapLoaded = true;
					untrack(() => onStyleReady(mapInstance, gl));
				});

				mapInstance.on('error', (e) => {
					if (import.meta.env.DEV) console.error('MapLibre error:', e.error);
				});
			} catch (error) {
				if (import.meta.env.DEV) console.error('Error initializing map:', error);
				importError = error instanceof Error ? error.message : 'Unknown error loading map';
			}
		})();

		return () => {
			cancelled = true;
			isMapLoaded = false;
			currentThemeIsDark = null;
			onCleanup?.();
			if (map) {
				map.remove();
				map = null;
			}
			maplibregl = null;
		};
	});

	// Theme effect: swap the basemap style, then re-register layers/markers
	// once the new style is in (setStyle clears them).
	$effect(() => {
		const dark = isDark();
		const m = map;
		const gl = maplibregl;
		if (!m || !gl || !isMapLoaded || dark === currentThemeIsDark) return;
		currentThemeIsDark = dark;
		m.setStyle(dark ? MAP_STYLES.dark : MAP_STYLES.light);
		m.once('style.load', () => {
			untrack(() => onStyleReady(m, gl));
		});
	});

	// Data effect: tracks only watchData()'s value; the callback runs untracked
	// so colors/theme reads inside it don't create extra dependencies.
	$effect(() => {
		watchData?.();
		const m = map;
		const gl = maplibregl;
		if (!m || !gl || !isMapLoaded) return;
		untrack(() => onDataChange?.(m, gl));
	});

	return {
		get map() {
			return map;
		},
		get maplibregl() {
			return maplibregl;
		},
		get isMapLoaded() {
			return isMapLoaded;
		},
		get importError() {
			return importError;
		}
	};
}
