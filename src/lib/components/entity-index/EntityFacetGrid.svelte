<script lang="ts" generics="TItem">
	// Facet grid (finding-aid apparatus) of the entity-index pages:
	// projects · co-authors · countries · year slider · tags · summary row.
	// Previously byte-identical markup duplicated across /publications and
	// /conference-activity; now parameterized by the runed EntityFilterSystem.
	// Styled by entity-index.css (imported by the page).
	import RangeSlider from '$lib/components/atoms/RangeSlider.svelte';
	import type { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';

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

	// Overflow toggles for the long facet columns.
	const AUTHOR_LIMIT = 8;
	const TAG_LIMIT = 12;
	const COUNTRY_LIMIT = 8;
	let showAllAuthors = $state(false);
	let showAllTags = $state(false);
	let showAllCountries = $state(false);
	const visibleAuthors = $derived(
		showAllAuthors ? options.authors : options.authors.slice(0, AUTHOR_LIMIT)
	);
	const visibleTags = $derived(showAllTags ? options.tags : options.tags.slice(0, TAG_LIMIT));
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

<section class="facet-grid rule-hairline" class:facet-grid--open={open} aria-label="Facets">
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
							onclick={() => filters.toggle('projects', project)}
						>
							<span class="facet-marker" class:facet-marker--on={active} aria-hidden="true"></span>
							<span class="facet-name">{project}</span>
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
							onclick={() => filters.toggle('authors', author)}
						>
							<span class="facet-name">{author}</span>
							<span class="facet-count">{filters.counts.authors[author] ?? 0}</span>
						</button>
					</li>
				{/each}
			</ul>
			{#if options.authors.length > AUTHOR_LIMIT}
				<button type="button" class="facet-more" onclick={() => (showAllAuthors = !showAllAuthors)}>
					{showAllAuthors ? 'Show fewer ↑' : `All ${options.authors.length} co-authors ↓`}
				</button>
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
							onclick={() => filters.toggle('countries', country)}
						>
							<span class="facet-name">{country}</span>
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
					{showAllCountries ? 'Show fewer ↑' : `All ${options.countries.length} ↓`}
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
						onchange={handleYearChange}
					/>
				</div>
				<span class="facet-years-bound">{maxYear}</span>
			</div>
			{#if af.yearRange}
				<button type="button" class="facet-more" onclick={filters.resetYearRange}>
					Reset years ✕
				</button>
			{/if}
		{/if}
	</div>

	<!-- TAGS + summary -->
	{#if options.tags.length > 0}
		<div class="facet-col facet-col--tags">
			<h2 class="facet-label">Tags</h2>
			<div class="chip-row facet-tags">
				{#each visibleTags as tag (tag)}
					<button
						type="button"
						class="chip"
						class:chip--selected={af.tags.includes(tag)}
						onclick={() => filters.toggle('tags', tag)}
					>
						{tag} <span class="chip-count">{filters.counts.tags[tag] ?? 0}</span>
					</button>
				{/each}
			</div>
			{#if options.tags.length > TAG_LIMIT}
				<button type="button" class="facet-more" onclick={() => (showAllTags = !showAllTags)}>
					{showAllTags ? 'Show fewer ↑' : `All ${options.tags.length} tags ↓`}
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
					<button type="button" class="facet-clear" onclick={onclearall}>Clear all ✕</button>
				{/if}
			</div>
		</div>
	{/if}
</section>
