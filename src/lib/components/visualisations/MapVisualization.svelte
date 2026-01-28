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
	import type { Map as MapLibreMap, Popup } from 'maplibre-gl';

	// Map configuration props with defaults using Svelte 5 $props() rune
	let {
		markersData = [],
		initialView = [20, 0] as [number, number],
		initialZoom = 2,
		maxZoom = 19,
		maxClusterZoom = 18,
		preferDarkMode = null as boolean | null,
		restrictBounds = true
	}: {
		markersData?: MarkerData[];
		initialView?: [number, number];
		initialZoom?: number;
		maxZoom?: number;
		maxClusterZoom?: number;
		preferDarkMode?: boolean | null;
		restrictBounds?: boolean;
	} = $props();

	// Maximum bounds for the map (to prevent dragging to empty areas)
	const MAX_BOUNDS: [[number, number], [number, number]] = [
		[-180, -85], // Southwest: [lng, lat]
		[180, 85] // Northeast: [lng, lat]
	];

	// Map style options (light and dark themes)
	const styleOptions = {
		light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
	};

	let mapContainer: HTMLElement;

	// State variables using Svelte 5 $state() rune
	let map = $state<MapLibreMap | null>(null);
	let maplibregl = $state<typeof import('maplibre-gl') | null>(null);
	let importError = $state<string | null>(null);
	let currentThemeIsDark = $state<boolean | null>(null);
	let activePopup = $state<Popup | null>(null);
	let markers = $state<Map<string, InstanceType<typeof import('maplibre-gl').Marker>>>(new Map());
	let isMapLoaded = $state(false);

	// Check if WebGL is available
	function checkWebGLSupport(): boolean {
		if (!browser) return false;
		try {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			return gl !== null;
		} catch {
			return false;
		}
	}

	// Derived value for dark mode detection - reactive to theme store changes
	let darkModeDetected = $derived.by(() => {
		if (preferDarkMode !== null) return preferDarkMode;
		const currentTheme = getTheme();
		return currentTheme === 'dark';
	});

	// Function to update map style based on theme
	function updateMapStyle() {
		if (!map) return;

		const newDarkMode = darkModeDetected;
		if (newDarkMode !== currentThemeIsDark) {
			const styleUrl = newDarkMode ? styleOptions.dark : styleOptions.light;
			map.setStyle(styleUrl);
			currentThemeIsDark = newDarkMode;

			// Re-add markers after style change (maplibre clears markers on style change)
			map.once('style.load', () => {
				addMarkers(markersData);
			});
		}
	}

	// Function to create marker element
	function createMarkerElement(item: MarkerData): HTMLElement {
		const el = document.createElement('div');
		el.className = `map-marker ${item.activityType ? `marker-type-${item.activityType}` : ''}`;

		// Set explicit inline styles to ensure visibility
		el.style.width = '32px';
		el.style.height = '32px';
		el.style.cursor = 'pointer';
		el.style.display = 'flex';
		el.style.justifyContent = 'center';
		el.style.alignItems = 'center';

		// Get the color based on activity type - use EXPLICIT hex colors
		let strokeColor = '#9a4419'; // primary terracotta
		if (item.activityType === 'lecture') {
			strokeColor = '#c4a35a'; // accent gold
		} else if (item.activityType === 'event') {
			strokeColor = '#f59e0b'; // highlight amber
		}

		// Use inline style attribute to ensure fill color is not overridden by global CSS
		el.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" 
				style="fill: #ffffff !important; stroke: ${strokeColor}; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));">
				<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" style="fill: #ffffff;"/>
				<circle cx="12" cy="10" r="3" style="fill: ${strokeColor};"/>
			</svg>
		`;

		return el;
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

	function prefersReducedMotion(): boolean {
		if (!browser) return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
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

	// Function to add markers to the map
	function addMarkers(data: MarkerData[]) {
		if (!map || !maplibregl) return;

		// Clear existing markers
		markers.forEach((marker) => marker.remove());
		markers.clear();

		// Close any active popup
		if (activePopup) {
			activePopup.remove();
			activePopup = null;
		}

		data.forEach((item) => {
			if (!item.coordinates || !maplibregl) return;

			// Get color based on activity type
			let markerColor = '#9a4419'; // terracotta - default
			if (item.activityType === 'lecture') {
				markerColor = '#c4a35a'; // gold
			} else if (item.activityType === 'event') {
				markerColor = '#f59e0b'; // amber
			} else if (item.activityType === 'conference') {
				markerColor = '#8b5cf6'; // purple
			} else if (item.activityType === 'workshop') {
				markerColor = '#ec4899'; // pink
			}

			const popup = new maplibregl.Popup({
				offset: 25,
				className: 'map-popup',
				closeButton: true,
				closeOnClick: true,
				maxWidth: '280px'
			}).setHTML(createPopupContent(item));

			popup.on('open', () => keepPopupInView(popup));

			// Use the DEFAULT MapLibre marker with color option - this is the official way
			const marker = new maplibregl.Marker({ color: markerColor })
				.setLngLat([item.coordinates.longitude, item.coordinates.latitude])
				.setPopup(popup)
				.addTo(map!);

			markers.set(item.id, marker);
		});

		// Fit bounds to markers if there are any
		if (data.length > 0 && markers.size > 0) {
			const bounds = new maplibregl.LngLatBounds();
			data.forEach((item) => {
				if (item.coordinates) {
					bounds.extend([item.coordinates.longitude, item.coordinates.latitude]);
				}
			});

			if (!bounds.isEmpty()) {
				map.fitBounds(bounds, {
					padding: 50,
					maxZoom: 10
				});
			}
		}
	}

	// Main effect for initialization and cleanup
	$effect(() => {
		if (!browser || !mapContainer) return;

		let mapInstance: MapLibreMap | null = null;
		let cancelled = false;

		// Initialize map asynchronously
		(async () => {
			try {
				// Check WebGL support first
				if (!checkWebGLSupport()) {
					importError =
						'WebGL is not supported in your browser. Please enable hardware acceleration or try a different browser.';
					return;
				}

				// Wait multiple frames to ensure container is fully laid out
				await new Promise((resolve) => setTimeout(resolve, 50));
				await new Promise((resolve) => requestAnimationFrame(resolve));
				await new Promise((resolve) => requestAnimationFrame(resolve));

				// Check if cancelled during wait
				if (cancelled) return;

				// Check if container has valid dimensions
				const rect = mapContainer.getBoundingClientRect();
				if (rect.width === 0 || rect.height === 0) {
					console.warn('Map container has zero dimensions, waiting...');
					await new Promise((resolve) => setTimeout(resolve, 300));
					const retryRect = mapContainer.getBoundingClientRect();
					if (retryRect.width === 0 || retryRect.height === 0) {
						importError = 'Map container has no dimensions. Please try refreshing the page.';
						return;
					}
				}

				if (cancelled) return;

				// Dynamically import MapLibre GL JS
				maplibregl = await import('maplibre-gl');

				// Import CSS
				await import('maplibre-gl/dist/maplibre-gl.css');

				if (cancelled) return;

				// Ensure container is still valid
				if (!mapContainer || !mapContainer.isConnected) return;

				// Final check for container dimensions
				const finalRect = mapContainer.getBoundingClientRect();
				if (finalRect.width < 1 || finalRect.height < 1) {
					importError = 'Map container has no dimensions';
					return;
				}

				// Determine initial style based on theme
				const initialDarkMode = darkModeDetected;
				const initialStyle = initialDarkMode ? styleOptions.dark : styleOptions.light;
				currentThemeIsDark = initialDarkMode;

				// Compute center - ensure valid coordinates
				const centerLng = initialView[1] ?? 0;
				const centerLat = initialView[0] ?? 20;

				// Initialize the map with minimal options
				mapInstance = new maplibregl.Map({
					container: mapContainer,
					style: initialStyle,
					center: [centerLng, centerLat],
					zoom: initialZoom ?? 2,
					maxZoom: maxZoom ?? 19,
					minZoom: 2
				});

				map = mapInstance;

				// Add navigation controls
				map.addControl(new maplibregl.NavigationControl(), 'top-right');

				// Add fullscreen control
				map.addControl(new maplibregl.FullscreenControl(), 'top-right');

				// Add markers when map is ready
				map.on('load', () => {
					isMapLoaded = true;
					addMarkers(markersData);
				});

				// Handle errors during map operation
				map.on('error', (e) => {
					console.error('MapLibre error:', e.error);
				});
			} catch (error) {
				console.error('Error initializing map:', error);
				importError = error instanceof Error ? error.message : 'Unknown error loading map';
			}
		})();

		// Cleanup function
		return () => {
			cancelled = true;
			isMapLoaded = false;

			if (activePopup) {
				activePopup.remove();
				activePopup = null;
			}

			markers.forEach((marker) => marker.remove());
			markers.clear();

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
			addMarkers(markersData);
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

	/* MapLibre controls z-index management */
	:global(.maplibregl-ctrl-top-right),
	:global(.maplibregl-ctrl-top-left),
	:global(.maplibregl-ctrl-bottom-right),
	:global(.maplibregl-ctrl-bottom-left) {
		z-index: 8 !important;
	}

	:global(.maplibregl-canvas-container),
	:global(.maplibregl-canvas) {
		/* Keep the WebGL canvas below markers/popups/controls */
		z-index: 1 !important;
	}

	/* Markers are DOM overlays; ensure they sit above the canvas */
	:global(.maplibregl-marker) {
		z-index: 5 !important;
	}

	:global(.maplibregl-ctrl-group) {
		z-index: 7 !important;
	}

	:global(.maplibregl-popup) {
		z-index: 6 !important;
	}

	/* Hide map elements when mobile menu is open */
	:global(body.mobile-menu-open .map-container) {
		z-index: 0;
	}

	:global(body.mobile-menu-open .maplibregl-ctrl),
	:global(body.mobile-menu-open .maplibregl-popup) {
		visibility: hidden !important;
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
