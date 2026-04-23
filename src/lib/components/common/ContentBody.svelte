<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		glassEffect = 'none',
		additionalClasses = '',
		children
	}: {
		variant?: 'default' | 'compact' | 'wide';
		/**
		 * Default is 'none' — prose sits directly on the warm paper page
		 * background, editorial-essay style. Callers that want a framed
		 * card (e.g., a dense data panel, a CTA box) can opt in explicitly.
		 * Rationale: content prose reads better on paper than card-in-card.
		 */
		glassEffect?: 'glass-card' | 'glass-panel' | 'glass-medium' | 'glass-light' | 'none';
		additionalClasses?: string;
		children: Snippet;
	} = $props();

	// Combine classes based on variant and additional classes
	const baseClasses = 'content-body scroll-reveal';
	const variantClasses = {
		default: 'content-body--default',
		compact: 'content-body--compact',
		wide: 'content-body--wide'
	};

	const combinedClasses = $derived(
		`${baseClasses} ${variantClasses[variant]} ${glassEffect === 'none' ? '' : glassEffect} ${additionalClasses}`
			.replace(/\s+/g, ' ')
			.trim()
	);
</script>

<div class={combinedClasses}>
	{@render children()}
</div>

<style>
	/* Base content body styling - uses glassmorphism utilities */
	.content-body {
		padding: var(--space-lg);
		border-radius: var(--border-radius-lg);
		transition: all var(--duration-moderate) var(--ease-in-out);
		position: relative;
		/* Glassmorphism applied via utility classes in template */
	}

	/*
	 * Reading rhythm: detail pages need vertical breathing room between
	 * sections. --space-reading is ~1.5× line-height for the body.
	 */
	.content-body--default {
		margin-bottom: var(--space-reading);
	}

	.content-body--compact {
		padding: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.content-body--wide {
		padding: var(--space-lg);
		margin-bottom: var(--space-reading-loose);
	}

	/* Typography styling for content within the body */
	.content-body :global(p) {
		margin-bottom: var(--space-md);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
	}

	.content-body :global(p:last-child) {
		margin-bottom: 0;
	}

	/* Link styling within content */
	.content-body :global(a) {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color var(--duration-fast) var(--ease-in-out);
	}

	.content-body :global(a:hover) {
		color: var(--color-primary-dark);
	}

	/* Emphasis styling */
	.content-body :global(em) {
		font-style: italic;
	}

	.content-body :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/*
	 * Lead paragraph — direct-child p:first-child only. Editorial treatment:
	 * slightly larger type and full-contrast ink. Previously carried a
	 * gradient left-stripe (border-image), removed as part of the Phase 2/3
	 * visual scrub — stripe-accent on prose is an AI-UI tell.
	 */
	.content-body > :global(p:first-child) {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-relaxed);
	}

	/* Reset styling for paragraphs inside blockquotes */
	.content-body :global(blockquote p) {
		color: inherit;
	}

	/*
	 * Blockquote callout within a content body — scoped override that turns
	 * the global blockquote into a full paper-callout (warm primary wash,
	 * thin border, rounded). No stripe.
	 */
	.content-body :global(blockquote) {
		margin: var(--space-lg) 0;
		padding: var(--space-lg);
		background: color-mix(in srgb, var(--color-primary) calc(var(--opacity-5) * 100%), transparent);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-10) * 100%), transparent);
		border-radius: var(--border-radius-lg);
	}

	/* Headings within content */
	.content-body :global(h2) {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--space-md);
		margin-top: var(--space-xl);
		color: var(--color-text-emphasis);
		font-family: var(--font-family-serif);
	}

	.content-body :global(h2:first-child) {
		margin-top: 0;
	}

	.content-body :global(h3) {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--space-sm);
		margin-top: var(--space-lg);
		color: var(--color-text-emphasis);
		font-family: var(--font-family-serif);
	}

	.content-body :global(h3:first-child) {
		margin-top: 0;
	}

	/* Lists within content */
	.content-body :global(ul),
	.content-body :global(ol) {
		margin-bottom: var(--space-lg);
		padding-left: var(--space-lg);
	}

	.content-body :global(li) {
		margin-bottom: var(--space-xs);
		line-height: var(--line-height-relaxed);
	}

	/* Blockquotes - inherits from global typography.css */

	/* Code styling */
	.content-body :global(code) {
		background: var(--color-code-bg);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
	}

	.content-body :global(pre) {
		background: var(--color-code-bg);
		padding: var(--space-md);
		border-radius: var(--border-radius);
		overflow-x: auto;
		margin: var(--space-lg) 0;
	}

	.content-body :global(pre code) {
		background: none;
		padding: 0;
	}

	/* Images within content */
	.content-body :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--border-radius);
		margin: var(--space-lg) 0;
	}

	/* Enhanced focus states for accessibility */
	.content-body :global(a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-2xs);
		box-shadow: 0 0 0 var(--border-width-thick)
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-30) * 100%), transparent);
		border-radius: var(--border-radius-sm);
	}

	/* Responsive adjustments */
	@media (--sm) {
		.content-body {
			padding: var(--space-xl);
		}

		.content-body--default {
			margin-bottom: var(--space-xl);
		}

		.content-body--compact {
			padding: var(--space-lg);
		}

		.content-body--wide {
			padding: var(--space-xl-tight);
		}

		.content-body :global(p:first-child) {
			font-size: var(--font-size-xl);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.content-body {
			transition: none;
		}
	}

	/* Dark mode adjustments are handled automatically through CSS variables and glassmorphism utilities */
</style>
