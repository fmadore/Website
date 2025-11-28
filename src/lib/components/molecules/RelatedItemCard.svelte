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
	/* Enhanced related publication card styling - simpler to avoid nested card effect */
	.related-item {
		position: relative;
		display: block;
		text-decoration: none;
		padding: var(--space-md);
		border-radius: var(--border-radius-lg);

		/* Simpler background to avoid heavy nested card appearance */
		background: linear-gradient(
			135deg,
			rgba(var(--color-surface-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 100%
		);
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	.related-item:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
		background: linear-gradient(
			135deg,
			rgba(var(--color-surface-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 100%
		);
	}

	.related-date {
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.5px;
		color: var(--color-text-muted);
		text-transform: uppercase;
		margin-bottom: var(--space-xs);
	}

	.related-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-snug);
		font-family: var(--font-family-serif);
		color: var(--color-text-emphasis);
		margin: 0;
		margin-bottom: var(--space-xs);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.related-item:hover .related-title {
		color: var(--color-primary);
	}

	.related-authors {
		color: var(--color-text-light);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
	}

	/* Enhanced focus accessibility */
	.related-item:focus-visible {
		outline: 2px solid var(--color-highlight);
		outline-offset: 3px;
		box-shadow:
			var(--shadow-md),
			0 0 0 4px rgba(var(--color-highlight-rgb), 0.2);
	}

	/* Dark mode refinements */
	:global(html.dark) .related-item {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-medium)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-very-low));
	}

	:global(html.dark) .related-item:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb), var(--opacity-medium-high)) 0%,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 100%
		);
	}

	/* Responsive tweaks */
	@media (max-width: 640px) {
		.related-title {
			font-size: var(--font-size-base);
		}
		.related-item {
			padding: var(--space-sm);
		}
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.related-item,
		.related-title {
			transition: none;
		}
		.related-item:hover {
			transform: none;
		}
	}
</style>
