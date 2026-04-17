<!--
LocationMap - MapLibre visualization of per-country aggregated items.

Generic map component used by multiple visualisation pages (e.g. publications,
activities). Consumers aggregate their data into `LocationDatum[]` and pass a
`basePath` + `itemLabel` so the popup can link items back to their detail page.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { COUNTRY_COORDINATES, type LocationDatum } from '$lib/data/geo';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { getResolvedChartColors } from '$lib/utils/chartColorUtils';
	import {
		MAP_STYLES,
		loadMapLibre,
		prefersReducedMotion,
		waitForContainerLayout,
		type MapLibreModule
	} from '$lib/utils/maplibre';
	import type { Map as MapLibreMap, Popup } from 'maplibre-gl';

	// Props
	let {
		data = [] as LocationDatum[],
		/** Route prefix used for item links, e.g. '/publications' or '/activities'. */
		basePath,
		/** Singular label for the popup count line ("2 publications" / "2 activities"). */
		itemLabel,
		initialZoom = 2
	}: {
		data?: LocationDatum[];
		basePath: string;
		itemLabel: string;
		initialZoom?: number;
	} = $props();

	let mapContainer: HTMLElement;

	// State
	let map = $state<MapLibreMap | null>(null);
	let maplibregl = $state<MapLibreModule | null>(null);
	let importError = $state<string | null>(null);
	let currentThemeIsDark = $state<boolean | null>(null);
	let activePopup = $state<Popup | null>(null);
	// Imperative lookup keyed by country, only ever mutated from inside effects to
	// add/remove MapLibre markers. Not used reactively in the template, so a plain
	// Map (not SvelteMap) is appropriate.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const markers: Map<string, InstanceType<MapLibreModule['Marker']>> = new Map();
	let isMapLoaded = $state(false);

	// Theme detection
	let darkModeDetected = $derived.by(() => {
		const currentTheme = getTheme();
		return currentTheme === 'dark';
	});

	// Reactive color resolution for markers
	const resolvedColors = $derived(getResolvedChartColors());

	// Calculate max count for scaling marker sizes
	const maxCount = $derived(data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1);

	// Filter data to only include countries with coordinates
	const mappableData = $derived(data.filter((d) => COUNTRY_COORDINATES[d.country]));

	// Escape user-provided text so it's safe to interpolate into HTML strings
	// (including attribute values). The popup content is currently populated
	// from curated data, but escaping keeps us safe if that ever changes.
	function escapeHtml(value: string): string {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function pluralLabel(count: number): string {
		return `${count} ${itemLabel}${count > 1 ? 's' : ''}`;
	}

	// Create popup content
	function createPopupContent(datum: LocationDatum): string {
		let content = `<div class="location-popup">
			<strong>${escapeHtml(datum.country)}</strong>
			<div class="item-count">${pluralLabel(datum.count)}</div>`;

		if (datum.items.length <= 6) {
			content += '<ul class="item-list">';
			datum.items.forEach((item) => {
				const fullTitle = escapeHtml(item.title);
				const isTruncated = item.title.length > 50;
				const truncated = isTruncated
					? escapeHtml(item.title.substring(0, 50)) + '&hellip;'
					: fullTitle;
				const itemUrl = `${base}${basePath}/${item.id}`;
				content += `<li>
					<a href="${itemUrl}" class="item-link" title="${fullTitle}">
						<span class="item-title">${truncated}</span>
						${item.subtitle ? `<span class="item-subtitle">${escapeHtml(item.subtitle)}</span>` : ''}
					</a>
				</li>`;
			});
			content += '</ul>';
		} else {
			// Group by subtitle (e.g. publisher, venue) with list of item IDs
			const bySubtitle: Record<
				string,
				{ count: number; items: Array<{ id: string; title: string }> }
			> = {};
			datum.items.forEach((item) => {
				const key = item.subtitle || 'Other';
				if (!bySubtitle[key]) {
					bySubtitle[key] = { count: 0, items: [] };
				}
				bySubtitle[key].count++;
				bySubtitle[key].items.push({ id: item.id, title: item.title });
			});
			content += '<ul class="item-list">';
			Object.entries(bySubtitle)
				.sort((a, b) => b[1].count - a[1].count)
				.forEach(([subtitle, data]) => {
					content += `<li class="subtitle-group">
						<span class="item-subtitle">${escapeHtml(subtitle)}</span>: ${data.count}
						<ul class="item-sublist">`;
					data.items.slice(0, 3).forEach((item) => {
						const fullTitle = escapeHtml(item.title);
						const isTruncated = item.title.length > 40;
						const truncated = isTruncated
							? escapeHtml(item.title.substring(0, 40)) + '&hellip;'
							: fullTitle;
						content += `<li><a href="${base}${basePath}/${item.id}" class="item-link" title="${fullTitle}">${truncated}</a></li>`;
					});
					if (data.items.length > 3) {
						content += `<li class="more-items">+${data.items.length - 3} more</li>`;
					}
					content += '</ul></li>';
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
			const styleUrl = newDarkMode ? MAP_STYLES.dark : MAP_STYLES.light;
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

		mappableData.forEach((datum) => {
			const coords = COUNTRY_COORDINATES[datum.country];
			if (!coords || !maplibregl) return;

			// Scale marker size based on item count
			const minSize = 20;
			const maxSize = 45;
			const scale = Math.sqrt(datum.count / maxCount);
			const size = minSize + scale * (maxSize - minSize);

			// Create custom marker element using resolved theme colors
			const el = document.createElement('div');
			el.className = 'location-marker';
			el.style.width = `${size}px`;
			el.style.height = `${size}px`;
			el.innerHTML = `
				<svg viewBox="0 0 24 24" width="${size}" height="${size}">
					<circle cx="12" cy="12" r="10" fill="${resolvedColors.primary}" fill-opacity="0.85" stroke="${resolvedColors.surface}" stroke-width="2"/>
					<text x="12" y="16" text-anchor="middle" fill="${resolvedColors.surface}" font-size="10" font-weight="bold">${datum.count}</text>
				</svg>
			`;

			const popup = new maplibregl.Popup({
				offset: size / 2 + 5,
				className: 'map-popup location-map-popup',
				closeButton: true,
				closeOnClick: true,
				maxWidth: '300px'
			}).setHTML(createPopupContent(datum));

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([coords.lng, coords.lat])
				.setPopup(popup)
				.addTo(map!);

			markers.set(datum.country, marker);
		});

		// Fit bounds if we have markers
		if (mappableData.length > 0 && markers.size > 0) {
			const bounds = new maplibregl.LngLatBounds();
			mappableData.forEach((datum) => {
				const coords = COUNTRY_COORDINATES[datum.country];
				if (coords) {
					bounds.extend([coords.lng, coords.lat]);
				}
			});
			if (!bounds.isEmpty()) {
				map.fitBounds(bounds, {
					padding: 60,
					maxZoom: 5,
					duration: prefersReducedMotion() ? 0 : 1200,
					curve: 1.4
				});
			}
		}
	}

	// Initialize map
	$effect(() => {
		if (!browser || !mapContainer) return;

		// Snapshot reactive values synchronously before any await so we don't read
		// them in an async (inert) context.
		const initialDarkMode = darkModeDetected;

		let cancelled = false;

		(async () => {
			try {
				const ready = await waitForContainerLayout(mapContainer);
				if (cancelled) return;
				if (!ready) {
					importError = 'Map container has no dimensions. Please try refreshing the page.';
					return;
				}

				maplibregl = await loadMapLibre();
				if (cancelled || !mapContainer?.isConnected) return;

				const initialStyle = initialDarkMode ? MAP_STYLES.dark : MAP_STYLES.light;
				currentThemeIsDark = initialDarkMode;

				const mapInstance = new maplibregl.Map({
					container: mapContainer,
					style: initialStyle,
					center: [10, 30],
					zoom: initialZoom,
					minZoom: 1,
					attributionControl: false,
					// Ctrl/Cmd + scroll (or two-finger gesture) required to zoom, so the
					// map doesn't steal scroll on long visualisation pages.
					cooperativeGestures: true
				});

				map = mapInstance;
				map.addControl(new maplibregl.NavigationControl(), 'top-right');
				map.addControl(new maplibregl.GlobeControl(), 'top-right');
				map.addControl(new maplibregl.FullscreenControl(), 'top-right');
				map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

				map.on('load', () => {
					isMapLoaded = true;
					// Default to the mercator (flat) projection. The GlobeControl button
					// in the top-right lets visitors switch to globe if they want.
					addMarkers();
				});
			} catch (error) {
				if (import.meta.env.DEV) console.error('Error initializing map:', error);
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
			Note: {data.length - mappableData.length} location{data.length - mappableData.length > 1
				? 's'
				: ''}
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
	:global(.location-marker) {
		cursor: pointer;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	:global(.location-marker:hover) {
		transform: scale(1.15);
		z-index: 10 !important;
	}

	/* Popup styles - with glassmorphism */
	:global(.location-map-popup .maplibregl-popup-content) {
		background-color: var(--color-surface);
		color: var(--color-text);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
	}

	:global(.location-map-popup .maplibregl-popup-tip) {
		border-top-color: var(--color-surface);
	}

	:global(.location-map-popup .maplibregl-popup-close-button) {
		color: var(--color-text-muted);
		font-size: 18px;
		padding: 4px 8px;
		right: 2px;
		top: 2px;
	}

	:global(.location-map-popup .maplibregl-popup-close-button:hover) {
		color: var(--color-text);
		background-color: transparent;
	}

	:global(.location-popup) {
		font-size: var(--font-size-sm);
		color: var(--color-text);
	}

	:global(.location-popup strong) {
		color: var(--color-primary);
		font-size: var(--font-size-base);
		display: block;
		margin-bottom: var(--space-2xs);
	}

	:global(.location-popup .item-count) {
		color: var(--color-text-muted);
		margin-bottom: var(--space-xs);
		font-size: var(--font-size-xs);
	}

	:global(.location-popup .item-list) {
		list-style: none;
		padding: 0;
		margin: var(--space-xs) 0 0 0;
		max-height: 200px;
		overflow-y: auto;
	}

	:global(.location-popup .item-list li) {
		padding: var(--space-2xs) 0;
		border-bottom: 1px solid var(--color-border);
		font-size: var(--font-size-xs);
	}

	:global(.location-popup .item-list li:last-child) {
		border-bottom: none;
	}

	:global(.location-popup .item-link) {
		display: block;
		color: var(--color-text);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	:global(.location-popup .item-link:hover) {
		color: var(--color-primary);
	}

	:global(.location-popup .item-link:hover .item-title) {
		text-decoration: underline;
	}

	:global(.location-popup .item-title) {
		display: block;
		color: inherit;
	}

	:global(.location-popup .item-subtitle) {
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-xs);
	}

	:global(.location-popup .subtitle-group) {
		margin-bottom: var(--space-xs);
	}

	:global(.location-popup .item-sublist) {
		list-style: none;
		padding-left: var(--space-sm);
		margin: var(--space-2xs) 0 0 0;
	}

	:global(.location-popup .item-sublist li) {
		border-bottom: none;
		padding: var(--space-2xs) 0;
	}

	:global(.location-popup .item-sublist .item-link) {
		font-size: var(--font-size-xs);
	}

	:global(.location-popup .more-items) {
		color: var(--color-text-muted);
		font-style: italic;
		font-size: var(--font-size-xs);
	}

	/* Dark mode overrides */
	:global(html.dark .location-map-popup .maplibregl-popup-content) {
		background-color: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark .location-map-popup .maplibregl-popup-tip) {
		border-top-color: var(--color-surface);
	}

	@media (--sm-down) {
		.map-container {
			height: 350px;
		}
	}
</style>
