<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import '$styles/components/entity-index.css';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { publicationFilters } from '$lib/data/publications/filters.svelte';
	import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import EntityFilterBar from '$lib/components/entity-index/EntityFilterBar.svelte';
	import EntityFacetGrid from '$lib/components/entity-index/EntityFacetGrid.svelte';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import { sortItems } from '$lib/utils/sortUtils';
	import { areFiltersActive } from '$lib/utils/filterUtils';
	import { getAuthorsArray } from '$lib/utils/citationFormatter';
	import { allPublications, publicationsByYear } from '$lib/data/publications';

	// The runed filter system: `af` is the stable deep-reactive filter state.
	// No store prefixes, no casts.
	const filters = publicationFilters;
	const af = filters.activeFilters;

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Publications', '/publications');

	// ── Corpus figures for the index hero (computed from the real dataset) ──────
	const totalEntries = allPublications.length;
	const allYears = allPublications
		.map((p) => p.year)
		.filter((y): y is number => Number.isFinite(y));
	const minYear = allYears.length ? Math.min(...allYears) : new Date().getFullYear();
	const maxYear = allYears.length ? Math.max(...allYears) : new Date().getFullYear();

	// Per-year output counts → a continuous run of bars from minYear..maxYear
	// (years with zero output render as a hairline stub, keeping the axis honest).
	const yearBars = (() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- one-shot local tally at module init, not reactive state
		const counts = new Map<number, number>();
		for (let y = minYear; y <= maxYear; y++) counts.set(y, 0);
		for (const [yearKey, pubs] of Object.entries(publicationsByYear)) {
			const y = Number(yearKey);
			if (counts.has(y)) counts.set(y, (pubs as unknown[]).length);
		}
		const max = Math.max(1, ...counts.values());
		return Array.from(counts.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([year, count]) => ({
				year,
				count,
				// Leave a visible stub for empty years; scale the rest 12%..100%.
				pct: count === 0 ? 6 : Math.round(12 + (count / max) * 88)
			}));
	})();

	// ── Local presentation state (does NOT touch the filter store) ──────────────
	// Free-text filter over title / co-authors / tags / venue / year, applied on
	// top of the store's filteredPublications. Purely client-side and additive.
	let searchTerm = $state('');
	let activeSort = $state<'date' | 'title'>('date');
	let currentPage = $state(1);
	const PER_PAGE = 12;

	// Mobile: the whole facet apparatus collapses behind a toggle.
	let facetsOpen = $state(false);

	// Clears the system's filters plus the page-local free-text search.
	function clearAllNarrowing() {
		filters.clearAllFilters();
		searchTerm = '';
	}

	// Haystack builder for the search — flattens the fields a scholar scans by.
	function matchesSearch(pub: (typeof allPublications)[number], q: string): boolean {
		if (!q) return true;
		const parts: string[] = [pub.title, String(pub.year ?? '')];
		if (pub.authors) parts.push(...getAuthorsArray(pub.authors));
		if (typeof pub.editors === 'string') parts.push(pub.editors);
		if (pub.tags) parts.push(...pub.tags);
		if (pub.journal) parts.push(pub.journal);
		if (pub.book) parts.push(pub.book);
		if (pub.publisher) parts.push(pub.publisher);
		const hay = parts.join('  ').toLowerCase();
		// Every whitespace-separated term must appear somewhere (AND semantics).
		return q
			.toLowerCase()
			.split(/\s+/)
			.filter(Boolean)
			.every((term) => hay.includes(term));
	}

	// The system's filtered list, narrowed by the free-text search, then sorted.
	const searchedPublications = $derived(
		filters.filteredItems.filter((pub) => matchesSearch(pub, searchTerm))
	);
	const sortedPublications = $derived(sortItems(searchedPublications, activeSort));
	const matchCount = $derived(sortedPublications.length);

	// Any narrowing at all — system filters OR the text search.
	const anyNarrowing = $derived(areFiltersActive(af) || searchTerm.trim().length > 0);

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

	// Reset to page 1 whenever the visible list identity changes (filters/search/sort).
	// Reading the derived lengths + sort registers the dependencies.
	$effect(() => {
		void matchCount;
		void activeSort;
		void searchTerm;
		currentPage = 1;
	});

	// Clamp page if the list shrinks below the current window.
	const totalPages = $derived(Math.max(1, Math.ceil(matchCount / PER_PAGE)));
	const pageStart = $derived((Math.min(currentPage, totalPages) - 1) * PER_PAGE);
	const pagePublications = $derived(sortedPublications.slice(pageStart, pageStart + PER_PAGE));

	// Bibliography rows carry a hanging year, printed only when the year changes
	// down the (date-sorted) list. Also flag the single newest entry as the lead.
	const bibRows = $derived.by(() => {
		let lastYear: number | null = null;
		return pagePublications.map((pub, i) => {
			const showYear = pub.year !== lastYear;
			lastYear = pub.year;
			// The featured lead: first row of page 1 when sorted by date and
			// nothing is being filtered — the newest record, given the plate.
			const isLead = i === 0 && currentPage === 1 && activeSort === 'date' && !anyNarrowing;
			return { pub, yearLabel: showYear ? pub.year : null, isLead };
		});
	});

	// ── Type chips (real granular types + counts) ───────────────────────────────
	const typeLabels: Record<string, string> = {
		blogpost: 'Blog post',
		book: 'Book',
		'bulletin-article': 'Bulletin article',
		chapter: 'Book chapter',
		'conference-proceedings': 'Conference proceedings',
		encyclopedia: 'Encyclopedia entry',
		article: 'Journal article',
		'masters-thesis': "Master's thesis",
		'phd-dissertation': 'Ph.D. dissertation',
		report: 'Report',
		'special-issue': 'Special issue'
	};
	// Short chip labels — the mockup's compact type row.
	const typeChipLabels: Record<string, string> = {
		blogpost: 'Blog posts',
		book: 'Books',
		'bulletin-article': 'Bulletins',
		chapter: 'Chapters',
		'conference-proceedings': 'Proceedings',
		encyclopedia: 'Encyclopedia',
		article: 'Articles',
		'masters-thesis': 'Theses',
		'phd-dissertation': 'Dissertations',
		report: 'Reports',
		'special-issue': 'Special issues'
	};
