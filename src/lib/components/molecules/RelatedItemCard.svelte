<script lang="ts">
	// Expects the item object and the pre-calculated URL from RelatedItemsList
	let {
		item,
		itemUrl,
		// Updated default classes to align with global glass card + typography system
		cardClass = 'related-item glass-card p-4 focus-outline',
		dateClass = 'related-date text-xs mb-1',
		titleClass = 'related-title',
		authorsClass = 'related-authors text-xs mt-2'
	}: {
		item: {
			id: string | number;
			date?: string;
			title?: string;
			authors?: string[];
			// Add other potential fields if needed, though unused in this display
		};
		itemUrl: string;
		// Styling props
		cardClass?: string; // Reuse existing styles
		dateClass?: string;
		titleClass?: string; // Keeping title styling consistent
		authorsClass?: string;
	} = $props();
</script>

<a href={itemUrl} class={cardClass}>
	{#if item.date}
		<div class={dateClass}>{item.date}</div>
	{/if}
	{#if item.title}
		<h3 class={titleClass}>{item.title}</h3>
	{/if}
	{#if item.authors && item.authors.length > 0}
		<div class={authorsClass}>{item.authors.join(', ')}</div>
	{/if}
</a>

<style>
	/* Enhanced related publication card styling aligned with CitedBy glass cards */
	.related-item {
		position: relative;
		display: block;
		text-decoration: none;
		border-radius: var(--border-radius-lg);
		/* Subtle gradient overlay similar to citing-work-card */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.015) 100%
		);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.related-item:hover {
		transform: var(--transform-lift-sm);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.035) 50%,
			rgba(var(--color-accent-rgb), 0.025) 100%
		);
	}

	.related-date {
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.5px;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.related-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-snug);
		font-family: var(--font-family-serif);
		color: var(--color-text-emphasis);
		margin: 0;
	}

	.related-item:hover .related-title {
		color: var(--color-primary);
	}

	.related-authors {
		color: var(--color-text-light);
		font-weight: var(--font-weight-normal);
	}

	/* Focus accessibility */
	.related-item:focus-visible {
		outline: 2px solid var(--color-highlight);
		outline-offset: 3px;
		box-shadow: 0 0 0 4px rgba(var(--color-highlight-rgb), 0.2);
	}

	/* Responsive tweaks */
	@media (max-width: 640px) {
		.related-title { font-size: var(--font-size-base); }
		.related-item { padding: var(--spacing-3); }
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.related-item { transition: none; }
		.related-item:hover { transform: none; }
	}
</style>
