<script lang="ts" generics="TItem">
	// Filter bar of the entity-index pages (/publications, /conference-activity):
	// free-text search, type chips, language chips, facet/sort controls. Markup
	// shared verbatim between both pages; styled by entity-index.css (imported
	// by the page). Page-specific controls (e.g. the map toggle) render through
	// the `extraControls` snippet, between the facet toggle and the sort group.
	import type { Snippet } from 'svelte';
	import type { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';
	import { createFacetCollapsible } from '$lib/utils/facetDisclosure.svelte';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import { FACET_GRID_ID } from './EntityFacetGrid.svelte';

	interface Props {
		filters: EntityFilterSystem<TItem>;
		/** Full type labels (title attribute). */
		typeLabels: Record<string, string>;
		/** Short chip labels for the compact type row. */
		typeChipLabels: Record<string, string>;
		ariaLabel: string;
		searchPlaceholder: string;
		searchAriaLabel: string;
		sortAriaLabel: string;
		searchTerm?: string;
		facetsOpen?: boolean;
		activeSort?: 'date' | 'title';
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
		searchTerm = $bindable(''),
		facetsOpen = $bindable(false),
		activeSort = $bindable('date'),
		extraControls
	}: Props = $props();

	const af = $derived(filters.activeFilters);
	const options = $derived(filters.filterOptions);

	/* The toggle only exists below --lg; above it the grid is always laid out
	 * and the button is `display: none`. /activities opens its browse aside
	 * behind the same disclosure, so the breakpoint state is shared rather than
	 * written twice (`facetDisclosure.svelte.ts`). */
	const collapsible = createFacetCollapsible();
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
				bind:value={searchTerm}
			/>
		</div>

		<!-- Both facet rows are groups: their chips read "All 44", "English 24" on
		     screen and must keep those as their accessible names (SC 2.5.3), so
		     the thing being filtered is named on the container instead of being
		     smuggled into each chip's `aria-label`. -->
		<div class="chip-row type-chips" role="group" aria-label="Type">
			<!-- "All" prints what clearing this row returns, not the corpus total:
			     under another active facet the two differ, and the chip would be
			     asserting a count clicking it does not produce. Same rule below
			     for the language row. -->
			<button
				type="button"
				class="chip"
				class:chip--selected={af.types.length === 0}
				aria-pressed={af.types.length === 0}
				data-count={filters.totals.types}
				onclick={() => filters.setValues('types', [])}
			>
				All <span class="chip-count">{filters.totals.types}</span>
			</button>
			{#each options.types as type (type)}
				<button
					type="button"
					class="chip"
					class:chip--selected={af.types.includes(type)}
					aria-pressed={af.types.includes(type)}
					data-count={filters.counts.types[type] ?? 0}
					onclick={() => filters.toggle('types', type)}
					title={typesetQuotes(typeLabels[type] ?? type)}
				>
					{typesetQuotes(typeChipLabels[type] ?? typeLabels[type] ?? type)}
					<span class="chip-count">{filters.counts.types[type] ?? 0}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="filter-bar-bottom">
		<!-- Language is a facet like type and tags, so it is drawn like them: the
		     same chips, not its own row of underlined options. The visible label
		     keeps it apart from the type row above, which also opens on "All N". -->
		<div class="chip-row language-chips" role="group" aria-label="Language">
			<span class="filter-group-label">Language:</span>
			<button
				type="button"
				class="chip"
				class:chip--selected={af.languages.length === 0}
				aria-pressed={af.languages.length === 0}
				data-count={filters.totals.languages}
				onclick={() => filters.setValues('languages', [])}
			>
				All <span class="chip-count">{filters.totals.languages}</span>
			</button>
			{#each options.languages as lang (lang)}
				<button
					type="button"
					class="chip"
					class:chip--selected={af.languages.includes(lang)}
					aria-pressed={af.languages.includes(lang)}
					data-count={filters.counts.languages[lang] ?? 0}
					onclick={() => filters.toggle('languages', lang)}
				>
					{lang}
					<span class="chip-count">{filters.counts.languages[lang] ?? 0}</span>
				</button>
			{/each}
		</div>

		<div class="filter-bar-controls">
			<button
				type="button"
				class="facet-toggle"
				aria-expanded={collapsible.current ? facetsOpen : undefined}
				aria-controls={FACET_GRID_ID}
				onclick={() => (facetsOpen = !facetsOpen)}
			>
				More filters <span aria-hidden="true">{facetsOpen ? '▴' : '▾'}</span>
			</button>
			{@render extraControls?.()}
			<div class="sort-control" role="group" aria-label={sortAriaLabel}>
				<span class="filter-group-label">Sort:</span>
				<button
					type="button"
					class="sort-opt"
					class:sort-opt--active={activeSort === 'date'}
					aria-pressed={activeSort === 'date'}
					onclick={() => (activeSort = 'date')}
				>
					Date <span aria-hidden="true">↓</span>
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
