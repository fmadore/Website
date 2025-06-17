<script lang="ts">
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
		children: any;
	} = $props();

	// Combine classes based on variant and additional classes
	const baseClasses = 'content-body';
	const variantClasses = {
		default: 'content-body--default',
		compact: 'content-body--compact', 
		wide: 'content-body--wide'
	};
	
	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${glassEffect} ${additionalClasses}`.trim();
</script>

<div class={combinedClasses} use:scrollAnimate={{ delay: DELAY_STEP * 9, animationClass: 'fade-in-up' }}>
	{@render children()}
</div>

<style>
	/* Base content body styling */
	.content-body {
		padding: var(--spacing-8);
		border-radius: var(--border-radius-lg);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
		margin-bottom: var(--spacing-8);
	}

	.content-body--compact {
		padding: var(--spacing-6);
		margin-bottom: var(--spacing-6);
	}

	.content-body--wide {
		padding: var(--spacing-10);
		margin-bottom: var(--spacing-10);
	}

	/* Typography styling for content within the body */
	.content-body :global(p) {
		margin-bottom: var(--spacing-6);
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
		transition: color 0.2s ease;
	}

	.content-body :global(a:hover) {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* External link indicator */
	.content-body :global(a[target='_blank']:after) {
		content: '↗';
		font-size: var(--font-size-sm);
		margin-left: var(--spacing-1);
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
		padding-left: var(--spacing-6);
		border-left: 3px solid transparent;
		border-image: linear-gradient(180deg, 
			var(--color-highlight) 0%, 
			var(--color-accent) 100%
		) 1;
		border-image-slice: 1;
	}

	/* Headings within content */
	.content-body :global(h2) {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-4);
		margin-top: var(--spacing-8);
		color: var(--color-text-emphasis);
		font-family: var(--font-family-serif);
	}

	.content-body :global(h2:first-child) {
		margin-top: 0;
	}

	.content-body :global(h3) {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-3);
		margin-top: var(--spacing-6);
		color: var(--color-text-emphasis);
		font-family: var(--font-family-serif);
	}

	.content-body :global(h3:first-child) {
		margin-top: 0;
	}

	/* Lists within content */
	.content-body :global(ul),
	.content-body :global(ol) {
		margin-bottom: var(--spacing-6);
		padding-left: var(--spacing-6);
	}

	.content-body :global(li) {
		margin-bottom: var(--spacing-2);
		line-height: var(--line-height-relaxed);
	}

	/* Blockquotes */
	.content-body :global(blockquote) {
		border-left: var(--border-width-thick) solid var(--color-primary);
		padding-left: var(--spacing-4);
		margin: var(--spacing-6) 0;
		font-style: italic;
		color: var(--color-text-light);
		background: rgba(var(--color-primary-rgb), var(--opacity-low));
		padding: var(--spacing-4);
		border-radius: var(--border-radius);
	}

	/* Code styling */
	.content-body :global(code) {
		background: var(--color-code-bg);
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-sm);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
	}

	.content-body :global(pre) {
		background: var(--color-code-bg);
		padding: var(--spacing-4);
		border-radius: var(--border-radius);
		overflow-x: auto;
		margin: var(--spacing-6) 0;
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
		margin: var(--spacing-6) 0;
	}

	/* Enhanced focus states for accessibility */
	.content-body :global(a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--spacing-1);
		box-shadow: 0 0 0 var(--border-width-thick) rgba(var(--color-highlight-rgb), var(--opacity-medium-high));
		border-radius: var(--border-radius-sm);
	}

	/* Remove the problematic shimmer effect that's causing the wide overflow */

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.content-body {
			padding: var(--spacing-6);
		}

		.content-body--default {
			margin-bottom: var(--spacing-6);
		}

		.content-body--compact {
			padding: var(--spacing-4);
		}

		.content-body--wide {
			padding: var(--spacing-6);
		}

		.content-body :global(p:first-child) {
			font-size: var(--font-size-base);
			padding-left: var(--spacing-4);
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