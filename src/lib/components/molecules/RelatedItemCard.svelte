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
	/* Enhanced related publication card styling aligned with sophisticated glassmorphism design */
	.related-item {
		position: relative;
		display: block;
		text-decoration: none;
		padding: var(--spacing-5);
		border-radius: var(--border-radius-lg);

		/* Enhanced glassmorphism for individual cards matching CitedBy cards */
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.03) 0%,
			rgba(var(--color-primary-rgb), 0.02) 50%,
			rgba(var(--color-highlight-rgb), 0.015) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), var(--opacity-low, 0.08));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.related-item:hover {
		transform: var(--transform-lift-sm, translateY(-2px));
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.05) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-highlight-rgb), 0.025) 100%
		);
		box-shadow: var(--shadow-md);
	}

	/* Subtle inner highlight for depth */
	.related-item::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		background: linear-gradient(
			180deg,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.08) 0%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 40%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 60%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.08) 100%
		);
		mix-blend-mode: overlay;
		opacity: 0.3;
	}

	.related-date {
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.5px;
		color: var(--color-text-muted);
		text-transform: uppercase;
		margin-bottom: var(--spacing-2);
	}

	.related-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-snug);
		font-family: var(--font-family-serif);
		color: var(--color-text-emphasis);
		margin: 0;
		margin-bottom: var(--spacing-2);
		transition: color var(--anim-duration-fast, 0.2s) var(--anim-ease-out, ease);
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
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.4) 0%,
			rgba(var(--color-accent-rgb), 0.08) 50%,
			rgba(var(--color-primary-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.06);
	}

	:global(html.dark) .related-item:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.5) 0%,
			rgba(var(--color-accent-rgb), 0.12) 50%,
			rgba(var(--color-primary-rgb), 0.08) 100%
		);
	}

	/* Responsive tweaks */
	@media (max-width: 640px) {
		.related-title {
			font-size: var(--font-size-base);
		}
		.related-item {
			padding: var(--spacing-3);
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
