<script lang="ts" module>
	import type { SortKey } from '#lib/utils/sortUtils.ts';

	/** One option of the sort row. */
	export interface SortOption {
		value: SortKey;
		label: string;
		/** A direction glyph after the label, decoration only (`aria-hidden`). */
		glyph?: string;
	}

	/** The order every index offers: newest first, or by title. */
	export const DEFAULT_SORT_OPTIONS: readonly SortOption[] = [
		{ value: 'date', label: 'Date', glyph: '↓' },
		{ value: 'title', label: 'A–Z' }
	];
</script>

<script lang="ts" generics="TItem, K extends string">
	// Filter bar of the entity-index pages (/publications, /conference-activity,
	// the citations page): free-text search, type chips, the tally, language
	// chips, the `More filters` disclosure and the sort row. Styled by
	// entity-index.css (imported by the page). Page-specific controls (e.g. the
	// map toggle) render through the `extraControls` snippet, between the facet
	// toggle and the sort group.
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import type { EntityFilterSystem } from '#lib/utils/entityFilterSystem.svelte.ts';
	import { hasGridFilters } from '#lib/utils/entityFilterCore.ts';
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import { FACET_GRID_ID } from './EntityFacetGrid.svelte';
	import EntityFilterSummary from './EntityFilterSummary.svelte';

	interface Props {
		filters: EntityFilterSystem<TItem, K>;
		/** Full type labels (title attribute, and the tally's "Type:" values). */
		typeLabels: Record<string, string>;
		/** Short chip labels for the compact type row. */
		typeChipLabels: Record<string, string>;
		ariaLabel: string;
		searchPlaceholder: string;
		searchAriaLabel: string;
		sortAriaLabel: string;
		/** The corpus figures the tally and its year read-out print. */
		totalEntries: number;
		minYear: number;
		maxYear: number;
		/** The list below is empty: its empty state carries the clear control. */
		empty?: boolean;
		facetsOpen?: boolean;
		activeSort?: SortKey;
		sortOptions?: readonly SortOption[];
		extraControls?: Snippet;
	}

	let {
		filters,
		typeLabels,
		typeChipLabels,
		ariaLabel,
		searchPlaceholder,
		searchAriaLabel,
		sortAriaLabel,
		totalEntries,
		minYear,
		maxYear,
		empty = false,
		facetsOpen = $bindable(false),
		activeSort = $bindable('date'),
		sortOptions = DEFAULT_SORT_OPTIONS,
		extraControls
	}: Props = $props();

	const af = $derived(filters.activeFilters);

	// The bar draws the page's two bar facets: the primary row (types, opened by
	// "All N") and the labelled secondary row (language), whatever their keys.
	const primary = $derived(filters.dimensions.find((d) => d.placement === 'bar-primary'));
	const secondary = $derived(filters.dimensions.find((d) => d.placement === 'bar-secondary'));

	/* The grid is closed by default at every width, so the list starts in the
	 * first viewport. A filter on one of its facets (a `?tag=` deep link, Back
	 * to a filtered view, an agent's `show_publications`) opens it: an active
	 * filter is never left behind a closed disclosure. Only the arrival of such
	 * a filter opens it; a reader who then closes the grid keeps it closed, and
	 * the tally still names what is set. */
	const gridActive = $derived(hasGridFilters(af, filters.dimensions));
	$effect(() => {
		if (gridActive) untrack(() => (facetsOpen = true));
	});
</script>

