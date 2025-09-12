<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';

	let {
		title,
		items, // List of filter items
		activeItems, // List of active items
		toggleItem, // Function to toggle an item
		counts, // Item counts
		searchThreshold = 6, // Show search when items > this number
		initialDisplayCount = 9, // Initial number of items to show
		showSearch = true // Whether to show search functionality
	}: {
		title: string;
		items: string[];
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
		searchThreshold?: number;
		initialDisplayCount?: number;
		showSearch?: boolean;
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

<div class="filter-section-content glass-panel-light">
	<div class="filter-section-header">
		<h3 class="filter-section-title">{title}</h3>
		<span class="items-count">({items.length})</span>
	</div>

	<!-- Filter chips -->
	<div class="filter-chips-container">
		{#each displayedItems as item}
			<Button
				variant="outline-secondary"
				size="sm"
				glass={true}
				additionalClasses="filter-chip {activeItems.includes(item) ? 'active' : ''}"
				onclick={() => handleToggleItem(item)}
			>
				<span class="chip-text">{item}</span>
				{#if counts !== undefined}
					<span class="chip-count">({getCount(item)})</span>
				{/if}
			</Button>
		{/each}
	</div>

	<!-- Show more/less button -->
	{#if hasMoreItems}
		<Button
			variant="outline-secondary"
			size="sm"
			glass={true}
			additionalClasses="show-more-button"
			onclick={toggleShowAll}
		>
			{showAll
				? `Show less (${initialDisplayCount})`
				: `Show more (+${items.length - initialDisplayCount})`}
		</Button>
	{/if}

	<!-- Clear selection button -->
	{#if activeItems.length > 0}
		<Button
			variant="secondary"
			size="sm"
			glass={true}
			additionalClasses="clear-selection-button"
			onclick={clearSelection}
		>
			Clear selection ({activeItems.length})
		</Button>
	{/if}
</div>

<style>
	.filter-section-content {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-4);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.filter-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-3);
	}

	.filter-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0;
		padding-bottom: var(--spacing-2);
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-accent-rgb), var(--opacity-medium));
	}

	.items-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
	}

	.filter-chips-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-3);
	}

	/* Enhanced styles for active state using design system variables */
	:global(.filter-chip.active) {
		background: linear-gradient(
			135deg,
			var(--color-accent) 0%,
			var(--color-highlight) 100%
		) !important;
		color: var(--color-white) !important;
		border-color: var(--color-accent) !important;
		box-shadow: var(--shadow-md) !important;
	}

	:global(.filter-chip.active:hover) {
		background: linear-gradient(
			135deg,
			var(--color-highlight) 0%,
			var(--color-accent) 100%
		) !important;
		transform: var(--transform-lift-sm) !important;
		box-shadow: var(--shadow-lg) !important;
	}

	.chip-text {
		line-height: var(--line-height-snug);
	}

	.chip-count {
		opacity: var(--opacity-high);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		background: rgba(var(--color-white-rgb), var(--opacity-medium));
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-sm);
		line-height: 1;
		margin-left: var(--spacing-1);
		transition: background-color var(--anim-duration-fast) var(--anim-ease-out);
	}

	:global(.filter-chip.active .chip-count) {
		background: rgba(var(--color-white-rgb), var(--opacity-medium-high));
	}

	/* Special styling for control buttons */
	:global(.show-more-button),
	:global(.clear-selection-button) {
		margin-right: var(--spacing-2);
		margin-bottom: var(--spacing-1);
	}

	/* Dark mode overrides using design system variables */
	:global(html.dark) .filter-section-content {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
		box-shadow:
			0 8px 32px 0 rgba(var(--color-black-rgb), var(--opacity-medium)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-low));
	}

	:global(html.dark) .chip-count {
		background: rgba(var(--color-black-rgb), var(--opacity-medium));
	}

	:global(html.dark .filter-chip.active .chip-count) {
		background: rgba(var(--color-black-rgb), var(--opacity-medium-high));
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.filter-section-content {
			padding: var(--spacing-3);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-section-content,
		.chip-count {
			transition: none;
		}

		:global(.filter-chip.active:hover) {
			transform: none !important;
		}
	}
</style>
