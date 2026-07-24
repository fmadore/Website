<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import '$styles/components/entity-index.css';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { communicationFilters } from '$lib/data/communications/filters.svelte';
	import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
	import UpcomingCommunications from '$lib/components/communications/UpcomingCommunications.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import EntityFilterBar from '$lib/components/entity-index/EntityFilterBar.svelte';
	import EntityFacetGrid from '$lib/components/entity-index/EntityFacetGrid.svelte';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import { sortItems } from '$lib/utils/sortUtils';
	import {
		COMMUNICATION_TYPE_LIST_LABELS,
		COMMUNICATION_TYPE_CHIP_LABELS
	} from '$lib/utils/typeUtils';
	import { areFiltersActive } from '$lib/utils/filterUtils';
	import { allCommunications, communicationsByYear } from '$lib/data/communications';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';
	import { organisedWorkshopsJsonLd } from '$lib/data/organisedWorkshops';
	import type { Communication } from '$lib/types/communication';

	// The runed filter system: `af` is the stable deep-reactive filter state,
	// `options` the static facet vocabularies. (Mirrors the /publications page.)
	const filters = communicationFilters;
	const af = filters.activeFilters;
	const options = filters.filterOptions;

	// Breadcrumbs + organiser-role schema.org Event graph.
	const breadcrumbs = createSectionBreadcrumbs('Talks & Events', '/conference-activity');
	useJsonLdScript('organised-workshops-json-ld', () => organisedWorkshopsJsonLd);

	// ── Corpus figures for the index hero (computed from the real dataset) ──────
	const totalEntries = allCommunications.length;
	const allYears = allCommunications
		.map((c) => c.year)
		.filter((y): y is number => Number.isFinite(y));
	const minYear = allYears.length ? Math.min(...allYears) : new Date().getFullYear();
	const maxYear = allYears.length ? Math.max(...allYears) : new Date().getFullYear();
	const countryCount = options.countries.length;

	// Per-year output counts → a continuous run of bars minYear..maxYear.
	const yearBars = (() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- one-shot local tally at module init, not reactive state
		const counts = new Map<number, number>();
		for (let y = minYear; y <= maxYear; y++) counts.set(y, 0);
		for (const [yearKey, comms] of Object.entries(communicationsByYear)) {
			const y = Number(yearKey);
			if (counts.has(y)) counts.set(y, (comms as unknown[]).length);
		}
		const max = Math.max(1, ...counts.values());
		return Array.from(counts.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([year, count]) => ({
				year,
				count,
				pct: count === 0 ? 6 : Math.round(12 + (count / max) * 88)
			}));
	})();

	// ── Local presentation state (does NOT touch the filter store) ──────────────
	let searchTerm = $state('');
	let activeSort = $state<'date' | 'title'>('date');
	let currentPage = $state(1);
	const PER_PAGE = 15;

	// Mobile: the whole facet apparatus collapses behind a toggle.
	let facetsOpen = $state(false);

	// Clears the system's filters plus the page-local free-text search.
	function clearAllNarrowing() {
		filters.clearAllFilters();
		searchTerm = '';
	}

	// ── Map (lazy — maplibre-gl is only fetched when the reader asks for it) ─────
	let MapVisualization:
		| typeof import('$lib/components/visualisations/MapVisualization.svelte').default
		| null = $state(null);
	let mapLoadError = $state(false);
	let showMap = $state(false);

	async function loadMapComponent() {
		if (MapVisualization) return;
		try {
			const module = await import('$lib/components/visualisations/MapVisualization.svelte');
			MapVisualization = module.default;
		} catch (e) {
			if (import.meta.env.DEV) console.error('Failed to load MapVisualization:', e);
			mapLoadError = true;
		}
	}

	function toggleMap() {
		showMap = !showMap;
		if (showMap) loadMapComponent();
	}

	// Haystack builder for the search — flattens the fields a scholar scans by.
	function matchesSearch(comm: Communication, q: string): boolean {
		if (!q) return true;
		const parts: string[] = [comm.title, String(comm.year ?? '')];
		if (comm.authors) parts.push(...comm.authors);
		if (comm.tags) parts.push(...comm.tags);
		if (comm.conference) parts.push(comm.conference);
		if (comm.location) parts.push(comm.location);
		if (comm.country) parts.push(comm.country);
		const hay = parts.join('  ').toLowerCase();
		return q
			.toLowerCase()
			.split(/\s+/)
			.filter(Boolean)
			.every((term) => hay.includes(term));
	}

	// Today (YYYY-MM-DD) for the upcoming/past split.
	const today = new Date().toISOString().split('T')[0]!;

	// The system's filtered list, narrowed by the free-text search.
	const searchedCommunications = $derived(
		filters.filteredItems.filter((comm) => matchesSearch(comm, searchTerm))
	);

	// Any narrowing at all — system filters OR the text search.
	const anyNarrowing = $derived(areFiltersActive(af) || searchTerm.trim().length > 0);

	// Upcoming talks surface as their own block only when nothing is narrowing the
	// list; otherwise they fold back into the main chronological record.
	const upcomingCommunications = $derived(
		sortItems(
			searchedCommunications.filter((comm) => comm.dateISO && comm.dateISO >= today),
			activeSort
		)
	);
	const shouldShowUpcoming = $derived(!anyNarrowing && upcomingCommunications.length > 0);

	// Main list: everything when narrowing; past-only when the upcoming block shows.
	const mainListBase = $derived(
		shouldShowUpcoming
			? searchedCommunications.filter((comm) => !comm.dateISO || comm.dateISO < today)
			: searchedCommunications
	);
	const sortedCommunications = $derived(sortItems(mainListBase, activeSort));
	const matchCount = $derived(sortedCommunications.length);

	// Count of active filter dimensions, for the "N FILTERS ACTIVE" readout.
	const activeFilterCount = $derived(
		af.types.length +
			af.languages.length +
			af.projects.length +
			af.authors.length +
			af.countries.length +
			af.tags.length +
			(af.yearRange ? 1 : 0) +
			(searchTerm.trim() ? 1 : 0)
	);

	// Map markers from the filtered set (independent of the upcoming/past split).
	const mapMarkers = $derived(
		filters.filteredItems
			.filter((comm: Communication) => comm.coordinates)
			.map((comm: Communication) => ({
				id: comm.id,
				title: comm.title,
				coordinates: comm.coordinates!,
				year: comm.year,
				activityType: comm.type,
				image: comm.image
			}))
	);

	// Reset to page 1 whenever the visible list identity changes.
	$effect(() => {
		void matchCount;
		void activeSort;
		void searchTerm;
		currentPage = 1;
	});

	// Clamp page if the list shrinks below the current window.
	const totalPages = $derived(Math.max(1, Math.ceil(matchCount / PER_PAGE)));
	const pageStart = $derived((Math.min(currentPage, totalPages) - 1) * PER_PAGE);
	const pageCommunications = $derived(sortedCommunications.slice(pageStart, pageStart + PER_PAGE));

	// Bibliography rows carry a hanging year, printed only when the year changes.
	// The single newest past entry is the lead — but only when the upcoming block
	// is not already carrying the "current" signal above it.
	const bibRows = $derived.by(() => {
		let lastYear: number | null = null;
		return pageCommunications.map((comm, i) => {
			const showYear = comm.year !== lastYear;
			lastYear = comm.year;
			const isLead =
				i === 0 &&
				currentPage === 1 &&
				activeSort === 'date' &&
				!anyNarrowing &&
				!shouldShowUpcoming;
			return { comm, yearLabel: showYear ? comm.year : null, isLead };
		});
	});

	// ── Type chips (real types + counts) ────────────────────────────────────────
	const typeLabels = COMMUNICATION_TYPE_LIST_LABELS;
	const typeChipLabels = COMMUNICATION_TYPE_CHIP_LABELS;
