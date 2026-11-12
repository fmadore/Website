<script lang="ts">
	import SEO from '#lib/SEO.svelte';
	import { pageTitle } from '#lib/utils/siteHelpers.ts';
	import '#styles/components/entity-index.css';
	import { createSectionBreadcrumbs } from '#lib/utils/jsonLdSchemas.ts';
	import { publicationFilters } from '#lib/data/publications/filters.svelte.ts';
	import PublicationItem from '#lib/components/publications/PublicationItem.svelte';
	import { usePagination } from '#lib/utils/pagination.svelte.ts';
	import Pagination from '#lib/components/molecules/Pagination.svelte';
	import EntityFilterBar, {
		DEFAULT_SORT_OPTIONS,
		type SortOption
	} from '#lib/components/entity-index/EntityFilterBar.svelte';
	import EntityFacetGrid from '#lib/components/entity-index/EntityFacetGrid.svelte';
	import EntityEmptyState from '#lib/components/entity-index/EntityEmptyState.svelte';
	import { urlFilterSync } from '#lib/actions/urlFilterSync.svelte.ts';
	import { snapshot } from '$app/navigation';
	import { sortItems, type SortKey } from '#lib/utils/sortUtils.ts';
	import { summariseYears } from '#lib/utils/entityFilterCore.ts';
	import { allPublicationSummaries as allPublications } from '#lib/data/publications/summaries.ts';
	import {
		PUBLICATION_TYPE_FILTER_LABELS as typeLabels,
		PUBLICATION_TYPE_CHIP_LABELS as typeChipLabels
	} from '#lib/utils/publicationTypeLabels.ts';

	// The runed filter system: `af` is the stable deep-reactive filter state,
	// and the system also holds the free-text search, so the facet counts
	// narrow with it. No store prefixes, no casts.
	const filters = publicationFilters;
	const af = filters.activeFilters;

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Publications', '/publications');

	// ── Corpus figures for the index hero (computed from the real dataset) ──────
	// Per-year output counts → a continuous run of bars from minYear..maxYear
	// (years with zero output render as a hairline stub, keeping the axis honest).
	const totalEntries = allPublications.length;
	const { minYear, maxYear, bars: yearBars } = summariseYears(allPublications.map((p) => p.year));

	// ── Local presentation state (does NOT touch the filter system) ──────────
	// The sort is page-local, synced as `sort` (omitted for the default) so a
	// "most cited first" view is shareable.
	const SORT_OPTIONS: readonly SortOption[] = [
		...DEFAULT_SORT_OPTIONS,
		{ value: 'citations', label: 'Cited', glyph: '↓' }
	];
	let activeSort = $state<SortKey>('date');
	const sort = {
		get value(): string {
			return activeSort;
		},
		set value(next: string) {
			activeSort = next as SortKey;
		},
		options: SORT_OPTIONS.map((option) => option.value),
		fallback: 'date'
	};
	const PER_PAGE = 12;

	// The facet grid is closed behind `More filters` at every width; the filter
	// bar opens it when one of its facets is set.
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

	// The system's filtered list (facets and search), sorted.
	const sortedPublications = $derived(sortItems(filters.filteredItems, activeSort));
	const matchCount = $derived(sortedPublications.length);
	const anyNarrowing = $derived(filters.narrowingCount > 0);

	const pagination = usePagination(() => sortedPublications, PER_PAGE);
	const pagePublications = $derived(pagination.items);

	// The page of results belongs to the history entry, not to the link: Back
	// from a record returns to page 3, while a shared URL never carries one
	// (`serializeFiltersToQuery`). Kit restores it after the arrival's filter
	// sync has settled, so the reset to page 1 that sync causes cannot undo it.
	snapshot({
		id: 'publications-index-page',
		capture: () => pagination.page,
		restore: (value: number) => (pagination.page = value)
	});

	// Bibliography rows carry a hanging year, printed only when the year changes
	// down a date-sorted list. Sorted by title or citations the years no longer
	// run in order, and a year on nearly every row is noise, so each row prints
	// its own year as a plain key instead of a group head. Also flag the single
	// newest entry as the lead.
	const bibRows = $derived.by(() => {
		let lastYear: number | null = null;
		return pagePublications.map((pub, i) => {
			const showYear = activeSort !== 'date' || pub.year !== lastYear;
			lastYear = pub.year;
			// The featured lead: first row of page 1 when sorted by date and
			// nothing is being filtered — the newest record, given the plate.
			const isLead = i === 0 && pagination.page === 1 && activeSort === 'date' && !anyNarrowing;
			return { pub, yearLabel: showYear ? pub.year : null, isLead };
		});
	});
</script>

<SEO
	title={pageTitle('Publications')}
	description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues."
	keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div
	class="entity-index"
	use:urlFilterSync={{ filters: af, setters: filters.setters, search: filters.search, sort }}
>
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
		searchPlaceholder="Title, author, tag, abstract…"
		searchAriaLabel="Filter publications"
		sortAriaLabel="Sort publications"
		{totalEntries}
		{minYear}
		{maxYear}
		empty={matchCount === 0}
		sortOptions={SORT_OPTIONS}
		bind:facetsOpen
		bind:activeSort
	/>

	<!-- ═══ FACET GRID (finding-aid) ═══ -->
	<EntityFacetGrid {filters} open={facetsOpen} {minYear} {maxYear} />

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
				page={pagination.page}
				perPage={PER_PAGE}
				total={matchCount}
				onchange={(p) => (pagination.page = p)}
				scrollTargetId="bibliography"
			/>
		{:else}
			<EntityEmptyState {filters} {totalEntries} {minYear} {maxYear} />
		{/if}
	</section>
</div>
