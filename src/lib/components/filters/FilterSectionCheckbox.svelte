<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';

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

<div class="filter-section-content glass-panel-light">
	<h3 class="filter-section-title">{title}</h3>
	<div class="filter-chips-container">
		{#each items as item (item)}
			<Button
				variant="outline-secondary"
				size="sm"
				glass={true}
				additionalClasses="filter-chip {activeItems.includes(item) ? 'active' : ''}"
				onclick={() => handleToggleItem(item)}
			>
				<span class="chip-text">{itemLabels?.[item] ?? item}</span>
				{#if counts !== undefined}
					<span class="chip-count">({getCount(item)})</span>
				{/if}
			</Button>
		{/each}
	</div>
</div>

<style>
	.filter-section-content {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-4);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.filter-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--spacing-3) 0;
		padding-bottom: var(--spacing-2);
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-accent-rgb), var(--opacity-medium));
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

	/* Remove unused selector - the chip-count is not a direct child of .filter-chip.active */
	/* :global(html.dark) .filter-chip.active .chip-count {
		background: rgba(var(--color-black-rgb), var(--opacity-medium-high));
	} */

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
