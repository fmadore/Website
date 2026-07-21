<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import '$styles/components/entity-index.css';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import {
		filteredPublications,
		activeFilters,
		filterOptions,
		tagCounts,
		authorCounts,
		typeCounts,
		languageCounts,
		countryCounts,
		projectCounts,
		toggleTypeFilter,
		updateYearRange,
		resetYearRange,
		toggleTagFilter,
		toggleLanguageFilter,
		toggleAuthorFilter,
		toggleCountryFilter,
		toggleProjectFilter,
		clearAllFilters,
		setTypes,
		setTags,
		setLanguages,
		setAuthors,
		setCountries,
		setProjects,
		setYearRange
	} from '$lib/data/publications/filters.svelte';
	import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import RangeSlider from '$lib/components/atoms/RangeSlider.svelte';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import { sortItems } from '$lib/utils/sortUtils';
	import { areFiltersActive } from '$lib/utils/filterUtils';
	import { getAuthorsArray } from '$lib/utils/citationFormatter';
	import { allPublications, publicationsByYear } from '$lib/data/publications';
	import type { YearRange } from '$lib/types';

	// The filter store infers its state members from `initialFilters` (empty
	// arrays → `never[]`, `null` → `null`), so reading dimensions directly trips
	// the type-checker. This typed view of the live store — and the string-array
	// setter signatures — annotate the shape without touching the state logic.
	type PubFilters = {
		types: string[];
		yearRange: YearRange | null;
		tags: string[];
		languages: string[];
		authors: string[];
		countries: string[];
		projects: string[];
	};
	const af = $derived($activeFilters as unknown as PubFilters);
	const setStrings = {
		types: setTypes as unknown as (v: string[]) => void,
		languages: setLanguages as unknown as (v: string[]) => void
	};

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

	// Overflow toggles for the long facet columns.
	let showAllAuthors = $state(false);
	let showAllTags = $state(false);
	let showAllCountries = $state(false);
	// Mobile: the whole facet apparatus collapses behind a toggle.
	let facetsOpen = $state(false);

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

	// The store's filtered list, narrowed by the free-text search, then sorted.
	const searchedPublications = $derived(
		$filteredPublications.filter((pub) => matchesSearch(pub, searchTerm))
	);
	const sortedPublications = $derived(sortItems(searchedPublications, activeSort));
	const matchCount = $derived(sortedPublications.length);

	// Any narrowing at all — store filters OR the text search.
	const anyNarrowing = $derived(areFiltersActive($activeFilters) || searchTerm.trim().length > 0);

	// Count of active store-filter dimensions, for the "N FILTERS ACTIVE" readout.
	const activeFilterCount = $derived(
		(af.types?.length ?? 0) +
			(af.languages?.length ?? 0) +
			(af.projects?.length ?? 0) +
			(af.authors?.length ?? 0) +
			(af.countries?.length ?? 0) +
			(af.tags?.length ?? 0) +
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

	// Years ascending for the slider; the active window (or full span when unset).
	const sortedYearsAsc = $derived(
		($filterOptions?.years ?? []).slice().sort((a: number, b: number) => a - b)
	);
	const yearRangeValues = $derived<[number, number]>([
		af.yearRange?.min ?? minYear,
		af.yearRange?.max ?? maxYear
	]);
	function handleYearChange(event: CustomEvent<{ values: [number, number] }>) {
		const [min, max] = event.detail.values;
		updateYearRange(min, max);
	}

	// Facet overflow windows.
	const AUTHOR_LIMIT = 8;
	const TAG_LIMIT = 12;
	const COUNTRY_LIMIT = 8;
	const visibleAuthors = $derived(
		showAllAuthors ? $filterOptions.authors : $filterOptions.authors.slice(0, AUTHOR_LIMIT)
	);
	const visibleTags = $derived(
		showAllTags ? $filterOptions.tags : $filterOptions.tags.slice(0, TAG_LIMIT)
	);
	const visibleCountries = $derived(
		showAllCountries ? $filterOptions.countries : $filterOptions.countries.slice(0, COUNTRY_LIMIT)
	);

	// Prepare setters object for the URL-sync action (unchanged wiring).
	const filterSetters = {
		setTypes,
		setTags,
		setLanguages,
		setAuthors,
		setCountries,
		setProjects,
		setYearRange
	};

	function isTypeActive(t: string) {
		return af.types?.includes(t) ?? false;
	}
</script>

<SEO
	title="Publications | Frédérick Madore"
	description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues."
	keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
	canonical="https://www.frederickmadore.com/publications"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div
	class="entity-index page-enter"
	use:urlFilterSync={{ filters: $activeFilters, setters: filterSetters }}
>
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
	<section class="filter-bar" aria-label="Filter publications">
		<div class="filter-bar-top">
			<div class="pub-search">
				<span class="pub-search-icon" aria-hidden="true">⌕</span>
				<input
					type="search"
					class="pub-search-input"
					placeholder="Filter — title, co-author, tag, venue, year…"
					aria-label="Filter publications by title, co-author, tag, venue or year"
					bind:value={searchTerm}
				/>
			</div>

			<div class="chip-row type-chips">
				<button
					type="button"
					class="chip"
					class:chip--selected={(af.types?.length ?? 0) === 0}
					onclick={() => setStrings.types([])}
				>
					All <span class="chip-count">{totalEntries}</span>
				</button>
				{#each $filterOptions.types as type (type)}
					<button
						type="button"
						class="chip"
						class:chip--selected={isTypeActive(type)}
						onclick={() => toggleTypeFilter(type)}
						title={typeLabels[type] ?? type}
					>
						{typeChipLabels[type] ?? typeLabels[type] ?? type}
						<span class="chip-count">{$typeCounts[type] ?? 0}</span>
					</button>
				{/each}
			</div>
		</div>

		<div class="filter-bar-bottom">
			<div class="language-row">
				<span class="language-label">Language:</span>
				<button
					type="button"
					class="language-opt"
					class:language-opt--active={(af.languages?.length ?? 0) === 0}
					onclick={() => setStrings.languages([])}
				>
					All
				</button>
				{#each $filterOptions.languages as lang (lang)}
					<button
						type="button"
						class="language-opt"
						class:language-opt--active={af.languages?.includes(lang)}
						onclick={() => toggleLanguageFilter(lang)}
					>
						{lang}
						<span class="language-count">{$languageCounts[lang] ?? 0}</span>
					</button>
				{/each}
			</div>

			<div class="filter-bar-controls">
				<button
					type="button"
					class="facet-toggle"
					aria-expanded={facetsOpen}
					onclick={() => (facetsOpen = !facetsOpen)}
				>
					Advanced filters {facetsOpen ? '▴' : '▾'}
				</button>
				<div class="sort-control" role="group" aria-label="Sort publications">
					<span class="sort-label">Sort:</span>
					<button
						type="button"
						class="sort-opt"
						class:sort-opt--active={activeSort === 'date'}
						aria-pressed={activeSort === 'date'}
						onclick={() => (activeSort = 'date')}
					>
						Year ↓
					</button>
					<span class="sort-sep" aria-hidden="true">·</span>
					<button
						type="button"
						class="sort-opt"
						class:sort-opt--active={activeSort === 'title'}
						aria-pressed={activeSort === 'title'}
						onclick={() => (activeSort = 'title')}
					>
						A–Z
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══ FACET GRID (finding-aid) ═══ -->
	<section class="facet-grid rule-hairline" class:facet-grid--open={facetsOpen} aria-label="Facets">
		<!-- PROJECTS -->
		{#if $filterOptions.projects.length > 0}
			<div class="facet-col">
				<h2 class="facet-label">Projects</h2>
				<ul class="facet-list">
					{#each $filterOptions.projects as project (project)}
						{@const active = af.projects?.includes(project)}
						<li>
							<button
								type="button"
								class="facet-row facet-row--marker"
								class:facet-row--active={active}
								onclick={() => toggleProjectFilter(project)}
							>
								<span class="facet-marker" class:facet-marker--on={active} aria-hidden="true"
								></span>
								<span class="facet-name">{project}</span>
								<span class="facet-count">{$projectCounts[project] ?? 0}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- CO-AUTHORS -->
		{#if $filterOptions.authors.length > 0}
			<div class="facet-col">
				<h2 class="facet-label">Co-authors</h2>
				<ul class="facet-list">
					{#each visibleAuthors as author (author)}
						<li>
							<button
								type="button"
								class="facet-row"
								class:facet-row--active={af.authors?.includes(author)}
								onclick={() => toggleAuthorFilter(author)}
							>
								<span class="facet-name">{author}</span>
								<span class="facet-count">{$authorCounts[author] ?? 0}</span>
							</button>
						</li>
					{/each}
				</ul>
				{#if $filterOptions.authors.length > AUTHOR_LIMIT}
					<button
						type="button"
						class="facet-more"
						onclick={() => (showAllAuthors = !showAllAuthors)}
					>
						{showAllAuthors ? 'Show fewer ↑' : `All ${$filterOptions.authors.length} co-authors ↓`}
					</button>
				{/if}
			</div>
		{/if}

		<!-- COUNTRIES + YEARS -->
		<div class="facet-col">
			{#if $filterOptions.countries.length > 0}
				<h2 class="facet-label">Countries</h2>
				<ul class="facet-list">
					{#each visibleCountries as country (country)}
						<li>
							<button
								type="button"
								class="facet-row"
								class:facet-row--active={af.countries?.includes(country)}
								onclick={() => toggleCountryFilter(country)}
							>
								<span class="facet-name">{country}</span>
								<span class="facet-count">{$countryCounts[country] ?? 0}</span>
							</button>
						</li>
					{/each}
				</ul>
				{#if $filterOptions.countries.length > COUNTRY_LIMIT}
					<button
						type="button"
						class="facet-more"
						onclick={() => (showAllCountries = !showAllCountries)}
					>
						{showAllCountries ? 'Show fewer ↑' : `All ${$filterOptions.countries.length} ↓`}
					</button>
				{/if}
			{/if}

			{#if sortedYearsAsc.length > 1}
				<h2 class="facet-label facet-label--years">Years</h2>
				<div class="facet-years">
					<span class="facet-years-bound">{minYear}</span>
					<div class="facet-years-slider">
						<RangeSlider
							min={minYear}
							max={maxYear}
							step={1}
							values={yearRangeValues}
							onchange={handleYearChange}
						/>
					</div>
					<span class="facet-years-bound">{maxYear}</span>
				</div>
				{#if af.yearRange}
					<button type="button" class="facet-more" onclick={resetYearRange}>Reset years ✕</button>
				{/if}
			{/if}
		</div>

		<!-- TAGS + summary -->
		{#if $filterOptions.tags.length > 0}
			<div class="facet-col facet-col--tags">
				<h2 class="facet-label">Tags</h2>
				<div class="chip-row facet-tags">
					{#each visibleTags as tag (tag)}
						<button
							type="button"
							class="chip"
							class:chip--selected={af.tags?.includes(tag)}
							onclick={() => toggleTagFilter(tag)}
						>
							{tag} <span class="chip-count">{$tagCounts[tag] ?? 0}</span>
						</button>
					{/each}
				</div>
				{#if $filterOptions.tags.length > TAG_LIMIT}
					<button type="button" class="facet-more" onclick={() => (showAllTags = !showAllTags)}>
						{showAllTags ? 'Show fewer ↑' : `All ${$filterOptions.tags.length} tags ↓`}
					</button>
				{/if}

				<div class="facet-summary">
					<!-- Announce filter-result changes to screen readers -->
					<span class="facet-summary-stat" aria-live="polite">
						{#if activeFilterCount > 0}
							<span class="facet-summary-count">{activeFilterCount}</span>
							{activeFilterCount === 1 ? 'filter' : 'filters'} active ·
							<span class="facet-summary-count">{matchCount}</span>
							{matchCount === 1 ? 'match' : 'matches'}
						{:else}
							{totalEntries} entries
						{/if}
					</span>
					{#if anyNarrowing}
						<button
							type="button"
							class="facet-clear"
							onclick={() => {
								clearAllFilters();
								searchTerm = '';
							}}
						>
							Clear all ✕
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</section>

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
				<button
					type="button"
					class="facet-clear"
					onclick={() => {
						clearAllFilters();
						searchTerm = '';
					}}
				>
					Clear all ✕
				</button>
			</div>
		{/if}
	</section>
</div>
