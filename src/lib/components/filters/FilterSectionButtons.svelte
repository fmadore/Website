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

	// Direct toggle function (scroll preservation handled at sidebar level)
	function handleToggleItem(item: string) {
		toggleItem(item);
	}
</script>

<div class="filter-section-content">
	<h3 class="filter-section-title">{title}</h3>
	<div class="filter-chips-container">
		{#each items as item}
			<button
				class="filter-chip"
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
</div>

<style>
	.filter-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text-emphasis);
		margin: 0 0 var(--spacing-3) 0;
		padding-bottom: var(--spacing-2);
		border-bottom: 1px solid var(--color-border);
	}

	.filter-chips-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-3);
	}

	.filter-chip {
		background: var(--color-surface-alt);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		padding: var(--spacing-1) var(--spacing-3);
		border-radius: var(--border-radius);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
		white-space: nowrap;
	}

	.filter-chip:hover {
		border-color: var(--color-primary);
		background: var(--color-surface);
	}

	.filter-chip.active {
		background: var(--color-primary);
		color: var(--color-background);
		border-color: var(--color-primary);
	}

	.chip-text {
		line-height: 1.2;
	}

	.chip-count {
		opacity: 0.8;
		font-size: var(--font-size-xs);
		font-weight: 600;
		background: rgba(255, 255, 255, 0.2);
		padding: 1px var(--spacing-1);
		border-radius: var(--border-radius-sm);
		line-height: 1;
	}

	.filter-chip.active .chip-count {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Focus states */
	.filter-chip:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Dark mode enhancements */
	:global(html.dark) .filter-chip {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark) .filter-chip:hover {
		background: var(--color-surface-alt);
	}
</style>
