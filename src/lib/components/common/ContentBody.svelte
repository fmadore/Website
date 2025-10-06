<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { DELAY_STEP } from '$lib/utils/animationConstants';

	let {
		variant = 'default',
		glassEffect = 'glass-card',
		additionalClasses = '',
		children
	}: {
		variant?: 'default' | 'compact' | 'wide';
		glassEffect?: 'glass-card' | 'glass-panel' | 'glass-medium' | 'glass-light';
		additionalClasses?: string;
		children: Snippet;
	} = $props();

	// Combine classes based on variant and additional classes
	const baseClasses = 'content-body';
	const variantClasses = {
		default: 'content-body--default',
		compact: 'content-body--compact',
		wide: 'content-body--wide'
	};

	const combinedClasses =
		`${baseClasses} ${variantClasses[variant]} ${glassEffect} ${additionalClasses}`.trim();
</script>

<div
	class={combinedClasses}
	use:scrollAnimate={{ delay: DELAY_STEP * 9, animationClass: 'fade-in-up' }}
>
	{@render children()}
</div>

<style>
	/* Base content body styling */
	.content-body {
		padding: var(--space-xl);
		border-radius: var(--border-radius-lg);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		position: relative;
		/* Enhanced glassmorphism with subtle gradient overlay to match ProfileBanner */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-very-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Hover effects for glassmorphism */
	.content-body:hover {
		transform: var(--transform-lift-sm);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), var(--opacity-low)) 0%,
			rgba(var(--color-highlight-rgb), var(--opacity-very-low)) 50%,
			rgba(var(--color-accent-rgb), var(--opacity-very-low)) 100%
		);
	}

	/* Variant styles */
	.content-body--default {
		margin-bottom: var(--space-xl);
	}

	.content-body--compact {
		padding: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	.content-body--wide {
		padding: var(--space-xl-tight);
		margin-bottom: var(--space-xl-tight);
	}

	/* Typography styling for content within the body */
	.content-body :global(p) {
		margin-bottom: var(--space-lg);
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
		transition: color var(--anim-duration-fast) var(--anim-ease-base);
	}

	.content-body :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* External link indicator */
	.content-body :global(a[target='_blank']:after) {
		content: '↗';
		font-size: var(--font-size-sm);
		margin-left: var(--space-2xs);
		opacity: var(--opacity-high);
	}

	/* Emphasis styling */
	.content-body :global(em) {
		font-style: italic;
		font-weight: var(--font-weight-medium);
		color: var(--color-text-emphasis);
	}

	.content-body :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/* Lead paragraph styling */
	.content-body :global(p:first-child) {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-emphasis);
		position: relative;
		padding-left: var(--space-lg);
		border-left: var(--border-width-medium) solid transparent;
		border-image: linear-gradient(180deg, var(--color-highlight) 0%, var(--color-accent) 100%) 1;
		border-image-slice: 1;
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

	/* Blockquotes */
	.content-body :global(blockquote) {
		border-left: var(--border-width-thick) solid var(--color-primary);
		padding-left: var(--space-md);
		margin: var(--space-lg) 0;
		font-style: italic;
		color: var(--color-text-light);
		background: rgba(var(--color-primary-rgb), var(--opacity-low));
		padding: var(--space-md);
		border-radius: var(--border-radius);
	}

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
			rgba(var(--color-highlight-rgb), var(--opacity-medium-high));
		border-radius: var(--border-radius-sm);
	}

	/* Remove the problematic shimmer effect that's causing the wide overflow */

	/* Responsive adjustments */
	@media (max-width: var(--breakpoint-sm)) {
		.content-body {
			padding: var(--space-lg);
		}

		.content-body--default {
			margin-bottom: var(--space-lg);
		}

		.content-body--compact {
			padding: var(--space-md);
		}

		.content-body--wide {
			padding: var(--space-lg);
		}

		.content-body :global(p:first-child) {
			font-size: var(--font-size-base);
			padding-left: var(--space-md);
			border-left: var(--border-width-medium) solid transparent;
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.content-body {
			transition: none;
		}

		.content-body:hover {
			transform: none;
		}
	}

	/* Dark mode adjustments are handled automatically through CSS variables */
</style>
