/**
 * MapLibre Initialization Hook
 *
 * Centralized lifecycle management for MapLibre map components, mirroring
 * `useECharts`. Handles WebGL 2 feature detection, container-layout waiting,
 * dynamic import (module + CSS + worker via `loadMapLibre`), map construction
 * with the standard control set, theme-driven style swapping, data updates,
 * and cleanup.
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
 *   A change made while the map is still loading tiles runs at the next
 *   `idle`; only the latest pending change runs.
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

export const MAP_STYLE_TIMEOUT_MS = 15000;

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
	/**
	 * Initialization diagnostic, if any (reactive). Treat it as a boolean at the
	 * call site: the string is for the DEV console, never for the reader.
	 */
	readonly importError: string | null;
	retry: () => void;
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
	let attempt = $state(0);
	// The style currently applied to the map; compared against isDark() to
	// decide when a setStyle is actually needed.
	let currentThemeIsDark: boolean | null = null;

	// Initialization + cleanup. Deliberately tracks only the container — theme
	// and data are handled by the dedicated effects below, and everything else
	// is read untracked so prop changes don't tear the map down.
	$effect(() => {
		const container = getContainer();
		void attempt;
		if (!browser || !container) return;

		let cancelled = false;
		let styleTimer: ReturnType<typeof setTimeout> | undefined;
		const failStyle = (message: string) => {
			if (cancelled || isMapLoaded) return;
			clearTimeout(styleTimer);
			importError = message;
		};
		importError = null;

		(async () => {
			try {
				// `importError` is a diagnostic, not interface copy: the component
				// renders the honest state (`.state-note`) and the raw reason stays
				// in the DEV console, where the person who can act on it will look.
				if (!hasWebGLSupport()) {
					importError = 'WebGL 2 is unavailable in this browser.';
					if (import.meta.env.DEV)
						console.error('Map unavailable: WebGL 2 is not supported in this browser.');
					return;
				}

				const ready = await waitForContainerLayout(container);
				if (cancelled) return;
				if (!ready) {
					importError = 'Map container has no dimensions.';
					if (import.meta.env.DEV)
						console.error('Map unavailable: the container never took layout dimensions.');
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
				styleTimer = setTimeout(
					() => failStyle('The map style did not load in time.'),
					MAP_STYLE_TIMEOUT_MS
				);

				mapInstance.addControl(new gl.NavigationControl(), 'top-right');
				// Default to the mercator (flat) projection; the GlobeControl button
				// lets visitors switch to globe if they want.
				mapInstance.addControl(new gl.GlobeControl(), 'top-right');
				mapInstance.addControl(new gl.FullscreenControl(), 'top-right');

				untrack(() => onInit?.(mapInstance, gl));

				mapInstance.on('load', () => {
					if (cancelled) return;
					clearTimeout(styleTimer);
					importError = null;
					isMapLoaded = true;
					untrack(() => onStyleReady(mapInstance, gl));
				});

				mapInstance.on('error', (e) => {
					// A missing initial style prevents every layer from loading. Tile errors
					// after a style exists are recoverable and must not hide a usable map.
					if (!mapInstance.getStyle()) failStyle('The map style could not be loaded.');
					if (import.meta.env.DEV) console.error('MapLibre error:', e.error);
				});
			} catch (error) {
				if (cancelled) return;
				if (import.meta.env.DEV) console.error('Error initializing map:', error);
				importError = error instanceof Error ? error.message : 'Unknown error loading map';
			}
		})();

		return () => {
			cancelled = true;
			clearTimeout(styleTimer);
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
		const ready = () => {
			untrack(() => onStyleReady(m, gl));
		};
		m.once('style.load', ready);
		return () => {
			m.off('style.load', ready);
		};
	});

	// Data effect: tracks only watchData()'s value; the callback runs untracked
	// so colors/theme reads inside it don't create extra dependencies.
	//
	// `isStyleLoaded()` is false while tiles stream in or a just-removed source
	// settles: after every fitBounds, and on the frame after a choropleth is
	// cleared. A change that lands then is deferred to the next `idle`, never
	// dropped. Dropping it left the previous selection's markers on the map
	// while the table beside it showed the new one. A newer change replaces the
	// pending one, and the callback reads the data current when it runs.
	$effect(() => {
		watchData?.();
		const m = map;
		const gl = maplibregl;
		if (!m || !gl || !isMapLoaded) return;
		const apply = () => untrack(() => onDataChange?.(m, gl));
		if (m.isStyleLoaded()) {
			apply();
			return;
		}
		m.once('idle', apply);
		return () => {
			m.off('idle', apply);
		};
	});

	return {
		retry: () => {
			attempt += 1;
		},
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
