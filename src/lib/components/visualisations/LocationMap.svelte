<!--
LocationMap - MapLibre visualization of per-country aggregated items.

Generic map component used by multiple visualisation pages (e.g. publications,
activities). Consumers aggregate their data into `LocationDatum[]` and pass a
`basePath` + `itemLabel` so the popup can link items back to their detail page.
-->
<script lang="ts">
	import { base } from '$app/paths';
	import { COUNTRY_COORDINATES, type LocationDatum } from '$lib/data/geo';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { getResolvedChartColors } from '$lib/utils/chartColorUtils';
	import {
		buildChoroplethBins,
		buildChoroplethFillExpression,
		buildChoroplethPalette,
		enrichCountryBoundaries,
		mixRgbColors,
		type CountryBoundaryCollection
	} from '$lib/utils/choropleth';
	import { toRgbString } from '$lib/utils/colorContrast';
	import { prefersReducedMotion, type MapLibreModule } from '$lib/utils/maplibre';
	import { useMapLibre } from '$lib/utils/useMapLibre.svelte';
	import { createContainedPopup } from '$lib/utils/mapPopups';
	import { onMount } from 'svelte';
	import type { Map as MapLibreMap, MapLayerMouseEvent, Popup } from 'maplibre-gl';

	type MapViewMode = 'markers' | 'choropleth';
	type ChoroplethStatus = 'idle' | 'loading' | 'ready' | 'error';

	const VIEW_MODE_STORAGE_KEY = 'location-map-view-mode';
	const COUNTRY_BOUNDARY_URL = `${base}/data/world-countries-110m.geojson`;
	const CHOROPLETH_SOURCE_ID = 'location-country-boundaries';
	const CHOROPLETH_BASE_LAYER_ID = 'location-country-outlines';
	const CHOROPLETH_FILL_LAYER_ID = 'location-country-fills';

	// Props
	let {
		data = [] as LocationDatum[],
		/** Route prefix used for item links, e.g. '/publications' or '/activities'. */
		basePath,
		/** Singular label for the popup count line ("2 publications" / "2 activities"). */
		itemLabel,
		initialZoom = 2,
		/**
		 * Set to true when the map could not be initialised, so the section around
		 * it can stop promising controls that are not there (bindable, read-only
		 * from the consumer's side).
		 */
		failed = $bindable(false)
	}: {
		data?: LocationDatum[];
		basePath: string;
		itemLabel: string;
		initialZoom?: number;
		failed?: boolean;
	} = $props();

	let mapContainer: HTMLElement;
	let choroplethStatusRegion = $state<HTMLElement | null>(null);

	// State
	let activePopup: Popup | null = null;
	let viewMode = $state<MapViewMode>('markers');
	let choroplethStatus = $state<ChoroplethStatus>('idle');
	let boundaryCache: CountryBoundaryCollection | null = null;
	let boundaryPromise: Promise<CountryBoundaryCollection> | null = null;
	let viewRenderId = 0;
	let choroplethInteractionsRegistered = false;
	// Imperative lookup keyed by country, only ever mutated from inside effects to
	// add/remove MapLibre markers. Not used reactively in the template, so a plain
	// Map (not SvelteMap) is appropriate.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const markers: Map<string, InstanceType<MapLibreModule['Marker']>> = new Map();

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
	const choroplethPalette = $derived(
		buildChoroplethPalette(resolvedColors.surface, resolvedColors.accent, 5).map(toRgbString)
	);
	const choroplethBins = $derived(
		buildChoroplethBins(
			mappableData.map((datum) => datum.count),
			choroplethPalette
		)
	);
	const noDataColor = $derived(
		toRgbString(mixRgbColors(resolvedColors.surface, resolvedColors.border, 0.2))
	);
	const legendTitle = $derived(
		`${pluralizeItemLabel(2).charAt(0).toUpperCase()}${pluralizeItemLabel(2).slice(1)} per country`
	);

	onMount(() => {
		try {
			const savedMode = window.sessionStorage.getItem(VIEW_MODE_STORAGE_KEY);
			if (savedMode === 'markers' || savedMode === 'choropleth') viewMode = savedMode;
		} catch {
			// Session storage may be unavailable in strict privacy contexts.
		}
	});

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

	function pluralizeItemLabel(count: number): string {
		if (count === 1) return itemLabel;
		if (/[^aeiou]y$/i.test(itemLabel)) return `${itemLabel.slice(0, -1)}ies`;
		return `${itemLabel}s`;
	}

	function pluralLabel(count: number): string {
		return `${count} ${pluralizeItemLabel(count)}`;
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

	function clearActivePopup() {
		if (!activePopup) return;
		activePopup.remove();
		activePopup = null;
	}

	function clearMarkers() {
		markers.forEach((marker) => marker.remove());
		markers.clear();
	}

	function handleChoroplethClick(event: MapLayerMouseEvent) {
		const iso3 = String(event.features?.[0]?.properties?.iso3 ?? '');
		const datum = mappableData.find(
			(candidate) => COUNTRY_COORDINATES[candidate.country]?.iso3 === iso3
		);
		const activeMap = ml.map;
		const gl = ml.maplibregl;
		if (!datum || !activeMap || !gl) return;

		clearActivePopup();
		activePopup = createContainedPopup(
			gl,
			activeMap,
			mapContainer,
			{
				lngLat: [event.lngLat.lng, event.lngLat.lat],
				className: 'map-popup location-map-popup',
				offset: 8,
				maxWidth: '300px'
			},
			createPopupContent(datum)
		);
		activePopup.addTo(activeMap);
	}

	function handleChoroplethMouseEnter() {
		const activeMap = ml.map;
		if (activeMap) activeMap.getCanvas().style.cursor = 'pointer';
	}

	function handleChoroplethMouseLeave() {
		const activeMap = ml.map;
		if (activeMap) activeMap.getCanvas().style.cursor = '';
	}

	function registerChoroplethInteractions(activeMap: MapLibreMap) {
		if (choroplethInteractionsRegistered) return;
		activeMap.on('click', CHOROPLETH_FILL_LAYER_ID, handleChoroplethClick);
		activeMap.on('mouseenter', CHOROPLETH_FILL_LAYER_ID, handleChoroplethMouseEnter);
		activeMap.on('mouseleave', CHOROPLETH_FILL_LAYER_ID, handleChoroplethMouseLeave);
		choroplethInteractionsRegistered = true;
	}

	function unregisterChoroplethInteractions(activeMap: MapLibreMap) {
		if (!choroplethInteractionsRegistered) return;
		activeMap.off('click', CHOROPLETH_FILL_LAYER_ID, handleChoroplethClick);
		activeMap.off('mouseenter', CHOROPLETH_FILL_LAYER_ID, handleChoroplethMouseEnter);
		activeMap.off('mouseleave', CHOROPLETH_FILL_LAYER_ID, handleChoroplethMouseLeave);
		activeMap.getCanvas().style.cursor = '';
		choroplethInteractionsRegistered = false;
	}

	function clearChoropleth(activeMap: MapLibreMap) {
		unregisterChoroplethInteractions(activeMap);
		if (activeMap.getLayer(CHOROPLETH_FILL_LAYER_ID)) {
			activeMap.removeLayer(CHOROPLETH_FILL_LAYER_ID);
		}
		if (activeMap.getLayer(CHOROPLETH_BASE_LAYER_ID)) {
			activeMap.removeLayer(CHOROPLETH_BASE_LAYER_ID);
		}
		if (activeMap.getSource(CHOROPLETH_SOURCE_ID)) {
			activeMap.removeSource(CHOROPLETH_SOURCE_ID);
		}
	}

	function fitDataBounds(activeMap: MapLibreMap, gl: MapLibreModule) {
		if (mappableData.length === 0) return;
		const bounds = new gl.LngLatBounds();
		for (const datum of mappableData) {
			const coords = COUNTRY_COORDINATES[datum.country];
			if (coords) bounds.extend([coords.lng, coords.lat]);
		}
		if (bounds.isEmpty()) return;
		activeMap.fitBounds(bounds, {
			padding: 60,
			maxZoom: 5,
			duration: prefersReducedMotion() ? 0 : 1200,
			curve: 1.4
		});
	}

	// Add the default proportional-marker view.
	function addMarkers(fitBounds = true) {
		const activeMap = ml.map;
		const gl = ml.maplibregl;
		if (!activeMap || !gl) return;

		clearChoropleth(activeMap);
		clearMarkers();
		clearActivePopup();

		mappableData.forEach((datum) => {
			const coords = COUNTRY_COORDINATES[datum.country];
			if (!coords) return;

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
					<circle cx="12" cy="12" r="10" fill="${resolvedColors.accent}" fill-opacity="0.9" stroke="${resolvedColors.surface}" stroke-width="2"/>
					<text x="12" y="16" text-anchor="middle" fill="${resolvedColors.surface}" font-size="10" font-weight="bold" font-family="${resolvedColors.fontFamily}">${datum.count}</text>
				</svg>
			`;

			const popup = createContainedPopup(
				gl,
				activeMap,
				mapContainer,
				{
					lngLat: [coords.lng, coords.lat],
					className: 'map-popup location-map-popup',
					offset: size / 2 + 5,
					maxWidth: '300px'
				},
				createPopupContent(datum)
			);

			const marker = new gl.Marker({ element: el })
				.setLngLat([coords.lng, coords.lat])
				.setPopup(popup)
				.addTo(activeMap);

			markers.set(datum.country, marker);
		});

		if (fitBounds) fitDataBounds(activeMap, gl);
	}

	async function loadCountryBoundaries(): Promise<CountryBoundaryCollection> {
		if (boundaryCache) return boundaryCache;
		if (!boundaryPromise) {
			boundaryPromise = fetch(COUNTRY_BOUNDARY_URL)
				.then(async (response) => {
					if (!response.ok) {
						throw new Error(`Country boundaries returned HTTP ${response.status}.`);
					}
					const collection = (await response.json()) as CountryBoundaryCollection;
					if (collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
						throw new Error('Country boundary data has an invalid format.');
					}
					boundaryCache = collection;
					return collection;
				})
				.catch((error) => {
					boundaryPromise = null;
					throw error;
				});
		}
		return boundaryPromise;
	}

	async function addChoropleth(renderId: number) {
		const activeMap = ml.map;
		const gl = ml.maplibregl;
		if (!activeMap || !gl) return;

		// Markers remain as a useful fallback while the lazy boundary request is in flight.
		if (!boundaryCache) addMarkers();
		choroplethStatus = 'loading';

		try {
			const boundaries = await loadCountryBoundaries();
			if (renderId !== viewRenderId || viewMode !== 'choropleth' || ml.map !== activeMap) return;

			clearMarkers();
			clearActivePopup();
			clearChoropleth(activeMap);

			const enriched = enrichCountryBoundaries(boundaries, mappableData, COUNTRY_COORDINATES);
			activeMap.addSource(CHOROPLETH_SOURCE_ID, {
				type: 'geojson',
				data: enriched
			});

			const beforeLabels = activeMap
				.getStyle()
				.layers?.find((layer) => layer.type === 'symbol')?.id;
			const reducedMotion = prefersReducedMotion();
			activeMap.addLayer(
				{
					id: CHOROPLETH_BASE_LAYER_ID,
					type: 'fill',
					source: CHOROPLETH_SOURCE_ID,
					paint: {
						'fill-color': noDataColor,
						'fill-opacity': 0.18,
						'fill-outline-color': toRgbString(resolvedColors.border),
						'fill-layer-opacity': reducedMotion ? 1 : 0,
						'fill-layer-opacity-transition': { duration: reducedMotion ? 0 : 220, delay: 0 }
					}
				},
				beforeLabels
			);
			activeMap.addLayer(
				{
					id: CHOROPLETH_FILL_LAYER_ID,
					type: 'fill',
					source: CHOROPLETH_SOURCE_ID,
					filter: ['==', ['get', 'hasData'], true],
					paint: {
						'fill-color': buildChoroplethFillExpression(choroplethBins, noDataColor),
						'fill-opacity': 0.84,
						'fill-outline-color': toRgbString(resolvedColors.border),
						'fill-layer-opacity': reducedMotion ? 1 : 0,
						'fill-layer-opacity-transition': { duration: reducedMotion ? 0 : 220, delay: 0 }
					}
				},
				beforeLabels
			);

			registerChoroplethInteractions(activeMap);
			choroplethStatus = 'ready';
			fitDataBounds(activeMap, gl);

			if (!reducedMotion) {
				requestAnimationFrame(() => {
					if (activeMap.getLayer(CHOROPLETH_BASE_LAYER_ID)) {
						activeMap.setPaintProperty(CHOROPLETH_BASE_LAYER_ID, 'fill-layer-opacity', 1);
					}
					if (activeMap.getLayer(CHOROPLETH_FILL_LAYER_ID)) {
						activeMap.setPaintProperty(CHOROPLETH_FILL_LAYER_ID, 'fill-layer-opacity', 1);
					}
				});
			}
		} catch (error) {
			if (renderId !== viewRenderId || viewMode !== 'choropleth') return;
			choroplethStatus = 'error';
			// The reader is told what still works; the raw failure is a developer's
			// concern, not a sentence to put on the plate.
			if (import.meta.env.DEV) console.error('Country boundaries failed to load:', error);
		}
	}

	function renderMapView() {
		const renderId = ++viewRenderId;
		if (viewMode === 'markers') {
			choroplethStatus = 'idle';
			addMarkers();
			return;
		}
		void addChoropleth(renderId);
	}

	function selectViewMode(mode: MapViewMode) {
		if (viewMode === mode) return;
		viewMode = mode;
		try {
			window.sessionStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
		} catch {
			// The map still works when storage is blocked.
		}
	}

	function retryChoropleth() {
		boundaryPromise = null;
		boundaryCache = null;
		renderMapView();
		// The button the reader just pressed is replaced by the status line that
		// answers it, so move focus there rather than losing it to <body>.
		queueMicrotask(() => choroplethStatusRegion?.focus());
	}

	/**
	 * Give every attribution link the visually hidden ` (opens in new tab)` the
	 * rest of the site's external links carry. Idempotent: the control rebuilds
	 * its links on each style and source change, and an already-annotated link
	 * must not collect a second copy.
	 */
	function labelAttributionLinks() {
		const links = mapContainer?.querySelectorAll<HTMLAnchorElement>(
			'.maplibregl-ctrl-attrib a[target="_blank"]'
		);
		for (const link of links ?? []) {
			if (link.querySelector('.sr-only')) continue;
			const note = document.createElement('span');
			note.className = 'sr-only';
			note.textContent = ' (opens in new tab)';
			link.append(note);
		}
	}

	// Shared MapLibre lifecycle (WebGL guard, dynamic import, controls, theme
	// style swap, cleanup). The active view re-renders after style, data, or
	// mode changes; country boundaries are cached after their first lazy fetch.
	const ml = useMapLibre({
		getContainer: () => mapContainer,
		getMapOptions: () => ({
			center: [10, 30],
			zoom: initialZoom,
			minZoom: 1,
			attributionControl: false
		}),
		isDark: () => darkModeDetected,
		onInit: (m, gl) => {
			m.addControl(new gl.AttributionControl({ compact: true }), 'bottom-right');
			// The basemap credits are the one set of new-tab links on the site the
			// markup does not author: MapLibre builds them from the style's own
			// attribution string. Annotate them wherever the control rewrites
			// them, so CARTO and OpenStreetMap announce the new tab like every
			// other external link. Registered after `addControl`, so the control's
			// own handler has already run by the time this one does.
			m.on('styledata', labelAttributionLinks);
			m.on('sourcedata', labelAttributionLinks);
		},
		onStyleReady: () => renderMapView(),
		watchData: () => ({ data, viewMode }),
		onDataChange: () => renderMapView(),
		onCleanup: () => {
			viewRenderId++;
			clearActivePopup();
			clearMarkers();
			if (ml.map) clearChoropleth(ml.map);
		}
	});
	// The raw string is a renderer diagnostic (a WebGL message, a layout
	// failure); the reader gets the honest state, the console gets the rest, and
	// `failed` is the one flag both this template and the section around it read.
	$effect(() => {
		failed = ml.importError !== null;
	});
</script>

<div class="map-wrapper">
	{#if data.length > 0 && !failed}
		<div class="map-mode-panel">
			<div class="map-mode-toggle" role="group" aria-label="Map display mode">
				<button
					type="button"
					class:active={viewMode === 'markers'}
					aria-pressed={viewMode === 'markers'}
					onclick={() => selectViewMode('markers')}>Markers</button
				>
				<button
					type="button"
					class:active={viewMode === 'choropleth'}
					aria-pressed={viewMode === 'choropleth'}
					onclick={() => selectViewMode('choropleth')}>Country shading</button
				>
			</div>

			<!-- One persistent region, so "Try again" has somewhere to send focus
			     and the live region is not re-created between states. -->
			<div bind:this={choroplethStatusRegion} class="map-mode-region" tabindex="-1" role="status">
				{#if viewMode === 'choropleth' && choroplethStatus === 'loading'}
					<p class="map-mode-status">Loading country boundaries…</p>
				{:else if viewMode === 'choropleth' && choroplethStatus === 'error'}
					<div class="map-mode-status map-mode-error">
						<span>Country shading could not be loaded. The marker view still works.</span>
						<button type="button" onclick={retryChoropleth}>Try again</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	<div bind:this={mapContainer} class="map-container">
		{#if data.length > 0 && !failed}
			{#if viewMode === 'choropleth' && choroplethStatus === 'ready' && choroplethBins.length > 0}
				<div class="choropleth-legend" aria-label={legendTitle}>
					<span class="legend-title">{legendTitle}</span>
					<ul class="legend-scale">
						{#each choroplethBins as bin (bin.min)}
							<li>
								<span class="legend-swatch" style={`background-color: ${bin.color}`}></span>
								<span>{bin.label}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/if}

		{#if failed}
			<div class="state-note map-state-note" role="status">
				<span class="dateline">Map unavailable</span>
				<p>
					The map could not be loaded. The {itemLabel} counts below are the same records.
				</p>
			</div>
		{/if}
	</div>
	{#if data.length > 0 && mappableData.length < data.length}
		{@const unmapped = data.length - mappableData.length}
		<p class="unmapped-note">
			{unmapped}
			{unmapped === 1 ? 'location' : 'locations'} not shown: no coordinates recorded.
		</p>
	{/if}
</div>

<style>
	/* The mode panel is a sibling of the map rather than a child of it, so the
	 * narrow breakpoint can drop it out of the plate without moving markup. */
	.map-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.map-container {
		width: 100%;
		flex: 1;
		min-height: 350px;
		position: relative;
		border-radius: 0;
		overflow: hidden;
		z-index: 1;
		isolation: isolate;
	}

	.map-mode-panel {
		position: absolute;
		inset-block-start: var(--space-sm);
		inset-inline-start: var(--space-sm);
		z-index: 2;
		max-width: min(250px, calc(100% - 5rem));
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
	}

	.map-mode-toggle {
		display: inline-flex;
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
	}

	.map-mode-toggle button {
		min-height: 2rem;
		padding: var(--space-2xs) var(--space-sm);
		border: 0;
		border-inline-end: var(--border-width-thin) solid var(--color-border);
		background: transparent;
		color: var(--color-text-muted);
		font: inherit;
		line-height: 1;
		cursor: pointer;
	}

	.map-mode-toggle button:last-child {
		border-inline-end: 0;
	}

	.map-mode-toggle button:hover {
		color: var(--color-text);
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-elevated));
	}

	.map-mode-toggle button.active {
		background: var(--color-accent);
		color: var(--color-surface);
	}

	.map-mode-toggle button:focus-visible,
	.map-mode-status button:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
		position: relative;
		z-index: 1;
	}

	.map-mode-region:focus-visible {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	.map-mode-status {
		margin: var(--space-2xs) 0 0;
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		color: var(--color-text-muted);
		line-height: var(--line-height-normal);
		text-align: start;
		overflow-wrap: anywhere;
	}

	/* A failed fetch is not the reader's mistake, so the panel keeps the
	 * apparatus ink; --color-danger belongs to form validation. */
	.map-mode-error {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2xs);
	}

	.map-mode-status button {
		padding: 0;
		border: 0;
		background: transparent;
		color: currentColor;
		font: inherit;
		text-decoration: underline;
		text-underline-offset: 0.18em;
		cursor: pointer;
	}

	.choropleth-legend {
		position: absolute;
		inset-inline-start: var(--space-sm);
		inset-block-end: var(--space-sm);
		z-index: 2;
		width: min(270px, calc(100% - var(--space-lg)));
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border);
		color: var(--color-text);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
	}

	.legend-title {
		display: block;
		margin-bottom: var(--space-2xs);
		color: var(--color-text-muted);
		line-height: var(--line-height-tight);
	}

	.legend-scale {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.legend-scale li {
		flex: 1;
		min-width: 0;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.legend-swatch {
		display: block;
		height: 0.5rem;
		margin-bottom: var(--space-2xs);
		border-block: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
	}

	/* The honest state fills the plate the map would have occupied; the panel
	 * itself is the shared `.state-note` idiom (ink-signal.css). */
	.map-state-note {
		width: 100%;
		height: 100%;
	}

	.unmapped-note {
		margin-top: var(--space-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-align: center;
	}

	/* Custom marker styles. The print register allows no transform on hover, so
	 * the marker answers in ink: the disc goes opaque and its ring steps to the
	 * ink colour. Nothing moves, and nothing reflows the neighbouring discs. */
	:global(.location-marker) {
		cursor: pointer;
	}

	:global(.location-marker circle) {
		transition:
			fill-opacity var(--duration-fast) var(--ease-out),
			stroke var(--duration-fast) var(--ease-out);
	}

	:global(.location-marker:hover) {
		z-index: var(--z-dropdown) !important;
	}

	:global(.location-marker:hover circle) {
		fill-opacity: 1;
		stroke: var(--color-primary);
	}

	/* Popup styles — flat archival card: square, hairline, no shadow. */
	:global(.location-map-popup .maplibregl-popup-content) {
		background-color: var(--color-surface-elevated);
		color: var(--color-text);
		border-radius: 0;
		box-shadow: none;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
	}

	:global(.location-map-popup .maplibregl-popup-tip) {
		border-top-color: var(--color-surface-elevated);
	}

	:global(.location-map-popup .maplibregl-popup-close-button) {
		color: var(--color-text-muted);
		font-size: var(--font-size-lg);
		padding: var(--space-1) var(--space-2);
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
		color: var(--color-text-light);
		margin-bottom: var(--space-xs);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
	}

	:global(.location-popup .item-list) {
		list-style: none;
		padding: 0;
		margin: var(--space-xs) 0 0 0;
		max-height: 200px;
		overflow-y: auto;
		/* Layout formerly inherited from the global panels.css .item-list rule
		 * (now route-scoped to the panel components). */
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
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
		background-color: var(--color-surface-elevated);
		border-color: var(--color-border);
	}

	:global(html.dark .location-map-popup .maplibregl-popup-tip) {
		border-top-color: var(--color-surface-elevated);
	}

	@media (--sm-down) {
		.map-container {
			min-height: 300px;
		}

		/* A phone plate has no room for a panel floating over it: the mode
		 * control leaves the map and becomes a right-aligned control row above
		 * it, clear of the navigation buttons in the map's own top corner. */
		.map-mode-panel {
			position: static;
			max-width: none;
			margin-bottom: var(--space-xs);
			text-align: end;
		}

		.map-mode-toggle button {
			padding-inline: var(--space-xs);
		}

		.choropleth-legend {
			inset-inline-start: var(--space-xs);
			inset-block-end: var(--space-xs);
			width: calc(100% - var(--space-md));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.location-marker circle) {
			transition: none;
		}
	}
</style>
