<script module lang="ts">
	// Define the structure for marker data (compatible with previous version)
	export type MarkerData = {
		id: string;
		title: string;
		coordinates: { latitude: number; longitude: number };
		year?: number;
		activityType?: string;
		image?: string;
	};
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { getResolvedChartColors } from '$lib/utils/chartColorUtils';
	import {
		MAP_STYLES,
		hasWebGLSupport,
		loadMapLibre,
		prefersReducedMotion,
		waitForContainerLayout,
		type MapLibreModule
	} from '$lib/utils/maplibre';
	import type { GeoJSONSource, Map as MapLibreMap, Popup } from 'maplibre-gl';

	// Map configuration props with defaults using Svelte 5 $props() rune
	let {
		markersData = [],
		initialView = [20, 0] as [number, number],
		initialZoom = 2,
		maxZoom = 19,
		maxClusterZoom: _maxClusterZoom = 18,
		preferDarkMode = null as boolean | null,
		restrictBounds: _restrictBounds = true,
		showLegend = false
	}: {
		markersData?: MarkerData[];
		initialView?: [number, number];
		initialZoom?: number;
		maxZoom?: number;
		maxClusterZoom?: number;
		preferDarkMode?: boolean | null;
		restrictBounds?: boolean;
		/** When true, renders a colour legend for the activity-type markers. */
		showLegend?: boolean;
	} = $props();

	const SOURCE_ID = 'activities';
	const CLUSTER_LAYER = 'activity-clusters';
	const CLUSTER_COUNT_LAYER = 'activity-cluster-count';
	const POINT_LAYER = 'activity-points';

	// Canonical mapping between activity type, human label, and the CSS variable
	// used by both the map layer paint and the legend swatches. Keep in sync
	// with the `match` expression in setupClusterLayers().
	const LEGEND_ITEMS: Array<{
		type: string;
		label: string;
		colorKey: 'accent' | 'highlight' | 'purple' | 'pink' | 'primary';
	}> = [
		{ type: 'conference', label: 'Conference', colorKey: 'purple' },
		{ type: 'lecture', label: 'Lecture', colorKey: 'accent' },
		{ type: 'workshop', label: 'Workshop', colorKey: 'pink' },
		{ type: 'event', label: 'Event', colorKey: 'highlight' },
		{ type: '__other__', label: 'Other', colorKey: 'primary' }
	];

	// Only show the legend entries for types that actually appear in the data.
	// Uses a plain array (not a Set) to avoid svelte/prefer-svelte-reactivity;
	// the list of known types is tiny so the O(n) includes() lookup is fine.
	const legendEntries = $derived.by(() => {
		if (!showLegend) return [];
		const present: string[] = [];
		let hasOther = false;
		for (const item of markersData) {
			const t = item.activityType;
			if (t && LEGEND_ITEMS.some((entry) => entry.type === t)) {
				if (!present.includes(t)) present.push(t);
			} else {
				hasOther = true;
			}
		}
		return LEGEND_ITEMS.filter((entry) =>
			entry.type === '__other__' ? hasOther : present.includes(entry.type)
		);
	});

	let mapContainer: HTMLElement;

	// State variables using Svelte 5 $state() rune
	let map = $state<MapLibreMap | null>(null);
	let maplibregl = $state<MapLibreModule | null>(null);
	let importError = $state<string | null>(null);
	let currentThemeIsDark = $state<boolean | null>(null);
	let activePopup = $state<Popup | null>(null);
	let isMapLoaded = $state(false);

	// Derived value for dark mode detection - reactive to theme store changes
	let darkModeDetected = $derived.by(() => {
		if (preferDarkMode !== null) return preferDarkMode;
		return getTheme() === 'dark';
	});

	// Function to update map style based on theme
	function updateMapStyle() {
		if (!map) return;

		const newDarkMode = darkModeDetected;
		if (newDarkMode !== currentThemeIsDark) {
			const styleUrl = newDarkMode ? MAP_STYLES.dark : MAP_STYLES.light;
			map.setStyle(styleUrl);
			currentThemeIsDark = newDarkMode;

			// setStyle clears our source + layers. Re-register them and re-push data
			// once the new style finishes loading.
			map.once('style.load', () => {
				setupClusterLayers();
				pushMarkersToSource(markersData);
			});
		}
	}

	// Function to create popup content
	function createPopupContent(item: MarkerData): string {
		const linkUrl = `${base}/communications/${item.id}`;
		const imageHtml = item.image
			? `<img src="${base}/${item.image}" alt="${item.title}" class="map-popup-image">`
			: '';

		return `
			<a href="${linkUrl}" target="_self" class="map-popup-link">
				${imageHtml}
				<div class="map-popup-content-text">
					<strong>${item.title}</strong>
					${item.year ? `<br><span class="map-popup-year">(${item.year})</span>` : ''}
				</div>
			</a>
		`;
	}

	function keepPopupInView(popup: Popup) {
		if (!browser || !map || !mapContainer) return;
		const popupEl = (popup as unknown as { getElement?: () => HTMLElement }).getElement?.();
		if (!popupEl) return;

		// Wait a frame so MapLibre has positioned the popup.
		requestAnimationFrame(() => {
			if (!map || !mapContainer) return;
			const padding = 12;
			const containerRect = mapContainer.getBoundingClientRect();
			const popupRect = popupEl.getBoundingClientRect();

			let dx = 0;
			let dy = 0;

			if (popupRect.left < containerRect.left + padding) {
				dx = popupRect.left - (containerRect.left + padding);
			} else if (popupRect.right > containerRect.right - padding) {
				dx = popupRect.right - (containerRect.right - padding);
			}

			if (popupRect.top < containerRect.top + padding) {
				dy = popupRect.top - (containerRect.top + padding);
			} else if (popupRect.bottom > containerRect.bottom - padding) {
				dy = popupRect.bottom - (containerRect.bottom - padding);
			}

			if (dx !== 0 || dy !== 0) {
				map.panBy([-dx, -dy], {
					duration: prefersReducedMotion() ? 0 : 250
				});
			}
		});
	}

	// Build a GeoJSON FeatureCollection from marker data.
	function buildFeatureCollection(data: MarkerData[]): GeoJSON.FeatureCollection {
		return {
			type: 'FeatureCollection',
			features: data
				.filter((item) => item.coordinates)
				.map((item) => ({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [item.coordinates.longitude, item.coordinates.latitude]
					},
					properties: {
						id: item.id,
						title: item.title,
						// Nulls are safer than undefined here: MapLibre's GeoJSON worker
						// drops properties with undefined values, which breaks `['get', ...]`.
						year: item.year ?? null,
						activityType: item.activityType ?? null,
						image: item.image ?? null
					}
				}))
		};
	}

	// Register source + cluster/point layers. Call once per style load.
	function setupClusterLayers() {
		if (!map || !maplibregl) return;

		const colors = getResolvedChartColors();
		const labelColor = colors.white || '#ffffff';
		const strokeColor = colors.surface || '#ffffff';

		if (!map.getSource(SOURCE_ID)) {
			map.addSource(SOURCE_ID, {
				type: 'geojson',
				data: { type: 'FeatureCollection', features: [] },
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 50
			});
		}

		if (!map.getLayer(CLUSTER_LAYER)) {
			map.addLayer({
				id: CLUSTER_LAYER,
				type: 'circle',
				source: SOURCE_ID,
				filter: ['has', 'point_count'],
				paint: {
					'circle-color': colors.primary,
					'circle-opacity': 0.85,
					'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 30, 28],
					'circle-stroke-width': 2,
					'circle-stroke-color': strokeColor
				}
			});
		}

		if (!map.getLayer(CLUSTER_COUNT_LAYER)) {
			map.addLayer({
				id: CLUSTER_COUNT_LAYER,
				type: 'symbol',
				source: SOURCE_ID,
				filter: ['has', 'point_count'],
				layout: {
					'text-field': ['get', 'point_count_abbreviated'],
					'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
					'text-size': 12,
					'text-allow-overlap': true
				},
				paint: {
					'text-color': labelColor
				}
			});
		}

		if (!map.getLayer(POINT_LAYER)) {
			map.addLayer({
				id: POINT_LAYER,
				type: 'circle',
				source: SOURCE_ID,
				filter: ['!', ['has', 'point_count']],
				paint: {
					'circle-color': [
						'match',
						['get', 'activityType'],
						'lecture',
						colors.accent,
						'event',
						colors.highlight,
						'conference',
						colors.purple,
						'workshop',
						colors.pink,
						/* other */ colors.primary
					],
					'circle-radius': 7,
					'circle-stroke-width': 2,
					'circle-stroke-color': strokeColor
				}
			});
		}

		bindLayerInteractions();
	}

	// Attach click + cursor handlers. Safe to call after every setupClusterLayers().
	let interactionsBound = false;
	function bindLayerInteractions() {
		if (!map || interactionsBound) return;
		interactionsBound = true;

		// Cluster click: smoothly zoom to the expansion level.
		map.on('click', CLUSTER_LAYER, async (e) => {
			if (!map) return;
			const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] });
			const feature = features[0];
			if (!feature || feature.geometry.type !== 'Point') return;
			const clusterId = feature.properties?.cluster_id as number | undefined;
			if (clusterId === undefined) return;
			const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
			if (!source) return;
			try {
				const zoom = await source.getClusterExpansionZoom(clusterId);
				map.easeTo({
					center: feature.geometry.coordinates as [number, number],
					zoom,
					duration: prefersReducedMotion() ? 0 : 500
				});
			} catch (err) {
				if (import.meta.env.DEV) console.error('Cluster expansion failed:', err);
			}
		});

		// Unclustered point click: open a popup anchored at the feature.
		map.on('click', POINT_LAYER, (e) => {
			if (!map || !maplibregl) return;
			const feature = e.features?.[0];
			if (!feature || feature.geometry.type !== 'Point') return;

			const coords = (feature.geometry.coordinates as [number, number]).slice() as [number, number];
			const props = feature.properties ?? {};
			const item: MarkerData = {
				id: String(props.id),
				title: String(props.title),
				coordinates: { longitude: coords[0], latitude: coords[1] },
				year: typeof props.year === 'number' ? props.year : undefined,
				activityType: typeof props.activityType === 'string' ? props.activityType : undefined,
				image: typeof props.image === 'string' ? props.image : undefined
			};

			if (activePopup) {
				activePopup.remove();
				activePopup = null;
			}

			const popup = new maplibregl.Popup({
				offset: 12,
				className: 'map-popup',
				closeButton: true,
				closeOnClick: true,
				maxWidth: '280px'
			})
				.setLngLat(coords)
				.setHTML(createPopupContent(item))
				.addTo(map);

			popup.on('open', () => keepPopupInView(popup));
			popup.on('close', () => {
				if (activePopup === popup) activePopup = null;
			});
			activePopup = popup;
		});

		// Cursor feedback.
		for (const layer of [CLUSTER_LAYER, POINT_LAYER]) {
			map.on('mouseenter', layer, () => {
				if (map) map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', layer, () => {
				if (map) map.getCanvas().style.cursor = '';
			});
		}
	}

	// Push data into the existing source + fit the camera.
	function pushMarkersToSource(data: MarkerData[]) {
		if (!map || !maplibregl) return;

		if (activePopup) {
			activePopup.remove();
			activePopup = null;
		}

		const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
		if (!source) return;
		source.setData(buildFeatureCollection(data));

		const validPoints = data.filter((item) => item.coordinates);
		if (validPoints.length === 0) return;

		const bounds = new maplibregl.LngLatBounds();
		validPoints.forEach((item) => {
			bounds.extend([item.coordinates.longitude, item.coordinates.latitude]);
		});
		if (bounds.isEmpty()) return;

		const reducedMotion = prefersReducedMotion();
		map.fitBounds(bounds, {
			padding: 60,
			maxZoom: validPoints.length === 1 ? 6 : 10,
			duration: reducedMotion ? 0 : 1200,
			// `curve: 1.4` gives a gentle ease that reads well in globe projection.
			curve: 1.4
		});
	}

	// Main effect for initialization and cleanup
	$effect(() => {
		if (!browser || !mapContainer) return;

		let mapInstance: MapLibreMap | null = null;
		let cancelled = false;

		// Initialize map asynchronously
		(async () => {
			try {
				if (!hasWebGLSupport()) {
					importError =
						'WebGL is not supported in your browser. Please enable hardware acceleration or try a different browser.';
					return;
				}

				// Wait for the container to have non-zero layout dimensions.
				const ready = await waitForContainerLayout(mapContainer);
				if (cancelled) return;
				if (!ready) {
					importError = 'Map container has no dimensions. Please try refreshing the page.';
					return;
				}

				// Load MapLibre + CSS + configure the CSP-safe worker (shared across maps).
				maplibregl = await loadMapLibre();
				if (cancelled || !mapContainer?.isConnected) return;

				// Determine initial style based on theme
				const initialDarkMode = darkModeDetected;
				const initialStyle = initialDarkMode ? MAP_STYLES.dark : MAP_STYLES.light;
				currentThemeIsDark = initialDarkMode;

				const centerLng = initialView[1] ?? 0;
				const centerLat = initialView[0] ?? 20;

				mapInstance = new maplibregl.Map({
					container: mapContainer,
					style: initialStyle,
					center: [centerLng, centerLat],
					zoom: initialZoom ?? 2,
					maxZoom: maxZoom ?? 19,
					minZoom: 1,
					// Requires Ctrl/Cmd + scroll (or two-finger gesture) to zoom,
					// so the map doesn't hijack page scroll on long pages.
					cooperativeGestures: true
				});

				map = mapInstance;
				map.addControl(new maplibregl.NavigationControl(), 'top-right');
				map.addControl(new maplibregl.GlobeControl(), 'top-right');
				map.addControl(new maplibregl.FullscreenControl(), 'top-right');

				map.on('load', () => {
					isMapLoaded = true;
					// Default to the mercator (flat) projection. The GlobeControl button
					// in the top-right lets visitors switch to globe if they want.
					setupClusterLayers();
					pushMarkersToSource(markersData);
				});

				map.on('error', (e) => {
					if (import.meta.env.DEV) console.error('MapLibre error:', e.error);
				});
			} catch (error) {
				if (import.meta.env.DEV) console.error('Error initializing map:', error);
				importError = error instanceof Error ? error.message : 'Unknown error loading map';
			}
		})();

		// Cleanup function
		return () => {
			cancelled = true;
			isMapLoaded = false;
			interactionsBound = false;

			if (activePopup) {
				activePopup.remove();
				activePopup = null;
			}

			if (map) {
				map.remove();
				map = null;
			}

			maplibregl = null;
		};
	});

	// Reactive effect for markers: Update when markersData changes
	$effect(() => {
		if (browser && maplibregl && map && isMapLoaded) {
			pushMarkersToSource(markersData);
		}
	});

	// Reactive effect for theme: Update map style when theme changes
	$effect(() => {
		if (browser && maplibregl && map && isMapLoaded && darkModeDetected !== currentThemeIsDark) {
			updateMapStyle();
		}
	});
