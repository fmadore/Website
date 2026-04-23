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
	 * PageIntro is an intro-hero surface — keeps glass (per the roadmap's
	 * "glass for chrome and hero") but simplified to a single primary tint
	 * instead of the prior three-colour gradient. Featured variant adds a
	 * single left-accent stripe instead of a multi-hue top bar.
	 */
	/*
	 * Base page intro — warm tinted callout, paper not glass. backdrop-filter
	 * was removed in the Phase 5 glass-cleanup pass: a page intro is content,
	 * not sticky chrome, so blur added nothing but a recognisable AI-UI tell.
	 */
	.page-intro {
		font-size: var(--font-size-heading-5);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		margin-bottom: var(--space-lg);
		position: relative;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--border-radius-lg);
		background: color-mix(in srgb, var(--color-primary) 6%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-primary) 20%, transparent);
		box-shadow: var(--shadow-sm);
	}

	.page-intro--compact {
		font-size: var(--font-size-heading-6);
		margin-bottom: var(--space-md);
		padding: var(--space-sm) var(--space-lg);
	}

	/*
	 * Emphasized / featured variants carry more tinted background than the
	 * default intro. Previously used a thick primary left-stripe accent —
	 * removed (AI-UI tell). Depth now comes from the tint + full thin
	 * border + shadow, which read as a warm pull-quote surface.
	 */
	.page-intro--emphasized {
		font-size: var(--font-size-heading-3);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--space-xl);
		color: var(--color-text-emphasis);
		padding: var(--space-xl) var(--space-2xl);
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-primary) 25%, transparent);
		box-shadow: var(--shadow-md);
	}

	.page-intro--featured {
		font-size: var(--font-size-heading-3);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--space-xl);
		padding: var(--space-2xl);
		background: color-mix(in srgb, var(--color-primary) 12%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-primary) 30%, transparent);
		box-shadow: var(--shadow-lg);
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
		transition: all var(--duration-fast) var(--ease-in-out);
		position: relative;
	}

	.page-intro :global(a::after) {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 1px;
		background: var(--color-primary);
		transition: width var(--duration-moderate) var(--ease-in-out);
	}

	.page-intro :global(a:hover) {
		color: var(--color-primary-dark);
	}

	.page-intro :global(a:hover::after) {
		width: 100%;
	}

	.page-intro :global(a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-2xs);
		box-shadow: 0 0 0 var(--border-width-thick)
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-30) * 100%), transparent);
		border-radius: var(--border-radius-sm);
	}

	.page-intro :global(em) {
		font-style: italic;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	.page-intro :global(strong) {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
	}

	/*
	 * Dark-mode PageIntro — stronger primary tint so the hero surface reads
	 * as coloured rather than ghost-grey against the --color-background.
	 */
	:global(html.dark) .page-intro {
		background: color-mix(in srgb, var(--color-primary) 18%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 35%, transparent);
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .page-intro--emphasized {
		background: color-mix(in srgb, var(--color-primary) 22%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 45%, transparent);
	}

	:global(html.dark) .page-intro--featured {
		background: color-mix(in srgb, var(--color-primary) 26%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .page-intro :global(a) {
		color: var(--color-primary);
	}

	:global(html.dark) .page-intro :global(a:hover) {
		color: var(--color-highlight);
	}

	/* Responsive design - mobile first, so this targets smaller screens */
	@media (--sm-down) {
		.page-intro {
			font-size: var(--font-size-heading-6);
			margin-bottom: var(--space-md);
			padding: var(--space-sm) var(--space-lg);
		}

		.page-intro--compact {
			font-size: var(--font-size-body);
			margin-bottom: var(--space-sm);
			padding: var(--space-2xs) var(--space-md);
		}

		.page-intro--emphasized {
			font-size: var(--font-size-heading-4);
			margin-bottom: var(--space-lg);
			padding: var(--space-md) var(--space-xl);
		}

		.page-intro--featured {
			font-size: var(--font-size-heading-4);
			margin-bottom: var(--space-lg);
			padding: var(--space-md) var(--space-xl);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.page-intro :global(a),
		.page-intro :global(a::after) {
			transition: none;
		}
	}
</style>
