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
</script>

<div class="filter-section-content">
	<h3 class="filter-section-title">{title}</h3>
	<div class="filter-items">
		{#each items as item}
			<div class="filter-item">
				<label class="filter-label">
					<input
						type="checkbox"
						class="filter-checkbox"
						checked={activeItems.includes(item)}
						onchange={() => toggleItem(item)}
					/>
					<span class="filter-checkbox-custom"></span>
					<span class="filter-text">{itemLabels?.[item] ?? item}</span>
					{#if counts !== undefined}
						<span class="filter-count">({getCount(item)})</span>
					{/if}
				</label>
			</div>
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

	.filter-items {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
	}

	.filter-item {
		transition: transform 0.2s ease;
	}

	.filter-item:hover {
		transform: translateX(2px);
	}

	.filter-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		cursor: pointer;
		padding: var(--spacing-2);
		border-radius: var(--border-radius);
		transition: all 0.2s ease;
		position: relative;
	}

	.filter-label:hover {
		background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
	}

	.filter-checkbox {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.filter-checkbox-custom {
		width: 18px;
		height: 18px;
		border: 2px solid var(--color-border);
		border-radius: var(--border-radius-sm);
		background: var(--color-background);
		position: relative;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.filter-checkbox-custom::after {
		content: '';
		position: absolute;
		left: 5px;
		top: 2px;
		width: 4px;
		height: 8px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg) scale(0);
		transition: transform 0.2s ease;
	}

	.filter-checkbox:checked + .filter-checkbox-custom {
		background: var(--color-primary);
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
	}

	.filter-checkbox:checked + .filter-checkbox-custom::after {
		transform: rotate(45deg) scale(1);
	}

	.filter-text {
		color: var(--color-text);
		font-weight: 500;
		line-height: 1.4;
		flex-grow: 1;
	}

	.filter-count {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
		font-weight: 500;
		background: var(--color-surface-alt);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-full);
		border: 1px solid var(--color-border);
		min-width: 24px;
		text-align: center;
	}

	/* Focus states */
	.filter-checkbox:focus + .filter-checkbox-custom {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	/* Dark mode enhancements */
	:global(html.dark) .filter-checkbox-custom {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark) .filter-count {
		background: var(--color-surface);
		border-color: var(--color-border);
	}
</style>
