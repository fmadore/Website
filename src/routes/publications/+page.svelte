<script lang="ts">
	import SEO from '$lib/SEO.svelte';
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
	class="pub-index page-enter"
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
					<span class="facet-summary-stat">
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

<style>
	.pub-index {
		max-width: var(--content-width-6xl);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4) var(--space-16);
	}

	/* ═══ INDEX HERO ═══ */
	.index-hero {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
		padding-top: var(--space-md);
	}

	@media (--md) {
		.index-hero {
			grid-template-columns: minmax(0, 1fr) 320px;
			gap: var(--space-2xl);
			align-items: end;
		}
	}

	.index-hero-lede {
		min-width: 0;
	}

	.index-eyebrow {
		font-variant-numeric: tabular-nums;
		margin-bottom: var(--space-sm);
	}

	.index-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-display);
		font-weight: 830;
		line-height: 0.95;
		letter-spacing: -0.02em;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-md);
	}

	.index-standfirst {
		max-width: 52ch;
	}

	/* Year-bar strip — real per-year output as ink bars, newest in pine. */
	.index-hero-bars {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.index-hero-bars .year-bar {
		min-width: 4px;
	}

	/* ═══ FILTER BAR ═══ */
	.filter-bar {
		margin-top: var(--space-xl);
		padding-top: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.filter-bar-top {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	@media (--lg) {
		.filter-bar-top {
			flex-direction: row;
			align-items: flex-start;
			gap: var(--space-lg);
		}
	}

	/* Search — a square field in the data voice, not a rounded pill. */
	.pub-search {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 0 0 auto;
		min-width: 0;
		padding: var(--space-2) var(--space-3);
		border: var(--border-width-thin) solid var(--color-border-dark);
		background: var(--color-surface);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	@media (--lg) {
		.pub-search {
			flex: 0 0 clamp(18rem, 26vw, 22rem);
		}
	}

	.pub-search:focus-within {
		border-color: var(--color-accent);
	}

	.pub-search-icon {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-base);
		color: var(--color-text-light);
		line-height: 1;
	}

	.pub-search-input {
		flex: 1;
		min-width: 0;
		border: none;
		background: transparent;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-emphasis);
	}

	.pub-search-input::placeholder {
		color: var(--color-text-light);
		text-transform: uppercase;
	}

	.pub-search-input:focus {
		outline: none;
	}

	.type-chips {
		flex: 1 1 auto;
		min-width: 0;
	}

	.filter-bar-bottom {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding-top: var(--space-sm);
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	@media (--md) {
		.filter-bar-bottom {
			flex-direction: row;
			align-items: baseline;
			justify-content: space-between;
			gap: var(--space-lg);
		}
	}

	/* LANGUAGE row — mono options; active is underlined pine. */
	.language-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-3);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.language-label {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-light);
	}

	.language-opt {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-soft);
		background: none;
		border: none;
		padding: 0 0 var(--space-0-5);
		border-bottom: var(--border-width-medium) solid transparent;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.language-opt:hover {
		color: var(--color-text-emphasis);
	}

	.language-opt--active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	.language-count {
		color: var(--color-text-muted);
	}

	.filter-bar-controls {
		display: flex;
		align-items: baseline;
		gap: var(--space-lg);
		flex-wrap: wrap;
	}

	.facet-toggle {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: none;
	}

	/* Advanced-filters toggle only matters where the grid is collapsible. */
	@media (--lg-down) {
		.facet-toggle {
			display: inline-flex;
		}
	}

	.sort-control {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.sort-label {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-light);
	}

	.sort-opt {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-soft);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.sort-opt:hover {
		color: var(--color-text-emphasis);
	}

	.sort-opt--active {
		color: var(--color-accent);
	}

	.sort-sep {
		color: var(--color-text-muted);
	}

	/* ═══ FACET GRID ═══ */
	.facet-grid {
		margin-top: var(--space-lg);
		padding-top: var(--space-lg);
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
	}

	@media (--md) {
		.facet-grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-xl) var(--space-2xl);
		}
	}

	@media (--lg) {
		.facet-grid {
			grid-template-columns: 1.2fr 1fr 1fr 1.3fr;
			gap: var(--space-2xl);
		}
	}

	/* Below lg the whole apparatus collapses behind the Advanced-filters toggle. */
	@media (--lg-down) {
		.facet-grid {
			display: none;
		}

		.facet-grid--open {
			display: grid;
			grid-template-columns: 1fr;
			gap: var(--space-lg);
		}
	}

	@media (--md) and (--lg-down) {
		.facet-grid--open {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-lg) var(--space-2xl);
		}
	}

	.facet-col {
		min-width: 0;
	}

	/* Facet column label — mono caps over a hairline, the finding-aid head. */
	.facet-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: var(--rule-hairline) solid var(--color-border);
	}

	.facet-label--years {
		margin-top: var(--space-lg);
	}

	.facet-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	/* A facet row: serif name left, mono count right — a ledger line. */
	.facet-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-0-5) 0;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.facet-row:hover {
		color: var(--color-text-emphasis);
	}

	.facet-row--active {
		color: var(--color-accent);
		font-weight: var(--font-weight-medium);
	}

	/* Small square marker for the projects column — filled pine when on. */
	.facet-row--marker {
		align-items: center;
	}

	.facet-marker {
		flex: 0 0 auto;
		width: 9px;
		height: 9px;
		border: var(--border-width-thin) solid var(--color-border-dark);
		background: transparent;
		transition:
			background var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.facet-marker--on {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.facet-name {
		flex: 1;
		min-width: 0;
		line-height: var(--line-height-snug);
		overflow-wrap: break-word;
	}

	.facet-count {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-muted);
		text-align: right;
	}

	/* "All N ↓" overflow affordance — accent mono, sits under the list. */
	.facet-more {
		margin-top: var(--space-2);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.facet-more:hover {
		color: var(--color-accent-dark);
	}

	.facet-years {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.facet-years-bound {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-light);
		white-space: nowrap;
	}

	.facet-years-slider {
		flex: 1;
		min-width: 0;
	}

	.facet-tags {
		gap: var(--space-1-5);
	}

	/* Active-filter summary — the "N FILTERS ACTIVE · M MATCHES" ledger line. */
	.facet-summary {
		margin-top: var(--space-md);
		padding-top: var(--space-2);
		border-top: var(--rule-hairline) solid var(--color-border);
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2) var(--space-3);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.facet-summary-count {
		font-variant-numeric: tabular-nums;
		color: var(--color-text-emphasis);
	}

	.facet-clear {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.facet-clear:hover {
		color: var(--color-accent-dark);
	}

	/* ═══ BIBLIOGRAPHY ═══ */
	.bibliography {
		margin-top: var(--space-2xl);
		padding-top: var(--space-md);
	}

	.bib-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* Hairline between entries (ink-coloured, never gray-on-gray). */
	.bib-item {
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	.bib-item:first-child {
		border-top: none;
	}

	/* The lead is separated by a heavier hairline below it. */
	.bib-item--lead {
		border-bottom: var(--rule-hairline) solid var(--color-border-dark);
	}

	.bib-empty {
		padding: var(--space-2xl) 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-md);
	}

	.bib-empty-line {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-lg);
		color: var(--color-text-soft);
		margin: 0;
	}

	@media (--sm-down) {
		.pub-index {
			padding: var(--space-6) var(--space-4) var(--space-12);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pub-search,
		.language-opt,
		.sort-opt,
		.facet-row,
		.facet-marker,
		.facet-more,
		.facet-clear {
			transition: none;
		}
	}
</style>
