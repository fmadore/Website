<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		variant = 'default',
		glassEffect = '',
		additionalClasses = ''
	}: {
		children: Snippet;
		variant?: 'default' | 'compact' | 'emphasized' | 'featured';
		glassEffect?: '' | 'glass-light' | 'glass-medium' | 'glass-panel-light';
		additionalClasses?: string;
	} = $props();

	// Combine classes based on variant, glass effect, and additional classes
	const baseClasses = 'page-intro scroll-reveal';
	const variantClasses = {
		default: 'page-intro--default',
		compact: 'page-intro--compact',
		emphasized: 'page-intro--emphasized',
		featured: 'page-intro--featured'
	};

	const combinedClasses = $derived(
		`${baseClasses} ${variantClasses[variant]} ${glassEffect} ${additionalClasses}`.trim()
	);
</script>

<div class={combinedClasses}>
	{@render children()}
</div>

<style>
	/*
	 * PageIntro — editorial standfirst, not a tinted callout box.
	 * Magazine convention: the deck below the headline is set larger than
	 * body copy, in the serif, in a softer ink — no background, no border,
	 * no shadow. The previous primary-tinted rounded tile made every list
	 * page open with "a sentence in a box"; this lets the type do the work
	 * (brief principle 1) and keeps content on paper (principle 3).
	 */
	.page-intro {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lead);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin-bottom: var(--space-xl);
		max-width: var(--text-max-width-reading);
	}

	.page-intro--compact {
		font-size: var(--font-size-lg);
		margin-bottom: var(--space-lg);
	}

	/* Emphasized / featured — same standfirst voice, one step louder.
	 * Differentiation through scale and ink, not through tinted boxes. */
	.page-intro--emphasized,
	.page-intro--featured {
		font-size: var(--font-size-xl);
		color: var(--color-text);
		margin-bottom: var(--space-2xl);
	}

	/* Typography enhancements */
	.page-intro :global(p) {
		margin: 0;
		line-height: inherit;
	}

	.page-intro :global(p + p) {
		margin-top: var(--space-md);
	}

	.page-intro :global(a) {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		padding-bottom: 2px;
		background-image: linear-gradient(90deg, var(--color-primary), var(--color-primary));
		background-size: 0% 1px;
		background-position: left bottom;
		background-repeat: no-repeat;
		transition:
			color var(--duration-moderate) var(--ease-in-out),
			background-size var(--duration-normal) var(--ease-out);
	}

	.page-intro :global(a:hover) {
		background-size: 100% 1px;
	}

	.page-intro :global(a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-2xs);
		border-radius: var(--border-radius-sm);
	}

	.page-intro :global(em) {
		font-style: italic;
	}

	.page-intro :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/* Dark mode — same standfirst, softer warm ink against slate. */
	:global(html.dark) .page-intro {
		color: var(--color-text-light);
	}

	:global(html.dark) .page-intro--emphasized,
	:global(html.dark) .page-intro--featured {
		color: var(--color-text);
	}

	/* Responsive design - mobile first, so this targets smaller screens */
	@media (--sm-down) {
		.page-intro {
			font-size: var(--font-size-lg);
			margin-bottom: var(--space-lg);
		}

		.page-intro--compact {
			font-size: var(--font-size-body);
			margin-bottom: var(--space-md);
		}

		.page-intro--emphasized,
		.page-intro--featured {
			font-size: var(--font-size-lg);
			margin-bottom: var(--space-lg);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.page-intro :global(a) {
			background-size: 100% 1px;
			transition: none;
		}
	}
</style>
