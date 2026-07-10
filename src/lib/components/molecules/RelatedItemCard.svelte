<script lang="ts">
	// Expects the item object and the pre-calculated URL from RelatedItemsList
	// eslint-disable-next-line svelte/no-unused-props -- id is used for keying in parent components
	let {
		item,
		itemUrl,
		// Updated default classes to align with the global surface card + typography system
		// Added scroll-reveal-scale for modern CSS scroll-driven animation
		cardClass = 'related-item p-4 focus-outline scroll-reveal-scale',
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
	/* A flat paper tile — square corners, single hairline frame, no shadow.
	 * The grid needs a bounded card; the record inside reads in two voices:
	 * a mono dateline key over a serif title. Hover warms the border only. */
	.related-item {
		position: relative;
		display: block;
		text-decoration: none;
		padding: var(--space-md);
		border-radius: 0;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.related-item:hover {
		border-color: var(--color-accent);
	}

	/* Dateline — the DATA voice: mono, letterspaced caps, faint ink. */
	.related-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		color: var(--color-text-light);
		text-transform: uppercase;
		margin-bottom: var(--space-2);
	}

	/* Title — the DOCUMENT voice: Newsreader serif. */
	.related-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-snug);
		color: var(--color-text-emphasis);
		margin: 0;
		margin-bottom: var(--space-xs);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.related-item:hover .related-title {
		color: var(--color-accent);
	}

	.related-authors {
		font-family: var(--font-family-serif);
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}

	/* Focus — a flat accent outline, no shadow bloom. */
	.related-item:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
	}

	:global(html.dark) .related-item {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark) .related-item:hover {
		border-color: var(--color-accent);
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

		/* Ensure content is visible when animations are disabled */
		.related-item {
			opacity: 1;
			transform: none;
		}
	}
</style>
