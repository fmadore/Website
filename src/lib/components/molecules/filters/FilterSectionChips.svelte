<script lang="ts">
	import { getFilterCount, clearFilterSelection } from '$lib/utils/filterHelpers';

	let {
		title,
		items,
		activeItems,
		toggleItem,
		counts,
		initialDisplayCount = 9
	}: {
		title: string;
		items: string[];
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
		initialDisplayCount?: number;
	} = $props();

	let showAll = $state(false);

	let displayedItems = $derived(showAll ? items : items.slice(0, initialDisplayCount));
	let hasMoreItems = $derived(items.length > initialDisplayCount);

	function toggleShowAll() {
		showAll = !showAll;
	}
</script>

<div class="filter-section-content">
	<div class="filter-section-header">
		<h3 class="filter-section-title">{title}</h3>
	</div>

	<!-- Filter chips (active state already communicates selection; no separate count) -->
	<div class="filter-chips-container">
		{#each displayedItems as item (item)}
			<button
				type="button"
				class="filter-chip {activeItems.includes(item) ? 'active' : ''}"
				title={item}
				onclick={() => toggleItem(item)}
			>
				<span class="chip-text">{item}</span>
				{#if counts !== undefined}
					<span class="chip-count">{getFilterCount(counts, item)}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Actions row — plain text links, not buttons -->
	<div class="filter-actions">
		{#if hasMoreItems}
			<button type="button" class="filter-action-link" onclick={toggleShowAll}>
				{showAll ? 'Show less' : `+${items.length - initialDisplayCount} more`}
			</button>
		{/if}
		{#if activeItems.length > 0}
			<button
				type="button"
				class="filter-action-link filter-action-link--clear"
				onclick={() => clearFilterSelection(activeItems, toggleItem)}
			>
				Clear
			</button>
		{/if}
	</div>
</div>

<style>
	/* Base styles provided by src/styles/components/filters.css */

	/* Chip text overflow handling (specific to this component) */
	.chip-text {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (--sm-down) {
		.chip-text {
			max-width: 120px;
		}
	}
</style>
