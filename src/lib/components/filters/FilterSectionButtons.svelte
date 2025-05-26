<script lang="ts">
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
</script>

<div class="filter-section">
	<h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">{title}</h3>
	<div class="flex flex-wrap gap-2">
		{#each items as item}
			<button
				class="tag-button"
				class:active={activeItems.includes(item)}
				onclick={() => toggleItem(item)}
			>
				{item}
				{#if counts !== undefined}
					<span class="tag-count">({getCount(item)})</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	/* Styles moved from sidebar components */
	.filter-section {
		margin-bottom: var(--spacing-6, 1.5rem);
	}

	/* Use theme variable directly */
	.text-dark {
		color: var(--color-text);
	}

	.font-weight-600 {
		font-weight: var(--font-weight-semibold, 600);
	}

	.mb-3 {
		margin-bottom: var(--spacing-3, 0.75rem);
	}

	.pb-2 {
		padding-bottom: var(--spacing-2, 0.5rem);
	}

	/* Use theme variable directly */
	.border-gray-200 {
		border-bottom: 1px solid var(--color-border);
	}

	.flex {
		display: flex;
	}

	.flex-wrap {
		flex-wrap: wrap;
	}

	.gap-2 {
		gap: var(--spacing-2, 0.5rem);
	}

	.tag-button {
		/* Use theme variables for background and text */
		background-color: color-mix(
			in srgb,
			var(--color-border) 80%,
			transparent
		); /* Use theme border color with transparency */
		color: var(--color-text-light); /* Use theme light text color */
		padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
		border-radius: var(--border-radius-full, 9999px);
		font-size: var(--font-size-xs, 0.8rem);
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: var(--spacing-2, 0.5rem);
	}

	.tag-button:hover {
		background-color: var(--color-border); /* Use solid theme border color on hover */
		color: var(--color-text);
	}

	.tag-button.active {
		background-color: var(--color-primary, #2b6cb0);
		color: var(--color-white, white);
	}

	.tag-count {
		opacity: 0.7;
		margin-left: var(--spacing-px, 2px);
		font-size: var(--font-size-xxs, 0.7rem);
	}
</style>