</script>

<div bind:this={mapContainer} class="map-container">
	{#if importError}
		<div class="map-error">
			<p>Error loading map: {importError}</p>
		</div>
	{/if}
	{#if showLegend && legendEntries.length > 0}
		<div class="map-legend glass-panel" role="group" aria-label="Activity type legend">
			<ul>
				{#each legendEntries as entry (entry.type)}
					<li>
						<span class="legend-swatch legend-swatch-{entry.colorKey}" aria-hidden="true"></span>
						<span class="legend-label">{entry.label}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	/* Map Container Base Styles */
	.map-container {
		width: 100%;
		height: 400px;
		position: relative;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		z-index: 1;
		isolation: isolate;
	}

	/*
	 * MapLibre controls z-index management — four-tier stack scoped to the map container.
	 * Uses --z-above (canvas) and --z-sticky/fixed (overlay chrome) so the map coexists
	 * predictably with the site's z-index scale.
	 */
	:global(.maplibregl-canvas-container),
	:global(.maplibregl-canvas) {
		z-index: var(--z-above) !important;
	}

	:global(.maplibregl-marker) {
		z-index: calc(var(--z-above) + 4) !important;
	}

	:global(.maplibregl-popup) {
		z-index: calc(var(--z-above) + 5) !important;
	}

	:global(.maplibregl-ctrl-group) {
		z-index: calc(var(--z-above) + 6) !important;
	}

	:global(.maplibregl-ctrl-top-right),
	:global(.maplibregl-ctrl-top-left),
	:global(.maplibregl-ctrl-bottom-right),
	:global(.maplibregl-ctrl-bottom-left) {
		z-index: calc(var(--z-above) + 7) !important;
	}

	/* Hide map elements when mobile menu is open */
	:global(body.mobile-menu-open .map-container) {
		z-index: var(--z-base);
	}

	:global(body.mobile-menu-open .maplibregl-ctrl),
	:global(body.mobile-menu-open .maplibregl-popup) {
		visibility: hidden !important;
	}

	/* Marker-colour legend (shown on the conference-activity map). */
	.map-legend {
		position: absolute;
		bottom: var(--space-3);
		left: var(--space-3);
		z-index: calc(var(--z-above) + 6);
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-xs);
		line-height: var(--line-height-normal);
		color: var(--color-text);
		pointer-events: auto;
	}

	.map-legend ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.map-legend li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.legend-swatch {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: var(--border-radius-full);
		border: 2px solid var(--color-surface);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-text) 20%, transparent);
		flex-shrink: 0;
	}

	/* Keep in sync with the `match` expression in setupClusterLayers(). */
	.legend-swatch-primary {
		background-color: var(--color-primary);
	}

	.legend-swatch-accent {
		background-color: var(--color-accent);
	}

	.legend-swatch-highlight {
		background-color: var(--color-highlight);
	}

	.legend-swatch-purple {
		background-color: var(--sys-color-purple-500);
	}

	.legend-swatch-pink {
		background-color: var(--sys-color-pink-500);
	}

	@media (--sm-down) {
		.map-legend {
			font-size: 0.6875rem;
			padding: var(--space-1) var(--space-2);
		}
	}

	/* Hide legend while the mobile menu is open (consistent with other overlays). */
	:global(body.mobile-menu-open) .map-legend {
		visibility: hidden;
	}

	.map-error {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: color-mix(in srgb, var(--color-danger) 10%, transparent);
		color: var(--color-danger);
		padding: var(--space-4);
		text-align: center;
	}

	/* Custom Marker Styles */
	:global(.map-marker) {
		cursor: pointer;
		width: var(--space-8);
		height: var(--space-8);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	:global(.map-marker svg) {
		width: 100%;
		height: 100%;
		color: var(--color-primary);
		fill: var(--color-background);
		fill-opacity: 0.9;
		stroke-width: 1.5;
		filter: drop-shadow(1px 1px 1px color-mix(in srgb, var(--color-black) 40%, transparent));
		transition:
			transform var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			fill var(--duration-fast) var(--ease-out);
	}

	:global(.map-marker:hover svg) {
		transform: scale(var(--scale-110));
	}

	/* Marker type variants */
	:global(.map-marker.marker-type-lecture svg) {
		color: var(--color-accent);
	}

	:global(.map-marker.marker-type-event svg) {
		color: var(--color-highlight);
	}

	/* Custom Popup Styles - Glassmorphism */
	:global(.map-popup .maplibregl-popup-content) {
		background-color: color-mix(in srgb, var(--color-background) 85%, transparent);
		backdrop-filter: blur(var(--glass-blur-md));
		-webkit-backdrop-filter: blur(var(--glass-blur-md));
		color: var(--color-text);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-glass);
		padding: 0;
		overflow: hidden;
		max-height: calc(100% - var(--space-4));
		border: 1px solid color-mix(in srgb, var(--color-white) 20%, transparent);
	}

	:global(.map-popup .maplibregl-popup-tip) {
		border-top-color: color-mix(in srgb, var(--color-background) 85%, transparent);
	}

	:global(.map-popup .maplibregl-popup-close-button) {
		color: var(--color-text-light);
		background-color: color-mix(in srgb, var(--color-white) 70%, transparent);
		border-radius: var(--border-radius-full);
		width: var(--space-5);
		height: var(--space-5);
		line-height: var(--space-5);
		text-align: center;
		top: var(--space-1);
		right: var(--space-1);
		font-size: 1.1em;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	:global(.map-popup .maplibregl-popup-close-button:hover) {
		color: var(--color-text);
		background-color: var(--color-white);
	}

	/* Popup content styles */
	:global(.map-popup img.map-popup-image) {
		width: 100%;
		height: var(--space-20);
		object-fit: cover;
		display: block;
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	:global(.map-popup .map-popup-content-text) {
		padding: var(--space-2) var(--space-3);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-normal);
	}

	:global(.map-popup .map-popup-link) {
		color: var(--color-text);
		text-decoration: none;
		display: block;
	}

	:global(.map-popup .map-popup-link strong) {
		color: var(--color-primary);
	}

	:global(.map-popup .map-popup-link:hover strong) {
		text-decoration: underline;
	}

	:global(.map-popup .map-popup-year) {
		font-size: 0.9em;
		opacity: 0.8;
		color: var(--color-text-light);
	}

	/* Navigation control styling */
	:global(.maplibregl-ctrl-group button) {
		background-color: var(--color-background);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	:global(.maplibregl-ctrl-group button:hover) {
		background-color: var(--color-surface);
	}

	:global(.maplibregl-ctrl-group button + button) {
		border-top: 1px solid var(--color-border);
	}

	/* Attribution styling */
	:global(.maplibregl-ctrl-attrib) {
		background-color: color-mix(in srgb, var(--color-background) 80%, transparent);
		font-size: var(--font-size-xs);
		padding: var(--space-1) var(--space-2);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		:global(.map-marker svg) {
			transition: none !important;
		}

		:global(.map-marker:hover svg) {
			transform: none !important;
		}
	}

	/* Dark mode adjustments for popup tip */
	:global(html.dark .map-popup .maplibregl-popup-tip) {
		border-top-color: color-mix(in srgb, var(--color-background) 85%, transparent);
	}

	:global(html.dark .map-popup .maplibregl-popup-close-button) {
		background-color: color-mix(in srgb, var(--color-white) 15%, transparent);
	}

	:global(html.dark .map-popup .maplibregl-popup-close-button:hover) {
		background-color: color-mix(in srgb, var(--color-white) 25%, transparent);
	}
</style>