<section class="filter-bar" aria-label={ariaLabel}>
	<div class="filter-bar-top">
		<div class="pub-search">
			<span class="pub-search-icon" aria-hidden="true">⌕</span>
			<input
				type="search"
				class="pub-search-input"
				placeholder={searchPlaceholder}
				aria-label={searchAriaLabel}
				bind:value={filters.searchTerm}
			/>
		</div>

		<!-- The tally follows the search in the source, so on a phone it sits
		     directly under the field being typed in, above the long type row and
		     clear of the on-screen keyboard. From --lg the row's grid sets it
		     under the search and the type chips together. -->
		<EntityFilterSummary {filters} {totalEntries} {minYear} {maxYear} {typeLabels} {empty} />

		<!-- Both facet rows are groups: their chips read "All 44", "English 24" on
		     screen and must keep those as their accessible names (SC 2.5.3), so
		     the thing being filtered is named on the container instead of being
		     smuggled into each chip's `aria-label`. -->
		{#if primary}
			{@const key = primary.key}
			<div class="chip-row type-chips" role="group" aria-label={primary.label}>
				<!-- "All" prints what clearing this row returns, not the corpus total:
				     under another active facet the two differ, and the chip would be
				     asserting a count clicking it does not produce. Same rule below
				     for the language row. -->
				<button
					type="button"
					class="chip"
					class:chip--selected={af[key].length === 0}
					aria-pressed={af[key].length === 0}
					data-count={filters.totals[key]}
					onclick={() => filters.setValues(key, [])}
				>
					All <span class="chip-count">{filters.totals[key]}</span>
				</button>
				{#each primary.options as type (type)}
					<button
						type="button"
						class="chip"
						class:chip--selected={af[key].includes(type)}
						aria-pressed={af[key].includes(type)}
						data-count={filters.counts[key][type] ?? 0}
						onclick={() => filters.toggle(key, type)}
						title={typesetQuotes(typeLabels[type] ?? type)}
					>
						{typesetQuotes(typeChipLabels[type] ?? typeLabels[type] ?? type)}
						<span class="chip-count">{filters.counts[key][type] ?? 0}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="filter-bar-bottom">
		<!-- Language is a facet like type and tags, so it is drawn like them: the
		     same chips, not its own row of underlined options. The visible label
		     keeps it apart from the type row above, which also opens on "All N". -->
		{#if secondary}
			{@const key = secondary.key}
			<div class="chip-row language-chips" role="group" aria-label={secondary.label}>
				<span class="filter-group-label">{secondary.label}:</span>
				<button
					type="button"
					class="chip"
					class:chip--selected={af[key].length === 0}
					aria-pressed={af[key].length === 0}
					data-count={filters.totals[key]}
					onclick={() => filters.setValues(key, [])}
				>
					All <span class="chip-count">{filters.totals[key]}</span>
				</button>
				{#each secondary.options as lang (lang)}
					<button
						type="button"
						class="chip"
						class:chip--selected={af[key].includes(lang)}
						aria-pressed={af[key].includes(lang)}
						data-count={filters.counts[key][lang] ?? 0}
						onclick={() => filters.toggle(key, lang)}
					>
						{lang}
						<span class="chip-count">{filters.counts[key][lang] ?? 0}</span>
					</button>
				{/each}
			</div>
		{/if}

		<div class="filter-bar-controls">
			<button
				type="button"
				class="facet-toggle"
				aria-expanded={facetsOpen}
				aria-controls={FACET_GRID_ID}
				onclick={() => (facetsOpen = !facetsOpen)}
			>
				More filters <span aria-hidden="true">{facetsOpen ? '▴' : '▾'}</span>
			</button>
			{@render extraControls?.()}
			<div class="sort-control" role="group" aria-label={sortAriaLabel}>
				<span class="filter-group-label">Sort:</span>
				{#each sortOptions as option, i (option.value)}
					{#if i > 0}<span class="sort-sep" aria-hidden="true">·</span>{/if}
					<button
						type="button"
						class="sort-opt"
						class:sort-opt--active={activeSort === option.value}
						aria-pressed={activeSort === option.value}
						onclick={() => (activeSort = option.value)}
					>
						{option.label}
						{#if option.glyph}<span aria-hidden="true">{option.glyph}</span>{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* Controls do not print (the Paper Rule): the search, the chip rows, the
	 * disclosure and the sort are all things to act on, and paper cannot. The
	 * tally between them stays, so the printed list states its narrowing. */
	@media print {
		.pub-search,
		.type-chips,
		.filter-bar-bottom {
			display: none;
		}

		.filter-bar {
			margin-top: var(--space-md);
			padding-top: 0;
			border-top: none;
		}
	}
</style>
