<script lang="ts" generics="TItem">
	// Facet grid (finding-aid apparatus) of the entity-index pages:
	// projects · co-authors · countries · year slider · tags, with the narrowing
	// summary ruled off beneath the grid.
	// Previously byte-identical markup duplicated across /publications and
	// /conference-activity; now parameterized by the runed EntityFilterSystem.
	// Styled by entity-index.css (imported by the page).
	import RangeSlider from '$lib/components/atoms/RangeSlider.svelte';
	import FacetCombobox from './FacetCombobox.svelte';
	import { visibleFacetOptions } from './facetSearch';
	import type { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';
	// Facet *labels* are typeset; the raw value stays the toggle key and the URL
	// parameter, so filtering and deep links keep matching the data.
	import { typesetQuotes } from '$lib/utils/typesetQuotes';

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
		onclearall
	}: Props = $props();

	const af = $derived(filters.activeFilters);
	const options = $derived(filters.filterOptions);

	// The open facets (tags: 95 values, co-authors: 60) print their
	// frequency-ranked head and reach the tail through a combobox — laying the
	// whole list out grew the page by a screen and a half. A selected value the
	// cut would hide is merged back in, so a `?tag=` deep link or a combobox
	// pick is always visible and always switchable off in place.
	const AUTHOR_LIMIT = 8;
	const TAG_LIMIT = 12;
	// Countries is a closed list (single figures), so it still prints in full.
	const COUNTRY_LIMIT = 8;
	let showAllCountries = $state(false);
	const visibleAuthors = $derived(visibleFacetOptions(options.authors, AUTHOR_LIMIT, af.authors));
	const visibleTags = $derived(visibleFacetOptions(options.tags, TAG_LIMIT, af.tags));
	const visibleCountries = $derived(
		showAllCountries ? options.countries : options.countries.slice(0, COUNTRY_LIMIT)
	);

	// The active year window (or the full span when unset).
	const yearRangeValues = $derived<[number, number]>([
		af.yearRange?.min ?? minYear,
		af.yearRange?.max ?? maxYear
	]);
	function handleYearChange(event: CustomEvent<{ values: [number, number] }>) {
		const [min, max] = event.detail.values;
		filters.updateYearRange(min, max);
	}
</script>

<section class="facet-grid rule-hairline" class:facet-grid--open={open} aria-label="More filters">
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
							onclick={() => filters.toggle('authors', author)}
						>
							<span class="facet-name">{typesetQuotes(author)}</span>
							<span class="facet-count">{filters.counts.authors[author] ?? 0}</span>
						</button>
					</li>
				{/each}
			</ul>
			{#if options.authors.length > AUTHOR_LIMIT}
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
							onclick={() => filters.toggle('countries', country)}
						>
							<span class="facet-name">{typesetQuotes(country)}</span>
							<span class="facet-count">{filters.counts.countries[country] ?? 0}</span>
						</button>
					</li>
				{/each}
			</ul>
			{#if options.countries.length > COUNTRY_LIMIT}
				<button
					type="button"
					class="facet-more"
					onclick={() => (showAllCountries = !showAllCountries)}
				>
					{showAllCountries ? 'Show fewer' : `All ${options.countries.length}`}
					<span aria-hidden="true">{showAllCountries ? '↑' : '↓'}</span>
				</button>
			{/if}
		{/if}

		{#if options.years.length > 1}
			<h2 class="facet-label facet-label--years">Years</h2>
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
						onchange={handleYearChange}
					/>
				</div>
				<span class="facet-years-bound">{maxYear}</span>
			</div>
			{#if af.yearRange}
				<button type="button" class="facet-more" onclick={filters.resetYearRange}>
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
						onclick={() => filters.toggle('tags', tag)}
					>
						{typesetQuotes(tag)} <span class="chip-count">{filters.counts.tags[tag] ?? 0}</span>
					</button>
				{/each}
			</div>
			{#if options.tags.length > TAG_LIMIT}
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
		<button type="button" class="facet-clear" onclick={onclearall}>
			Clear all <span aria-hidden="true">✕</span>
		</button>
	{/if}
</div>
