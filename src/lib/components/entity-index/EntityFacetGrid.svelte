<script lang="ts" module>
	/** The grid the filter bar's `More filters` toggle controls. */
	export const FACET_GRID_ID = 'entity-facet-grid';
</script>

<script lang="ts" generics="TItem">
	// Facet grid (finding-aid apparatus) of the entity-index pages:
	// projects · co-authors · countries · year slider · tags. Closed behind the
	// filter bar's `More filters` at every width, so the list starts in the
	// first viewport; the bar opens it when one of its facets is set. The tally
	// that states the narrowing is the bar's (`EntityFilterSummary`), directly
	// under the search, not this grid's. Headings come from the system's
	// `labels`, so a dimension that means something specific on one index (the
	// countries a work studies, the country a talk was held in) says so.
	// Styled by entity-index.css (imported by the page).
	import RangeSlider from '#lib/components/atoms/RangeSlider.svelte';
	import FacetCombobox from './FacetCombobox.svelte';
	import { needsFacetCombobox, visibleFacetOptions } from './facetSearch';
	import type { EntityFilterSystem } from '#lib/utils/entityFilterSystem.svelte.ts';
	// Facet *labels* are typeset; the raw value stays the toggle key and the URL
	// parameter, so filtering and deep links keep matching the data.
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import { clampYearRange, yearRangeReadout } from '#lib/utils/entityFilterCore.ts';

	interface Props {
		filters: EntityFilterSystem<TItem>;
		/** The grid is laid out only while the filter bar's toggle has it open. */
		open: boolean;
		minYear: number;
		maxYear: number;
	}

	let { filters, open, minYear, maxYear }: Props = $props();

	const af = $derived(filters.activeFilters);
	const options = $derived(filters.filterOptions);
	const labels = $derived(filters.labels);

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

	// The read-out: what the filter state currently means, in words, live. A
	// pair of handles on a bare track states the window nowhere, and the bounds
	// printed either side of it are the corpus, not the selection. A deep-linked
	// window wholly outside the corpus is printed as given rather than clamped,
	// so it never names a year that has entries beside a count of zero.
	const yearReadout = $derived(yearRangeReadout(af.yearRange, minYear, maxYear));

	function handleYearChange(event: CustomEvent<{ values: [number, number] }>) {
		const [min, max] = event.detail.values;
		filters.updateYearRange(min, max);
	}
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
			<h2 class="facet-label">{labels.projects}</h2>
			<ul class="facet-list">
				{#each options.projects as project (project)}
					{@const active = af.projects.includes(project)}
					<li>
						<button
							type="button"
							class="facet-row"
							class:facet-row--active={active}
							aria-pressed={active}
							data-count={filters.counts.projects[project] ?? 0}
							onclick={() => filters.toggle('projects', project)}
						>
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
			<h2 class="facet-label">{labels.authors}</h2>
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
					label={labels.authors.toLowerCase()}
					ontoggle={(value) => filters.toggle('authors', value)}
				/>
			{/if}
		</div>
	{/if}

	<!-- COUNTRIES + YEARS -->
	<div class="facet-col">
		{#if options.countries.length > 0}
			<h2 class="facet-label">{labels.countries}</h2>
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
			<h2 class="facet-label">{labels.tags}</h2>
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

<style>
	/* Controls do not print (the Paper Rule): every row of the grid is a
	 * button, and the tally above already states what they have set. */
	@media print {
		.facet-grid {
			display: none;
		}
	}
</style>
