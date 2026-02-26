<script lang="ts">
	let {
		title,
		items, // List of filter items
		activeItems, // List of active items
		toggleItem, // Function to toggle an item
		counts, // Item counts
		initialDisplayCount = 9 // Initial number of items to show
	}: {
		title: string;
		items: string[];
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
		initialDisplayCount?: number;
	} = $props();

	// Local state (no search functionality)
	let showAll = $state(false);

	// Helper to safely get count
	function getCount(item: string): number {
		return counts?.[item] ?? 0;
	}

	// Items to display (limited or all based on showAll, no search filtering)
	let displayedItems = $derived(showAll ? items : items.slice(0, initialDisplayCount));

	// Check if we have more items to show
	let hasMoreItems = $derived(items.length > initialDisplayCount);

	// Direct toggle function (scroll preservation handled at sidebar level)
	function handleToggleItem(item: string) {
		toggleItem(item);
	}

	function toggleShowAll() {
		showAll = !showAll;
	}

	function clearSelection() {
		// Clear all active items for this section
		activeItems.forEach((item) => handleToggleItem(item));
	}
</script>

<div class="filter-section-content">
	<div class="filter-section-header">
		<h3 class="filter-section-title">{title}</h3>
		{#if activeItems.length > 0}
			<span class="active-count">{activeItems.length}</span>
		{/if}
	</div>

	<!-- Filter chips -->
	<div class="filter-chips-container">
		{#each displayedItems as item (item)}
			<button
				type="button"
				class="filter-chip {activeItems.includes(item) ? 'active' : ''}"
				title={item}
				onclick={() => handleToggleItem(item)}
			>
				<span class="chip-text">{item}</span>
				{#if counts !== undefined}
					<span class="chip-count">{getCount(item)}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Actions row -->
	<div class="filter-actions">
		{#if hasMoreItems}
			<button type="button" class="action-button" onclick={toggleShowAll}>
				{showAll ? 'Show less' : `+${items.length - initialDisplayCount} more`}
			</button>
		{/if}
		{#if activeItems.length > 0}
			<button type="button" class="action-button clear" onclick={clearSelection}>
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