</script>

<SEO
	title="Talks & Events | Frédérick Madore"
	description="Academic conference presentations, workshops, and other speaking engagements by Frédérick Madore across Africa, Europe, and North America."
	keywords="conferences, presentations, workshops, panels, lectures, Islam, West Africa, digital humanities, Frédérick Madore"
	canonical="https://www.frederickmadore.com/conference-activity"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="entity-index page-enter" use:urlFilterSync={{ filters: af, setters: filters.setters }}>
	<!-- ═══ INDEX HERO ═══ -->
	<header class="index-hero rule-masthead">
		<div class="index-hero-lede">
			<p class="eyebrow index-eyebrow">
				Index · {totalEntries} Entries · {minYear} — {maxYear}
			</p>
			<h1 class="index-title">Talks &amp; Events</h1>
			<p class="standfirst index-standfirst">
				Conference papers, workshops, seminars, lectures and panels given since {minYear} to audiences
				in {countryCount} countries across Africa, Europe and North America — the full speaking record.
			</p>
		</div>

		<div class="index-hero-bars" aria-hidden="true">
			<div class="year-bars" style="--year-bars-h: 88px;">
				{#each yearBars as bar (bar.year)}
					<span
						class="year-bar"
						class:year-bar--current={bar.year === maxYear}
						style="height: {bar.pct}%"
						title="{bar.year}: {bar.count} {bar.count === 1 ? 'talk' : 'talks'}"
					></span>
				{/each}
			</div>
			<div class="year-bars-legend">
				<span>{minYear}</span>
				<span>Talks by year</span>
				<span>{maxYear}</span>
			</div>
		</div>
	</header>

	<!-- ═══ FILTER BAR ═══ -->
	<EntityFilterBar
		{filters}
		{totalEntries}
		{typeLabels}
		{typeChipLabels}
		ariaLabel="Filter talks and events"
		searchPlaceholder="Filter — title, venue, city, co-author, tag, year…"
		searchAriaLabel="Filter talks by title, venue, city, co-author, tag or year"
		sortAriaLabel="Sort talks"
		bind:searchTerm
		bind:facetsOpen
		bind:activeSort
	>
		{#snippet extraControls()}
			<button
				type="button"
				class="map-toggle"
				class:map-toggle--active={showMap}
				aria-pressed={showMap}
				onclick={toggleMap}
			>
				Map {showMap ? '▾' : '▸'}
			</button>
		{/snippet}
	</EntityFilterBar>

	<!-- ═══ FACET GRID (finding-aid) ═══ -->
	<EntityFacetGrid
		{filters}
		open={facetsOpen}
		{minYear}
		{maxYear}
		{totalEntries}
		{matchCount}
		{activeFilterCount}
		{anyNarrowing}
		onclearall={clearAllNarrowing}
	/>

	<!-- ═══ MAP (lazy, toggled from the filter bar) ═══ -->
	{#if showMap && MapVisualization}
		<section class="map-section" aria-label="Map of talks and events">
			<MapVisualization markersData={mapMarkers} showLegend />
		</section>
	{:else if showMap && !MapVisualization && !mapLoadError}
		<section class="map-section map-section--loading">Loading map…</section>
	{/if}

	<!-- ═══ UPCOMING (only when nothing is narrowing the list) ═══ -->
	{#if shouldShowUpcoming}
		<UpcomingCommunications communications={upcomingCommunications} />
	{/if}

	<!-- ═══ RECORD ═══ -->
	<section class="bibliography rule-section" id="bibliography" aria-label="Talks and events">
		{#if shouldShowUpcoming}
			<div class="record-head">
				<h2 class="record-head-title">The record</h2>
				<span class="record-head-count">{matchCount} past</span>
			</div>
		{/if}

		{#if bibRows.length > 0}
			<ol class="bib-list">
				{#each bibRows as { comm, yearLabel, isLead }, i (comm.id)}
					<li class="bib-item" class:bib-item--lead={isLead}>
						<CommunicationItem
							communication={comm}
							bibliography
							{yearLabel}
							featured={isLead}
							index={i}
						/>
					</li>
				{/each}
			</ol>

			<Pagination
				page={currentPage}
				perPage={PER_PAGE}
				total={matchCount}
				onchange={(p) => (currentPage = p)}
				label="talks"
				scrollTargetId="bibliography"
			/>
		{:else}
			<div class="bib-empty">
				<p class="bib-empty-line">No talks or events match the current filters.</p>
				<button type="button" class="facet-clear" onclick={clearAllNarrowing}>Clear all ✕</button>
			</div>
		{/if}
	</section>
</div>

<style>
	/* Map toggle — mono, sits between advanced-filters and sort. */
	.map-toggle {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-text-soft);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.map-toggle:hover {
		color: var(--color-text-emphasis);
	}

	.map-toggle--active {
		color: var(--color-accent);
	}

	/* ═══ MAP ═══ */
	.map-section {
		margin-top: var(--space-xl);
	}

	.map-section--loading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2xl) 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	/* When upcoming is shown above, the past record gets its own labelled head. */
	.record-head {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin-bottom: var(--space-sm);
	}

	.record-head-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-xl);
		font-weight: 750;
		letter-spacing: -0.01em;
		line-height: 1.05;
		color: var(--color-text-emphasis);
		margin: 0;
	}

	.record-head-count {
		margin-left: auto;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.map-toggle {
			transition: none;
		}
	}
</style>
