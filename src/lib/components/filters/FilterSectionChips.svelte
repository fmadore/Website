<script lang="ts">

	
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
	let displayedItems = $derived(
		showAll ? items : items.slice(0, initialDisplayCount)
	);

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
		activeItems.forEach(item => handleToggleItem(item));
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
			<button
				class="filter-chip glass-button"
				class:active={activeItems.includes(item)}
				onclick={() => handleToggleItem(item)}
			>
				<span class="chip-text">{item}</span>
				{#if counts !== undefined}
					<span class="chip-count">({getCount(item)})</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Show more/less button -->
	{#if hasMoreItems}
		<button 
			class="show-more-button glass-button" 
			onclick={toggleShowAll}
		>
			{showAll ? `Show less (${initialDisplayCount})` : `Show more (+${items.length - initialDisplayCount})`}
		</button>
	{/if}

	<!-- Clear selection button -->
	{#if activeItems.length > 0}
		<button 
			class="clear-selection-button glass-button" 
			onclick={clearSelection}
		>
			Clear selection ({activeItems.length})
		</button>
	{/if}
</div>

<style>
	.filter-section-content {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-4);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
		border-bottom: var(--border-width-thin) solid rgba(var(--color-accent-rgb), var(--opacity-medium));
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

	.filter-chip {
		background: rgba(var(--color-surface-rgb), var(--opacity-medium)) !important;
		color: var(--color-text) !important;
		border: var(--border-width-thin) solid rgba(var(--color-surface-rgb), var(--opacity-medium-high)) !important;
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-md) !important;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
		white-space: nowrap;
		backdrop-filter: blur(8px) !important;
		-webkit-backdrop-filter: blur(8px) !important;
		box-shadow: var(--shadow-sm) !important;
	}

	.filter-chip:hover {
		background: rgba(var(--color-accent-rgb), var(--opacity-medium)) !important;
		border-color: rgba(var(--color-accent-rgb), var(--opacity-medium-high)) !important;
		color: var(--color-text-emphasis) !important;
		transform: var(--transform-lift-sm) !important;
		box-shadow: var(--shadow-md) !important;
	}

	.filter-chip.active {
		background: linear-gradient(135deg, 
			var(--color-accent) 0%, 
			var(--color-highlight) 100%) !important;
		color: var(--color-background) !important;
		border-color: var(--color-accent) !important;
		box-shadow: var(--shadow-md) !important;
	}

	.filter-chip.active:hover {
		background: linear-gradient(135deg, 
			var(--color-highlight) 0%, 
			var(--color-accent) 100%) !important;
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
		background: rgba(255, 255, 255, 0.2);
		padding: 1px var(--spacing-1);
		border-radius: var(--border-radius-sm);
		line-height: 1;
	}

	.filter-chip.active .chip-count {
		background: rgba(255, 255, 255, 0.3);
	}

	.show-more-button,
	.clear-selection-button {
		background: rgba(var(--color-surface-rgb), var(--opacity-medium)) !important;
		color: var(--color-text) !important;
		border: var(--border-width-thin) solid rgba(var(--color-surface-rgb), var(--opacity-medium-high)) !important;
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-md) !important;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
		margin-right: var(--spacing-2);
		margin-bottom: var(--spacing-1);
		backdrop-filter: blur(8px) !important;
		-webkit-backdrop-filter: blur(8px) !important;
		box-shadow: var(--shadow-sm) !important;
	}

	.show-more-button:hover,
	.clear-selection-button:hover {
		background: rgba(var(--color-accent-rgb), var(--opacity-medium)) !important;
		border-color: rgba(var(--color-accent-rgb), var(--opacity-medium-high)) !important;
		transform: var(--transform-lift-sm) !important;
		box-shadow: var(--shadow-md) !important;
	}

	.clear-selection-button {
		background: linear-gradient(135deg, 
			var(--color-secondary) 0%, 
			var(--color-text-muted) 100%) !important;
		color: var(--color-background) !important;
		border-color: var(--color-secondary) !important;
	}

	.clear-selection-button:hover {
		background: linear-gradient(135deg, 
			var(--color-accent) 0%, 
			var(--color-highlight) 100%) !important;
		border-color: var(--color-accent) !important;
	}

	/* Focus states */
	.filter-chip:focus-visible,
	.show-more-button:focus-visible,
	.clear-selection-button:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-medium);
	}

	/* Dark mode overrides */
	:global(html.dark) .filter-section-content {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .filter-chip {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium)) !important;
		border-color: rgba(255, 255, 255, 0.1) !important;
		color: var(--color-text) !important;
	}

	:global(html.dark) .filter-chip:hover {
		background: rgba(var(--color-accent-rgb), var(--opacity-medium)) !important;
		border-color: rgba(var(--color-accent-rgb), var(--opacity-medium-high)) !important;
	}

	:global(html.dark) .show-more-button,
	:global(html.dark) .clear-selection-button {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium)) !important;
		border-color: rgba(255, 255, 255, 0.1) !important;
		color: var(--color-text) !important;
	}

	:global(html.dark) .show-more-button:hover {
		background: rgba(var(--color-accent-rgb), var(--opacity-medium)) !important;
		border-color: rgba(var(--color-accent-rgb), var(--opacity-medium-high)) !important;
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.filter-section-content {
			padding: var(--spacing-3);
		}

		.filter-chip,
		.show-more-button,
		.clear-selection-button {
			padding: var(--spacing-1) var(--spacing-2);
			font-size: var(--font-size-xs);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-section-content,
		.filter-chip,
		.show-more-button,
		.clear-selection-button {
			transition: none;
		}

		.filter-chip:hover,
		.filter-chip.active:hover,
		.show-more-button:hover,
		.clear-selection-button:hover {
			transform: none;
		}
	}
</style> 