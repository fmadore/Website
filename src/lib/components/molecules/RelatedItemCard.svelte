<script lang="ts">
	// Expects the item object and the pre-calculated URL from RelatedItemsList
	// eslint-disable-next-line svelte/no-unused-props -- id is used for keying in parent components
	let {
		item,
		itemUrl,
		// Updated default classes to align with global glass card + typography system
		// Added scroll-reveal-scale for modern CSS scroll-driven animation
		cardClass = 'related-item glass-card p-4 focus-outline scroll-reveal-scale',
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

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- prop passthrough, caller responsible for resolving -->
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
	.related-item {
		position: relative;
		display: block;
		text-decoration: none;
		padding: var(--space-md);
		border-radius: var(--border-radius-lg);
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-moderate) var(--ease-spring),
			box-shadow var(--duration-moderate) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.related-item:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 20%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 6%, transparent);
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
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-1);
		box-shadow:
			var(--shadow-md),
			0 0 0 4px color-mix(in srgb, var(--color-highlight) 20%, transparent);
	}

	:global(html.dark) .related-item {
		background: var(--color-surface);
		border-color: var(--color-border);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .related-item:hover {
		border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
		box-shadow:
			0 12px 28px -8px color-mix(in srgb, var(--color-primary) 35%, transparent),
			0 4px 10px -4px color-mix(in srgb, var(--color-black) 40%, transparent);
	}

	/* Responsive tweaks */
	@media (--sm-down) {
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
			animation: none;
		}
		.related-item:hover {
			transform: none;
		}

		/* Ensure content is visible when animations are disabled */
		.related-item {
			opacity: 1;
			transform: none;
		}
	}
</style>
