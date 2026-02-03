<!--
Publisher Location Map - MapLibre visualization of publication venues by country
Shows where publications are published geographically using the publisherLocation field
-->
<script module lang="ts">
	// Data structure for publisher locations
	export type PublisherLocationData = {
		country: string;
		count: number;
		publications: Array<{ title: string; publisher?: string; type: string }>;
	};

	// Country coordinates (capital cities or geographic centers)
	export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
		// Europe
		'Netherlands': { lat: 52.3676, lng: 4.9041 },
		'Germany': { lat: 52.52, lng: 13.405 },
		'France': { lat: 48.8566, lng: 2.3522 },
		'United Kingdom': { lat: 51.5074, lng: -0.1278 },
		'UK': { lat: 51.5074, lng: -0.1278 },
		'Belgium': { lat: 50.8503, lng: 4.3517 },
		'Switzerland': { lat: 46.9481, lng: 7.4474 },
		'Austria': { lat: 48.2082, lng: 16.3738 },
		'Italy': { lat: 41.9028, lng: 12.4964 },
		'Spain': { lat: 40.4168, lng: -3.7038 },
		'Portugal': { lat: 38.7223, lng: -9.1393 },
		'Poland': { lat: 52.2297, lng: 21.0122 },
		'Sweden': { lat: 59.3293, lng: 18.0686 },
		'Norway': { lat: 59.9139, lng: 10.7522 },
		'Denmark': { lat: 55.6761, lng: 12.5683 },
		'Finland': { lat: 60.1699, lng: 24.9384 },

		// North America
		'United States': { lat: 38.9072, lng: -77.0369 },
		'USA': { lat: 38.9072, lng: -77.0369 },
		'Canada': { lat: 45.4215, lng: -75.6972 },

		// Africa
		'Senegal': { lat: 14.7167, lng: -17.4677 },
		'Côte d\'Ivoire': { lat: 6.8276, lng: -5.2893 },
		'Burkina Faso': { lat: 12.3714, lng: -1.5197 },
		'Mali': { lat: 12.6392, lng: -8.0029 },
		'Niger': { lat: 13.5137, lng: 2.1098 },
		'Nigeria': { lat: 9.0765, lng: 7.3986 },
		'Ghana': { lat: 5.6037, lng: -0.187 },
		'Togo': { lat: 6.1256, lng: 1.2254 },
		'Benin': { lat: 6.4969, lng: 2.6289 },
		'South Africa': { lat: -25.7479, lng: 28.2293 },
		'Kenya': { lat: -1.2921, lng: 36.8219 },
		'Egypt': { lat: 30.0444, lng: 31.2357 },
		'Morocco': { lat: 33.9716, lng: -6.8498 },
		'Tunisia': { lat: 36.8065, lng: 10.1815 },
		'Algeria': { lat: 36.7538, lng: 3.0588 },

		// Asia & Middle East
		'Japan': { lat: 35.6762, lng: 139.6503 },
		'China': { lat: 39.9042, lng: 116.4074 },
		'India': { lat: 28.6139, lng: 77.209 },
		'Singapore': { lat: 1.3521, lng: 103.8198 },
		'Australia': { lat: -35.2809, lng: 149.13 },

		// South America
		'Brazil': { lat: -15.7975, lng: -47.8919 },
		'Argentina': { lat: -34.6037, lng: -58.3816 }
	};
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { getResolvedChartColors } from '$lib/utils/chartColorUtils';
	import type { Map as MapLibreMap, Popup } from 'maplibre-gl';

	// Props
	let {
		data = [] as PublisherLocationData[],
		initialZoom = 2
	}: {
		data?: PublisherLocationData[];
		initialZoom?: number;
	} = $props();

	// Map style options
	const styleOptions = {
		light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
	};

	let mapContainer: HTMLElement;

	// State
	let map = $state<MapLibreMap | null>(null);
	let maplibregl = $state<typeof import('maplibre-gl') | null>(null);
	let importError = $state<string | null>(null);
	let currentThemeIsDark = $state<boolean | null>(null);
	let activePopup = $state<Popup | null>(null);
	let markers = $state<Map<string, InstanceType<typeof import('maplibre-gl').Marker>>>(new Map());
	let isMapLoaded = $state(false);

	// Theme detection
	let darkModeDetected = $derived.by(() => {
		const currentTheme = getTheme();
		return currentTheme === 'dark';
	});

	// Reactive color resolution for markers
	const resolvedColors = $derived(getResolvedChartColors());

	// Calculate max count for scaling marker sizes
	const maxCount = $derived(
		data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1
	);

	// Filter data to only include countries with coordinates
	const mappableData = $derived(
		data.filter((d) => COUNTRY_COORDINATES[d.country])
	);

	// Format type label
	function formatTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			article: 'Article',
			book: 'Book',
			chapter: 'Chapter',
			'special-issue': 'Special Issue',
			'bulletin-article': 'Bulletin',
			report: 'Report',
			blogpost: 'Blog'
		};
		return labels[type] || type;
	}

	// Create popup content
	function createPopupContent(item: PublisherLocationData): string {
		let content = `<div class="publisher-popup">
			<strong>${item.country}</strong>
			<div class="pub-count">${item.count} publication${item.count > 1 ? 's' : ''}</div>`;

		if (item.publications.length <= 6) {
			content += '<ul class="pub-list">';
			item.publications.forEach((pub) => {
				const truncated = pub.title.length > 50 ? pub.title.substring(0, 50) + '...' : pub.title;
				content += `<li>
					<span class="pub-title">${truncated}</span>
					${pub.publisher ? `<span class="pub-publisher">${pub.publisher}</span>` : ''}
				</li>`;
			});
			content += '</ul>';
		} else {
			// Group by publisher
			const byPublisher: Record<string, number> = {};
			item.publications.forEach((pub) => {
				const key = pub.publisher || 'Other';
				byPublisher[key] = (byPublisher[key] || 0) + 1;
			});
			content += '<ul class="pub-list">';
			Object.entries(byPublisher)
				.sort((a, b) => b[1] - a[1])
				.forEach(([publisher, count]) => {
					content += `<li><span class="pub-publisher">${publisher}</span>: ${count}</li>`;
				});
			content += '</ul>';
		}

		content += '</div>';
		return content;
	}

	// Update map style on theme change
	function updateMapStyle() {
		if (!map) return;
		const newDarkMode = darkModeDetected;
		if (newDarkMode !== currentThemeIsDark) {
			const styleUrl = newDarkMode ? styleOptions.dark : styleOptions.light;
			map.setStyle(styleUrl);
			currentThemeIsDark = newDarkMode;
			map.once('style.load', () => {
				addMarkers();
			});
		}
	}

	// Add markers to map
	function addMarkers() {
		if (!map || !maplibregl) return;

		// Clear existing
		markers.forEach((marker) => marker.remove());
		markers.clear();
		if (activePopup) {
			activePopup.remove();
			activePopup = null;
		}

		mappableData.forEach((item) => {
			const coords = COUNTRY_COORDINATES[item.country];
			if (!coords || !maplibregl) return;

			// Scale marker size based on publication count
			const minSize = 20;
			const maxSize = 45;
			const scale = Math.sqrt(item.count / maxCount);
			const size = minSize + scale * (maxSize - minSize);

			// Create custom marker element using resolved theme colors
			const el = document.createElement('div');
			el.className = 'publisher-marker';
			el.style.width = `${size}px`;
			el.style.height = `${size}px`;
			el.innerHTML = `
				<svg viewBox="0 0 24 24" width="${size}" height="${size}">
					<circle cx="12" cy="12" r="10" fill="${resolvedColors.primary}" fill-opacity="0.85" stroke="${resolvedColors.surface}" stroke-width="2"/>
					<text x="12" y="16" text-anchor="middle" fill="${resolvedColors.surface}" font-size="10" font-weight="bold">${item.count}</text>
				</svg>
			`;

			const popup = new maplibregl.Popup({
				offset: size / 2 + 5,
				className: 'map-popup publisher-location-popup',
				closeButton: true,
				closeOnClick: true,
				maxWidth: '300px'
			}).setHTML(createPopupContent(item));

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([coords.lng, coords.lat])
				.setPopup(popup)
				.addTo(map!);

			markers.set(item.country, marker);
		});

		// Fit bounds if we have markers
		if (mappableData.length > 0 && markers.size > 0) {
			const bounds = new maplibregl.LngLatBounds();
			mappableData.forEach((item) => {
				const coords = COUNTRY_COORDINATES[item.country];
				if (coords) {
					bounds.extend([coords.lng, coords.lat]);
				}
			});
			if (!bounds.isEmpty()) {
				map.fitBounds(bounds, {
					padding: 60,
					maxZoom: 5
				});
			}
		}
	}

	// Initialize map
	$effect(() => {
		if (!browser || !mapContainer) return;

		let mapInstance: MapLibreMap | null = null;
		let cancelled = false;

		(async () => {
			try {
				await new Promise((resolve) => setTimeout(resolve, 50));
				if (cancelled) return;

				maplibregl = await import('maplibre-gl');
				await import('maplibre-gl/dist/maplibre-gl.css');

				if (cancelled || !mapContainer?.isConnected) return;

				const initialDarkMode = darkModeDetected;
				const initialStyle = initialDarkMode ? styleOptions.dark : styleOptions.light;
				currentThemeIsDark = initialDarkMode;

				mapInstance = new maplibregl.Map({
					container: mapContainer,
					style: initialStyle,
					center: [10, 30],
					zoom: initialZoom,
					minZoom: 1
				});

				map = mapInstance;
				map.addControl(new maplibregl.NavigationControl(), 'top-right');
				map.addControl(new maplibregl.FullscreenControl(), 'top-right');

				map.on('load', () => {
					isMapLoaded = true;
					addMarkers();
				});
			} catch (error) {
				console.error('Error initializing map:', error);
				importError = error instanceof Error ? error.message : 'Unknown error loading map';
			}
		})();

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

	// Update markers when data changes
	$effect(() => {
		if (browser && maplibregl && map && isMapLoaded && data.length >= 0) {
			addMarkers();
		}
	});

	// Update style on theme change
	$effect(() => {
		if (browser && maplibregl && map && isMapLoaded && darkModeDetected !== currentThemeIsDark) {
			updateMapStyle();
		}
	});
</script>

<div class="map-wrapper">
	<div bind:this={mapContainer} class="map-container">
		{#if importError}
			<div class="map-error">
				<p>Error loading map: {importError}</p>
			</div>
		{/if}
	</div>
	{#if data.length > 0 && mappableData.length < data.length}
		<p class="unmapped-note">
			Note: {data.length - mappableData.length} location{data.length - mappableData.length > 1 ? 's' : ''}
			not shown (coordinates not available)
		</p>
	{/if}
</div>

<style>
	.map-wrapper {
		width: 100%;
	}

	.map-container {
		width: 100%;
		height: 450px;
		position: relative;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		z-index: 1;
		isolation: isolate;
	}

	.map-error {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: color-mix(in srgb, var(--color-danger) 10%, transparent);
		color: var(--color-danger);
		padding: var(--space-md);
		text-align: center;
	}

	.unmapped-note {
		margin-top: var(--space-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-align: center;
	}

	/* Custom marker styles */
	:global(.publisher-marker) {
		cursor: pointer;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	:global(.publisher-marker:hover) {
		transform: scale(1.15);
		z-index: 10 !important;
	}

	/* Popup styles - with glassmorphism */
	:global(.publisher-location-popup .maplibregl-popup-content) {
		background-color: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
	}

	:global(.publisher-location-popup .maplibregl-popup-tip) {
		border-top-color: var(--color-surface);
	}

	:global(.publisher-location-popup .maplibregl-popup-close-button) {
		color: var(--color-text-muted);
		font-size: 18px;
		padding: 4px 8px;
		right: 2px;
		top: 2px;
	}

	:global(.publisher-location-popup .maplibregl-popup-close-button:hover) {
		color: var(--color-text);
		background-color: transparent;
	}

	:global(.publisher-popup) {
		font-size: var(--font-size-sm);
		color: var(--color-text);
	}

	:global(.publisher-popup strong) {
		color: var(--color-primary);
		font-size: var(--font-size-base);
		display: block;
		margin-bottom: var(--space-2xs);
	}

	:global(.publisher-popup .pub-count) {
		color: var(--color-text-muted);
		margin-bottom: var(--space-xs);
		font-size: var(--font-size-xs);
	}

	:global(.publisher-popup .pub-list) {
		list-style: none;
		padding: 0;
		margin: var(--space-xs) 0 0 0;
		max-height: 200px;
		overflow-y: auto;
	}

	:global(.publisher-popup .pub-list li) {
		padding: var(--space-2xs) 0;
		border-bottom: 1px solid var(--color-border);
		font-size: var(--font-size-xs);
	}

	:global(.publisher-popup .pub-list li:last-child) {
		border-bottom: none;
	}

	:global(.publisher-popup .pub-title) {
		display: block;
		color: var(--color-text);
	}

	:global(.publisher-popup .pub-publisher) {
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Dark mode overrides */
	:global(html.dark .publisher-location-popup .maplibregl-popup-content) {
		background-color: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark .publisher-location-popup .maplibregl-popup-tip) {
		border-top-color: var(--color-surface);
	}

	@media (--sm-down) {
		.map-container {
			height: 350px;
		}
	}
</style>
