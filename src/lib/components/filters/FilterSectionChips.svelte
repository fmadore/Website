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
	.filter-section-content {
		padding: 0;
	}

	.filter-section-header {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
	}

	.filter-section-title {
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0;
	}

	.active-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-white);
		background: var(--color-accent);
		border-radius: var(--border-radius-full);
		padding: 0 var(--space-2xs);
	}

	.filter-chips-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	/* Filter chip button styling */
	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text);
		background: color-mix(in srgb, var(--color-surface-alt) 50%, transparent);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-full);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.filter-chip:hover {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
		color: var(--color-text-emphasis);
	}

	.filter-chip.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-white);
		box-shadow: var(--shadow-sm);
	}

	.filter-chip.active:hover {
		background: var(--color-accent-dark);
		border-color: var(--color-accent-dark);
	}

	.chip-text {
		line-height: var(--line-height-none);
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chip-count {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		opacity: 0.7;
		min-width: 1.25em;
		text-align: center;
	}

	.filter-chip.active .chip-count {
		opacity: 0.9;
	}

	/* Actions row */
	.filter-actions {
		display: flex;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	.filter-actions:empty {
		display: none;
	}

	.action-button {
		padding: 0;
		font-family: var(--font-family-sans);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.action-button:hover {
		color: var(--color-accent);
	}

	.action-button.clear {
		color: var(--color-danger);
	}

	.action-button.clear:hover {
		color: var(--color-danger-dark);
	}

	/* Dark mode */
	:global(html.dark) .filter-chip {
		background: color-mix(in srgb, var(--color-surface-alt) 30%, transparent);
		border-color: var(--color-border);
	}

	:global(html.dark) .filter-chip:hover {
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		border-color: color-mix(in srgb, var(--color-accent) 50%, transparent);
	}

	:global(html.dark) .filter-chip.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	/* Mobile: Cards for each section */
	@media (max-width: 1024px) {
		.filter-section-content {
			background: var(--color-surface);
			border: var(--border-width-thin) solid var(--color-border);
			border-radius: var(--border-radius-md);
			padding: var(--space-md);
		}

		:global(html.dark) .filter-section-content {
			background: var(--color-surface);
			border-color: var(--color-border);
		}
	}

	/* Responsive design */
	@media (--sm-down) {
		.filter-section-title {
			font-size: var(--font-size-xs);
		}

		.filter-chips-container {
			gap: var(--space-2xs);
		}

		.filter-chip {
			padding: var(--space-2xs) var(--space-xs);
			font-size: var(--font-size-xs);
		}

		.chip-text {
			max-width: 120px;
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-chip,
		.action-button {
			transition: none;
		}
	}
</style>
