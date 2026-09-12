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
	import { truncateSearchTerm } from '$lib/utils/entityFilterCore';
	import { getAuthorsArray } from '$lib/utils/citationFormatter';
	import {
		allPublicationSummaries as allPublications,
		publicationSummariesByYear as publicationsByYear
	} from '$lib/data/publications/summaries';
	import {
		PUBLICATION_TYPE_FILTER_LABELS as typeLabels,
		PUBLICATION_TYPE_CHIP_LABELS as typeChipLabels
	} from '$lib/utils/publicationTypeLabels';

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

	// The search box is page-local state, so `urlFilterSync` reaches it through
	// an accessor pair rather than through the filter system. It syncs as `q`,
	// which is what makes a searched view shareable.
	const search = {
		get value() {
			return searchTerm;
		},
		set value(next: string) {
			searchTerm = next;
		}
	};
	let activeSort = $state<'date' | 'title'>('date');
	let currentPage = $state(1);
	const PER_PAGE = 12;

	// Mobile: the whole facet apparatus collapses behind a toggle.
	let facetsOpen = $state(false);

	// One live region for the whole list. Each row's Cite button changes its own
	// label, which is the sighted confirmation; the announcement is made once,
	// here, by an element that was in the DOM before there was anything to say.
	let copyAnnouncement = $state('');
	let announcementTimer: ReturnType<typeof setTimeout> | undefined;
	function announceCopy(state: 'copied' | 'failed') {
		clearTimeout(announcementTimer);
		copyAnnouncement = state === 'copied' ? 'Reference copied.' : 'Copy failed.';
		// Clearing lets a second copy of the same reference be announced again.
		announcementTimer = setTimeout(() => (copyAnnouncement = ''), 2400);
	}
	$effect(() => () => clearTimeout(announcementTimer));

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
		const hay = parts.join(' ').toLowerCase();
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

	// The search is the only thing narrowing: the empty state's way out then
	// names the search rather than promising to clear filters that are not set.
	const searchOnlyNarrowing = $derived(searchTerm.trim().length > 0 && !areFiltersActive(af));

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
</script>

<SEO
	title="Publications | Frédérick Madore"
	description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues."
	keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
	canonical="https://www.frederickmadore.com/publications"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="entity-index" use:urlFilterSync={{ filters: af, setters: filters.setters, search }}>
	<!-- ═══ INDEX HERO ═══ -->
	<header class="index-hero index-masthead">
		<div class="index-hero-lede">
			<p class="eyebrow index-eyebrow">
				Index · {totalEntries} entries · {minYear}–{maxYear}
			</p>
			<h1 class="index-title">Publications</h1>
			<p class="standfirst">
				Books, journal articles, chapters, special issues, working papers and reports on Islam and
				Muslim societies in West Africa, set as a working bibliography.
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
			<!-- The legend names what the bars encode and nothing else: the
			     eyebrow above already prints the span, and the strip reprinted
			     its two end years under it. -->
			<div class="year-bars-legend">
				<span>Entries by year</span>
			</div>
		</div>
	</header>

	<!-- ═══ FILTER BAR ═══ -->
	<EntityFilterBar
		{filters}
		{typeLabels}
		{typeChipLabels}
		ariaLabel="Filter publications"
		searchPlaceholder="Title, co-author, tag, venue, year…"
		searchAriaLabel="Filter publications"
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
		{typeLabels}
		onclearall={clearAllNarrowing}
	/>

	<!-- ═══ BIBLIOGRAPHY ═══ -->
	<section class="bibliography rule-section" id="bibliography" aria-labelledby="bibliography-head">
		<!-- The apparatus above prints five h2 facet heads and the list below
		     prints one per record, so heading navigation walks straight from the
		     finding aid into the entries with nothing marking the join. This is
		     that mark. It is visually hidden because the 3px section rule already
		     draws the same boundary for a sighted reader. -->
		<h2 class="sr-only" id="bibliography-head">Bibliography</h2>
		<p class="sr-only" role="status">{copyAnnouncement}</p>

		{#if bibRows.length > 0}
			<ol class="bib-list">
				{#each bibRows as { pub, yearLabel, isLead }, i (pub.id)}
					<li class="bib-item" class:bib-item--lead={isLead}>
						<PublicationItem
							publication={pub}
							{yearLabel}
							featured={isLead}
							index={i}
							oncopystate={announceCopy}
						/>
					</li>
				{/each}
			</ol>

			<Pagination
				page={currentPage}
				perPage={PER_PAGE}
				total={matchCount}
				onchange={(p) => (currentPage = p)}
				scrollTargetId="bibliography"
			/>
		{:else}
			<div class="bib-empty">
				<p class="bib-empty-line">
					{#if searchTerm.trim()}
						No entries match &ldquo;{truncateSearchTerm(searchTerm)}&rdquo;.
					{:else}
						No entries match.
					{/if}
				</p>
				<p class="dateline bib-empty-note">
					The index holds {totalEntries} entries, {minYear}–{maxYear}.
				</p>
				<!-- The way out, repeated where the reader is looking. The summary's
				     `Clear all` is the same control and the same function, but it sits
				     above a 48px section rule and off the screen the empty block fills. -->
				{#if anyNarrowing}
					<button type="button" class="mono-action" onclick={clearAllNarrowing}>
						{searchOnlyNarrowing ? 'Clear search' : 'Clear all'}
						<span aria-hidden="true">✕</span>
					</button>
				{/if}
			</div>
		{/if}
	</section>
</div>
