<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';

	let {
		title,
		items, // List of tags
		activeItems, // List of active tags
		toggleItem, // Function to toggle a tag
		counts // Tag counts
	}: {
		title: string;
		items: string[];
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
	} = $props();

	// Helper to safely get count
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
				<span class="chip-text">{item}</span>
				{#if counts !== undefined}
					<span class="chip-count">({getCount(item)})</span>
				{/if}
			</Button>
		{/each}
	</div>
</div>

<style>
	.filter-section-content {
		padding: var(--space-md);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--space-md);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.filter-section-content:hover {
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-white-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-md);
		transform: var(--transform-lift-sm);
	}

	.filter-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0 0 var(--space-sm) 0;
		padding-bottom: var(--space-xs);
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-accent-rgb), var(--opacity-medium));
	}

	.filter-chips-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
	}

	/* Enhanced styles for active state using design system variables */
	:global(.filter-chip.active) {
		background: var(--gradient-accent-highlight) !important;
		color: var(--color-white) !important;
		border-color: var(--color-accent) !important;
		box-shadow: var(--shadow-md) !important;
	}

	:global(.filter-chip.active:hover) {
		background: var(--gradient-highlight-accent) !important;
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
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
		line-height: 1;
		margin-left: var(--space-2xs);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	:global(.filter-chip.active .chip-count) {
		background: rgba(var(--color-white-rgb), var(--opacity-medium-high));
	}

	/* Dark mode overrides using design system variables */
	:global(html.dark) .filter-section-content {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
		box-shadow:
			var(--shadow-glass),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-low));
	}

	:global(html.dark) .chip-count {
		background: rgba(var(--color-black-rgb), var(--opacity-medium));
	}

	:global(html.dark .filter-chip.active .chip-count) {
		background: rgba(var(--color-black-rgb), var(--opacity-medium-high));
	}

	/* Responsive design - Mobile first */
	@media (max-width: 639px) {
		.filter-section-content {
			padding: var(--space-sm);
			margin-bottom: var(--space-sm);
		}

		.filter-section-title {
			font-size: var(--font-size-base);
			margin-bottom: var(--space-xs);
		}

		.filter-chips-container {
			gap: var(--space-2xs);
		}

		.chip-count {
			padding: var(--space-3xs) var(--space-2xs);
		}
	}

	/* Medium screens */
	@media (min-width: 640px) and (max-width: 1023px) {
		.filter-chips-container {
			gap: var(--space-xs);
		}
	}

	/* Large screens */
	@media (min-width: 1024px) {
		.filter-section-content {
			padding: var(--space-lg);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-section-content,
		.chip-count {
			transition: none;
		}

		.filter-section-content:hover {
			transform: none;
		}

		:global(.filter-chip.active:hover) {
			transform: none !important;
		}
	}
</style>
