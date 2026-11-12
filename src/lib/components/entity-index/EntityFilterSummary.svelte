<script lang="ts" generics="TItem">
	// The tally of an index: what is narrowing the list, how much of it survives,
	// and the way out. It sits directly under the search and type row, so a
	// reader who types sees the count move in the first viewport rather than
	// below a closed grid. The count is the one live region of the apparatus and
	// is mounted permanently: a region that appears with its first message is
	// not reliably announced.
	import type { EntityFilterSystem } from '#lib/utils/entityFilterSystem.svelte.ts';
	import { describeActiveFilters, yearRangeReadout } from '#lib/utils/entityFilterCore.ts';
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import { clearKeepingFocus } from './focusAfterClear';

	interface Props {
		filters: EntityFilterSystem<TItem>;
		totalEntries: number;
		minYear: number;
		maxYear: number;
		/** Display labels for the type codes, so the line never prints one. */
		typeLabels?: Record<string, string>;
		/**
		 * The list is empty. The empty state then carries the one clear control
		 * (the Clearing Rule), where the reader is looking, and this line drops
		 * its own.
		 */
		empty?: boolean;
	}

	let { filters, totalEntries, minYear, maxYear, typeLabels, empty = false }: Props = $props();

	const af = $derived(filters.activeFilters);
	const narrowing = $derived(filters.narrowingCount);
	const matchCount = $derived(filters.filteredItems.length);
	/* Only the search is narrowing: the way out empties the search box, and
	 * says so, rather than promising to clear filters that are not set. */
	const searchOnly = $derived(filters.hasSearch && filters.activeFilterCount === 0);

	/* What is narrowing the list, in the reader's own words, grouped under the
	 * facet headings the grid prints: `Tags: Islam or Togo · Held in: Togo`.
	 * Type codes go through the page's labels; everything else is the authored
	 * value, typeset. */
	const groups = $derived(
		describeActiveFilters(af, {
			labels: filters.labels,
			valueLabel: (key, value) =>
				key === 'types' ? (typeLabels?.[value] ?? value) : typesetQuotes(value),
			yearReadout: yearRangeReadout(af.yearRange, minYear, maxYear),
			searchTerm: filters.searchTerm
		})
	);

	let clearEl: HTMLButtonElement | undefined = $state();
</script>

<div class="facet-summary">
	{#if groups.length > 0}
		<p class="facet-summary-active">
			<span class="filter-note-label">Filtered by</span>
			<span class="filter-note-value">
				{#each groups as group, i (group.key)}
					{#if i > 0}<span class="facet-summary-sep" aria-hidden="true">&nbsp;·</span>{/if}
					<span class="facet-summary-group">
						<span class="facet-summary-facet">{group.label}:</span>
						{#each group.values as value, j (j)}
							{#if j > 0}<span class="facet-summary-or">&nbsp;or&nbsp;</span>{/if}{value}
						{/each}
					</span>
				{/each}
			</span>
		</p>
	{/if}
	<!-- `data-index-tally` is TALLY_ATTRIBUTE: where focus lands after a clear on touch. -->
	<span class="facet-summary-stat" aria-live="polite" tabindex="-1" data-index-tally>
		{#if narrowing > 0}
			<span class="facet-summary-count">{narrowing}</span>
			{narrowing === 1 ? 'filter' : 'filters'} active ·
			<span class="facet-summary-count">{matchCount}</span>
			of {totalEntries}
			{totalEntries === 1 ? 'entry' : 'entries'}
		{:else}
			{totalEntries}
			{totalEntries === 1 ? 'entry' : 'entries'}
		{/if}
	</span>
	{#if narrowing > 0 && !empty}
		<button
			type="button"
			class="mono-action"
			bind:this={clearEl}
			onclick={() => clearKeepingFocus(clearEl ?? null, filters.clearAll)}
		>
			{searchOnly ? 'Clear search' : 'Clear all'} <span aria-hidden="true">✕</span>
		</button>
	{/if}
</div>

<style>
	/* Controls do not print (the Paper Rule). The line that states the
	 * narrowing and its count does, so a printed list says what it is a list of;
	 * the clear control is the screen's. */
	@media print {
		.mono-action {
			display: none;
		}
	}
</style>
