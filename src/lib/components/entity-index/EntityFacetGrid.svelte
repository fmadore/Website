<script lang="ts" module>
	/** The grid the filter bar's `More filters` toggle controls. */
	export const FACET_GRID_ID = 'entity-facet-grid';
</script>

<script lang="ts" generics="TItem">
	// Facet grid (finding-aid apparatus) of the entity-index pages:
	// projects · co-authors · countries · year slider · tags, with the narrowing
	// summary ruled off beneath the grid.
	// Previously byte-identical markup duplicated across /publications and
	// /conference-activity; now parameterized by the runed EntityFilterSystem.
	// Styled by entity-index.css (imported by the page).
	import RangeSlider from '$lib/components/atoms/RangeSlider.svelte';
	import FacetCombobox from './FacetCombobox.svelte';
	import { needsFacetCombobox, visibleFacetOptions } from './facetSearch';
	import type { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';
	// Facet *labels* are typeset; the raw value stays the toggle key and the URL
	// parameter, so filtering and deep links keep matching the data.
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import { clampYearRange } from '$lib/utils/entityFilterCore';

	interface Props {
		filters: EntityFilterSystem<TItem>;
		/** Mobile: the whole apparatus collapses behind the filter-bar toggle. */
		open: boolean;
		minYear: number;
		maxYear: number;
		totalEntries: number;
		/** Visible matches after every narrowing (filters + search). */
		matchCount: number;
		/** Active dimensions incl. the page's free-text search. */
		activeFilterCount: number;
		/** Any narrowing at all — shows the "Clear all" affordance. */
		anyNarrowing: boolean;
		/** Clears the system's filters plus page-local narrowing (search). */
		onclearall: () => void;
		/** Display labels for the type codes, so the summary never prints one. */
		typeLabels?: Record<string, string>;
	}

	let {
		filters,
		open,
		minYear,
		maxYear,
		totalEntries,
		matchCount,
		activeFilterCount,
		anyNarrowing,
		onclearall,
		typeLabels
	}: Props = $props();

	const af = $derived(filters.activeFilters);
	const options = $derived(filters.filterOptions);

	// Every long facet takes one rule (`facetSearch.ts`): print the whole list
	// while it is at most one value over the limit, otherwise print the
	// frequency-ranked head and reach the tail by typing. Laying 95 tags out
	// grew the page by a screen and a half; hiding a single ninth country
	// behind an "All 9 ↓" disclosure was a second idiom for a row it would have
	// been cheaper to print. A selected value the cut would hide is merged back
	// in, so a `?tag=` deep link or a combobox pick is always visible and always
	// switchable off in place.
	const AUTHOR_LIMIT = 8;
	const TAG_LIMIT = 12;
	const COUNTRY_LIMIT = 8;
	const visibleAuthors = $derived(visibleFacetOptions(options.authors, AUTHOR_LIMIT, af.authors));
	const visibleTags = $derived(visibleFacetOptions(options.tags, TAG_LIMIT, af.tags));
	const visibleCountries = $derived(
		visibleFacetOptions(options.countries, COUNTRY_LIMIT, af.countries)
	);

	// The active year window (or the full span when unset), clamped to the
	// corpus: a `?year_min=1900` deep link filters exactly as the URL asked, but
	// the slider only spans 2013–2026 and must not caption a handle with a year
	// its track cannot reach.
	const displayedYears = $derived(clampYearRange(af.yearRange, minYear, maxYear));
	const yearRangeValues = $derived<[number, number]>([displayedYears.min, displayedYears.max]);

	// The read-out: what the two handles currently mean, in words, live. A pair
	// of handles on a bare track states the window nowhere, and the bounds
	// printed either side of it are the corpus, not the selection.
	const yearReadout = $derived(
		!af.yearRange
			? `All years · ${minYear}–${maxYear}`
			: displayedYears.min === displayedYears.max
				? `${displayedYears.min}`
				: `${displayedYears.min}–${displayedYears.max}`
	);

	function handleYearChange(event: CustomEvent<{ values: [number, number] }>) {
		const [min, max] = event.detail.values;
		filters.updateYearRange(min, max);
	}

	/* What is narrowing the list, in the reader's own words. The stat says how
	 * much survived; without the values beside it the reader has to go back up
	 * to the facets to find out what they clicked — and below --lg those facets
	 * are collapsed behind a toggle. Type codes go through the page's labels;
	 * everything else is the authored value, typeset. */
	const activeFilterLabels = $derived([
		...af.types.map((type) => typeLabels?.[type] ?? type),
		...af.languages,
		...af.projects.map(typesetQuotes),
		...af.authors.map(typesetQuotes),
		...af.countries.map(typesetQuotes),
		...af.tags.map(typesetQuotes),
		...(af.yearRange ? [yearReadout] : [])
	]);
</script>

<section
	id={FACET_GRID_ID}
	class="facet-grid rule-hairline"
	class:facet-grid--open={open}
	aria-label="More filters"
>
	<!-- PROJECTS -->
	{#if options.projects.length > 0}
		<div class="facet-col">
			<h2 class="facet-label">Projects</h2>
			<ul class="facet-list">
				{#each options.projects as project (project)}
					{@const active = af.projects.includes(project)}
					<li>
						<button
							type="button"
							class="facet-row facet-row--marker"
							class:facet-row--active={active}
							aria-pressed={active}
							data-count={filters.counts.projects[project] ?? 0}
							onclick={() => filters.toggle('projects', project)}
						>
							<span class="facet-marker" class:facet-marker--on={active} aria-hidden="true"></span>
							<span class="facet-name">{typesetQuotes(project)}</span>
							<span class="facet-count">{filters.counts.projects[project] ?? 0}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- CO-AUTHORS -->
	{#if options.authors.length > 0}
		<div class="facet-col">
			<h2 class="facet-label">Co-authors</h2>
			<ul class="facet-list">
				{#each visibleAuthors as author (author)}
					<li>
						<button
							type="button"
							class="facet-row"
							class:facet-row--active={af.authors.includes(author)}
							aria-pressed={af.authors.includes(author)}
							data-count={filters.counts.authors[author] ?? 0}
							onclick={() => filters.toggle('authors', author)}
						>
							<span class="facet-name">{typesetQuotes(author)}</span>
							<span class="facet-count">{filters.counts.authors[author] ?? 0}</span>
						</button>
					</li>
				{/each}
			</ul>
			{#if needsFacetCombobox(options.authors.length, AUTHOR_LIMIT)}
				<FacetCombobox
					options={options.authors}
					counts={filters.counts.authors}
					selected={af.authors}
					label="co-authors"
					ontoggle={(value) => filters.toggle('authors', value)}
				/>
			{/if}
		</div>
	{/if}

	<!-- COUNTRIES + YEARS -->
	<div class="facet-col">
		{#if options.countries.length > 0}
			<h2 class="facet-label">Countries</h2>
			<ul class="facet-list">
				{#each visibleCountries as country (country)}
					<li>
						<button
							type="button"
							class="facet-row"
							class:facet-row--active={af.countries.includes(country)}
							aria-pressed={af.countries.includes(country)}
							data-count={filters.counts.countries[country] ?? 0}
							onclick={() => filters.toggle('countries', country)}
						>
							<span class="facet-name">{typesetQuotes(country)}</span>
							<span class="facet-count">{filters.counts.countries[country] ?? 0}</span>
						</button>
					</li>
				{/each}
			</ul>
			{#if needsFacetCombobox(options.countries.length, COUNTRY_LIMIT)}
				<FacetCombobox
					options={options.countries}
					counts={filters.counts.countries}
					selected={af.countries}
					label="countries"
					ontoggle={(value) => filters.toggle('countries', value)}
				/>
			{/if}
		{/if}

		{#if options.years.length > 1}
			<h2 class="facet-label facet-label--years">Years</h2>
			<p class="dateline facet-years-readout">{yearReadout}</p>
			<div class="facet-years">
				<span class="facet-years-bound">{minYear}</span>
				<div class="facet-years-slider">
					<RangeSlider
						min={minYear}
						max={maxYear}
						step={1}
						values={yearRangeValues}
						minAriaLabel="Earliest year"
						ariaLabel="Latest year"
						minAriaValueText={yearReadout}
						ariaValueText={yearReadout}
						onchange={handleYearChange}
					/>
				</div>
				<span class="facet-years-bound">{maxYear}</span>
			</div>
			{#if af.yearRange}
				<button
					type="button"
					class="mono-action facet-years-clear"
					onclick={filters.resetYearRange}
				>
					Clear years <span aria-hidden="true">✕</span>
				</button>
			{/if}
		{/if}
	</div>

	<!-- TAGS -->
	{#if options.tags.length > 0}
		<div class="facet-col">
			<h2 class="facet-label">Tags</h2>
			<div class="chip-row facet-tags">
				{#each visibleTags as tag (tag)}
					<button
						type="button"
						class="chip"
						class:chip--selected={af.tags.includes(tag)}
						aria-pressed={af.tags.includes(tag)}
						data-count={filters.counts.tags[tag] ?? 0}
						onclick={() => filters.toggle('tags', tag)}
					>
						{typesetQuotes(tag)} <span class="chip-count">{filters.counts.tags[tag] ?? 0}</span>
					</button>
				{/each}
			</div>
			{#if needsFacetCombobox(options.tags.length, TAG_LIMIT)}
				<FacetCombobox
					options={options.tags}
					counts={filters.counts.tags}
					selected={af.tags}
					label="tags"
					ontoggle={(value) => filters.toggle('tags', value)}
				/>
			{/if}
		</div>
	{/if}
</section>

<!-- SUMMARY — a statement about the whole narrowing, not about tags, so it
     rules off the apparatus instead of hanging under the fourth column. Outside
     the grid deliberately: below --lg the grid collapses behind the
     Advanced-filters toggle, which used to take the match count and the
     "Clear all" affordance down with it on exactly the viewport where the
     reader most needs to know how many records are left. -->
<div class="facet-summary">
	{#if activeFilterLabels.length > 0}
		<span class="facet-summary-active">
			<span class="filter-note-label">Filtered by</span>
			<span class="filter-note-value">{activeFilterLabels.join(' · ')}</span>
		</span>
	{/if}
	<!-- Announce filter-result changes to screen readers -->
	<span class="facet-summary-stat" aria-live="polite">
		{#if activeFilterCount > 0}
			<span class="facet-summary-count">{activeFilterCount}</span>
			{activeFilterCount === 1 ? 'filter' : 'filters'} active ·
			<span class="facet-summary-count">{matchCount}</span>
			of {totalEntries}
			{totalEntries === 1 ? 'entry' : 'entries'}
		{:else}
			{totalEntries}
			{totalEntries === 1 ? 'entry' : 'entries'}
		{/if}
	</span>
	{#if anyNarrowing}
		<button type="button" class="mono-action" onclick={onclearall}>
			Clear all <span aria-hidden="true">✕</span>
		</button>
	{/if}
</div>
