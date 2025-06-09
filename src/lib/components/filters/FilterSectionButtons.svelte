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

<div class="filter-section-content">
	<h3 class="filter-section-title">{title}</h3>
	<div class="filter-buttons-grid">
		{#each items as item}
			<button
				class="filter-tag-button"
				class:active={activeItems.includes(item)}
				onclick={() => toggleItem(item)}
			>
				<span class="tag-text">{item}</span>
				{#if counts !== undefined}
					<span class="tag-count">({getCount(item)})</span>
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
		margin: 0 0 var(--spacing-4) 0;
		padding-bottom: var(--spacing-2);
		border-bottom: 2px solid transparent;
		background: linear-gradient(90deg, var(--color-primary), var(--color-accent)) no-repeat;
		background-size: 40px 2px;
		background-position: 0 100%;
		transition: background-size 0.3s ease;
	}

	.filter-section-title:hover {
		background-size: 60px 2px;
	}

	.filter-buttons-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-2);
	}

	.filter-tag-button {
		background: linear-gradient(
			135deg,
			var(--color-surface-alt) 0%,
			color-mix(in srgb, var(--color-surface-alt) 90%, var(--color-primary) 10%) 100%
		);
		color: var(--color-text);
		border: 1px solid color-mix(in srgb, var(--color-border) 80%, var(--color-primary) 20%);
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-1);
		box-shadow: var(--shadow-sm);
	}

	.filter-tag-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(var(--color-primary-rgb), 0.1),
			transparent
		);
		transition: left 0.5s ease;
	}

	.filter-tag-button:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
		background: linear-gradient(
			135deg,
			var(--color-surface) 0%,
			color-mix(in srgb, var(--color-surface) 85%, var(--color-primary) 15%) 100%
		);
	}

	.filter-tag-button:hover::before {
		left: 100%;
	}

	.filter-tag-button.active {
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-accent) 100%
		);
		color: var(--color-background);
		border-color: var(--color-primary);
		box-shadow: 
			var(--shadow-md),
			0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
		transform: translateY(-1px);
	}

	.filter-tag-button.active::before {
		display: none;
	}

	.tag-text {
		line-height: 1.2;
	}

	.tag-count {
		opacity: 0.8;
		font-size: var(--font-size-xs);
		font-weight: 600;
		background: rgba(255, 255, 255, 0.2);
		padding: 1px var(--spacing-1);
		border-radius: var(--border-radius-sm);
		line-height: 1;
	}

	.filter-tag-button.active .tag-count {
		background: rgba(255, 255, 255, 0.3);
	}

	/* Focus states */
	.filter-tag-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Dark mode enhancements */
	:global(html.dark) .filter-tag-button {
		background: linear-gradient(
			135deg,
			var(--color-surface) 0%,
			color-mix(in srgb, var(--color-surface) 90%, var(--color-primary) 10%) 100%
		);
		border-color: var(--color-border);
	}

	:global(html.dark) .filter-tag-button:hover {
		background: linear-gradient(
			135deg,
			var(--color-surface-alt) 0%,
			color-mix(in srgb, var(--color-surface-alt) 85%, var(--color-primary) 15%) 100%
		);
	}
</style>
