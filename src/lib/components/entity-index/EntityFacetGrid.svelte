<script lang="ts" module>
	/** The grid the filter bar's `More filters` toggle controls. */
	export const FACET_GRID_ID = 'entity-facet-grid';
</script>

<script lang="ts" generics="TItem, K extends string">
	// Facet grid (finding-aid apparatus) of the entity-index pages: the page's
	// grid facets in the order it declares them (projects · co-authors ·
	// countries · year slider · tags · …), each drawn by its placement — a
	// column of ledger rows (`grid-list`) or a chip row (`grid-chips`). Closed
	// behind the filter bar's `More filters` at every width, so the list starts
	// in the first viewport; the bar opens it when one of its facets is set. The
	// tally that states the narrowing is the bar's (`EntityFilterSummary`),
	// directly under the search, not this grid's. Headings come from each
	// dimension's `label`, so a dimension that means something specific on one
	// index (the countries a work studies, the country a talk was held in) says
	// so. Styled by entity-index.css (imported by the page).
	import RangeSlider from '#lib/components/atoms/RangeSlider.svelte';
	import FacetCombobox from './FacetCombobox.svelte';
	import { needsFacetCombobox, visibleFacetOptions } from './facetSearch';
	import type { EntityFilterSystem } from '#lib/utils/entityFilterSystem.svelte.ts';
	// Facet *labels* are typeset; the raw value stays the toggle key and the URL
	// parameter, so filtering and deep links keep matching the data.
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import { clampYearRange, inGrid, yearRangeReadout } from '#lib/utils/entityFilterCore.ts';

	interface Props {
		filters: EntityFilterSystem<TItem, K>;
		/** The grid is laid out only while the filter bar's toggle has it open. */
		open: boolean;
		minYear: number;
		maxYear: number;
	}

	let { filters, open, minYear, maxYear }: Props = $props();

	const af = $derived(filters.activeFilters);
	const gridDimensions = $derived(filters.dimensions.filter(inGrid));
	const lists = $derived(gridDimensions.filter((d) => d.placement === 'grid-list'));
	const chips = $derived(gridDimensions.filter((d) => d.placement === 'grid-chips'));
	const showYears = $derived(filters.filterOptions.years.length > 1);
	/** The years share a list's column (the countries), or take their own after the lists. */
	const yearsOwnColumn = $derived(!lists.some((d) => d.yearsBeside));

	// Every long facet takes one rule (`facetSearch.ts`): print the whole list
	// while it is at most one value over the limit, otherwise print the
	// frequency-ranked head and reach the tail by typing. Laying 95 tags out
	// grew the page by a screen and a half; hiding a single ninth country
	// behind an "All 9 ↓" disclosure was a second idiom for a row it would have
	// been cheaper to print. A selected value the cut would hide is merged back
	// in, so a `?tag=` deep link or a combobox pick is always visible and always
	// switchable off in place. A facet with no `limit` prints whole.
	function visible(dimension: (typeof gridDimensions)[number]): readonly string[] {
		return dimension.limit === undefined
			? dimension.options
			: visibleFacetOptions(dimension.options, dimension.limit, af[dimension.key]);
	}
	const label = (key: K, value: string) => typesetQuotes(filters.valueLabel(key, value));

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

{#snippet years()}
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
		<button type="button" class="mono-action facet-years-clear" onclick={filters.resetYearRange}>
			Clear years <span aria-hidden="true">✕</span>
		</button>
	{/if}
{/snippet}

<section
	id={FACET_GRID_ID}
	class="facet-grid rule-hairline"
	class:facet-grid--open={open}
	aria-label="More filters"
>
	<!-- LISTS: projects, co-authors, countries (with the years) -->
	{#each lists as dimension (dimension.key)}
		{@const key = dimension.key}
		{#if dimension.options.length > 0 || (dimension.yearsBeside && showYears)}
			<div class="facet-col">
				{#if dimension.options.length > 0}
					<h2 class="facet-label">{dimension.label}</h2>
					<ul class="facet-list">
						{#each visible(dimension) as value (value)}
							{@const active = af[key].includes(value)}
							<li>
								<button
									type="button"
									class="facet-row"
									class:facet-row--active={active}
									aria-pressed={active}
									data-count={filters.counts[key][value] ?? 0}
									onclick={() => filters.toggle(key, value)}
								>
									<span class="facet-name">{label(key, value)}</span>
									<span class="facet-count">{filters.counts[key][value] ?? 0}</span>
								</button>
							</li>
						{/each}
					</ul>
					{#if dimension.limit !== undefined && needsFacetCombobox(dimension.options.length, dimension.limit)}
						<FacetCombobox
							options={dimension.options}
							counts={filters.counts[key]}
							selected={af[key]}
							label={dimension.noun ?? dimension.label.toLowerCase()}
							labelOf={(value) => filters.valueLabel(key, value)}
							ontoggle={(value) => filters.toggle(key, value)}
						/>
					{/if}
				{/if}
				{#if dimension.yearsBeside && showYears}
					{@render years()}
				{/if}
			</div>
		{/if}
	{/each}

	{#if yearsOwnColumn && showYears}
		<div class="facet-col">
			{@render years()}
		</div>
	{/if}

	<!-- CHIPS: tags, and the one- or two-value facets -->
	{#each chips as dimension (dimension.key)}
		{@const key = dimension.key}
		{#if dimension.options.length > 0}
			<div class="facet-col">
				<h2 class="facet-label">{dimension.label}</h2>
				<div class="chip-row facet-tags">
					{#each visible(dimension) as value (value)}
						<button
							type="button"
							class="chip"
							class:chip--selected={af[key].includes(value)}
							aria-pressed={af[key].includes(value)}
							data-count={filters.counts[key][value] ?? 0}
							onclick={() => filters.toggle(key, value)}
						>
							{label(key, value)} <span class="chip-count">{filters.counts[key][value] ?? 0}</span>
						</button>
					{/each}
				</div>
				{#if dimension.limit !== undefined && needsFacetCombobox(dimension.options.length, dimension.limit)}
					<FacetCombobox
						options={dimension.options}
						counts={filters.counts[key]}
						selected={af[key]}
						label={dimension.noun ?? dimension.label.toLowerCase()}
						labelOf={(value) => filters.valueLabel(key, value)}
						ontoggle={(value) => filters.toggle(key, value)}
					/>
				{/if}
			</div>
		{/if}
	{/each}
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