</script>

<SEO
	title="Publications | Frédérick Madore"
	description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues."
	keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
	canonical="https://www.frederickmadore.com/publications"
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
			<h1 class="index-title">Publications</h1>
			<p class="standfirst index-standfirst">
				Books, journal articles, chapters, special issues and reports on Islam and Muslim societies
				in West Africa — the full record, set as a working bibliography.
			</p>
		</div>

		<div class="index-hero-bars" aria-hidden="true">
			<div class="year-bars" style="--year-bars-h: 88px;">
				{#each yearBars as bar (bar.year)}
					<span
						class="year-bar"
						class:year-bar--current={bar.year === maxYear}
						style="height: {bar.pct}%"
						title="{bar.year}: {bar.count} {bar.count === 1 ? 'publication' : 'publications'}"
					></span>
				{/each}
			</div>
			<div class="year-bars-legend">
				<span>{minYear}</span>
				<span>Output by year</span>
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
		ariaLabel="Filter publications"
		searchPlaceholder="Filter — title, co-author, tag, venue, year…"
		searchAriaLabel="Filter publications by title, co-author, tag, venue or year"
		sortAriaLabel="Sort publications"
		bind:searchTerm
		bind:facetsOpen
		bind:activeSort
	/>

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

	<!-- ═══ BIBLIOGRAPHY ═══ -->
	<section class="bibliography rule-section" id="bibliography" aria-label="Bibliography">
		{#if bibRows.length > 0}
			<ol class="bib-list">
				{#each bibRows as { pub, yearLabel, isLead }, i (pub.id)}
					<li class="bib-item" class:bib-item--lead={isLead}>
						<PublicationItem
							publication={pub}
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
				label="publications"
				scrollTargetId="bibliography"
			/>
		{:else}
			<div class="bib-empty">
				<p class="bib-empty-line">No publications match the current filters.</p>
				<button type="button" class="facet-clear" onclick={clearAllNarrowing}>Clear all ✕</button>
			</div>
		{/if}
	</section>
</div>
