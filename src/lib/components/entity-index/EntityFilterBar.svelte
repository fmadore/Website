<script lang="ts" generics="TItem">
	// Filter bar of the entity-index pages (/publications, /conference-activity):
	// free-text search, type chips, language row, facet/sort controls. Markup
	// shared verbatim between both pages; styled by entity-index.css (imported
	// by the page). Page-specific controls (e.g. the map toggle) render through
	// the `extraControls` snippet, between the facet toggle and the sort group.
	import type { Snippet } from 'svelte';
	import type { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';

	interface Props {
		filters: EntityFilterSystem<TItem>;
		totalEntries: number;
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
		totalEntries,
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

		<div class="chip-row type-chips">
			<button
				type="button"
				class="chip"
				class:chip--selected={af.types.length === 0}
				onclick={() => filters.setValues('types', [])}
			>
				All <span class="chip-count">{totalEntries}</span>
			</button>
			{#each options.types as type (type)}
				<button
					type="button"
					class="chip"
					class:chip--selected={af.types.includes(type)}
					onclick={() => filters.toggle('types', type)}
					title={typeLabels[type] ?? type}
				>
					{typeChipLabels[type] ?? typeLabels[type] ?? type}
					<span class="chip-count">{filters.counts.types[type] ?? 0}</span>
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
				class:language-opt--active={af.languages.length === 0}
				onclick={() => filters.setValues('languages', [])}
			>
				All
			</button>
			{#each options.languages as lang (lang)}
				<button
					type="button"
					class="language-opt"
					class:language-opt--active={af.languages.includes(lang)}
					onclick={() => filters.toggle('languages', lang)}
				>
					{lang}
					<span class="language-count">{filters.counts.languages[lang] ?? 0}</span>
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
			{@render extraControls?.()}
			<div class="sort-control" role="group" aria-label={sortAriaLabel}>
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
