<script lang="ts">
	let {
		title,
		items, // e.g., ['book', 'article'] or ['Author One', 'Author Two']
		itemLabels = undefined, // Made optional
		activeItems, // The reactive list of active filters (e.g., $activeFilters.types)
		toggleItem, // Function to toggle an item
		counts // e.g., { 'book': 10, 'article': 5 }
	}: {
		title: string;
		items: string[];
		itemLabels: { [key: string]: string } | undefined;
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
	} = $props();

	// Helper to safely get count, defaulting to 0
	function getCount(item: string): number {
		return counts?.[item] ?? 0;
	}

	// Direct toggle function (scroll preservation handled at sidebar level)
	function handleToggleItem(item: string) {
		toggleItem(item);
	}
</script>

<div class="filter-section-content">
	<h3 class="filter-section-title">{title}</h3>
	<div class="filter-chips-container">
		{#each items as item (item)}
			<button
				type="button"
				class="filter-chip {activeItems.includes(item) ? 'active' : ''}"
				onclick={() => handleToggleItem(item)}
			>
				<span class="chip-text">{itemLabels?.[item] ?? item}</span>
				{#if counts !== undefined}
					<span class="chip-count">{getCount(item)}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.filter-section-content {
		padding: 0;
	}

	.filter-section-title {
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0 0 var(--space-sm) 0;
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
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-chip {
			transition: none;
		}
	}
</style>
