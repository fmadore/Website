<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		surface = 'none',
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
		surface?: 'surface-card' | 'surface-panel' | 'surface-medium' | 'surface-light' | 'none';
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
		`${baseClasses} ${variantClasses[variant]} ${surface === 'none' ? '' : surface} ${additionalClasses}`
			.replace(/\s+/g, ' ')
			.trim()
	);
</script>

<div class={combinedClasses}>
	{@render children()}
</div>

<style>
	/* A prose wrapper, not a card: no surface, no radius, no chrome. Prose sits
	 * on the warm paper page; the padding only sets the reading measure. */
	.content-body {
		padding: var(--space-lg);
		border-radius: 0;
		position: relative;
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

	/* Prose links — the accent, marked with a pine underline (matching
	 * the inline-citation idiom), not a bare coloured word. */
	.content-body :global(a) {
		color: var(--color-accent);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
		text-decoration-thickness: var(--border-width-thin);
		text-underline-offset: 0.16em;
		transition:
			color var(--duration-fast) var(--ease-out),
			text-decoration-color var(--duration-fast) var(--ease-out);
	}

	.content-body :global(a:hover) {
		color: var(--color-accent-dark);
		text-decoration-color: var(--color-accent);
	}

	/* Emphasis styling */
	.content-body :global(em) {
		font-style: italic;
	}

	/* A title/emphasis inside a display heading stays in the display voice,
	 * upright — a serif italic bolted into an Archivo head reads as a voice
	 * collision. Specificity (0,1,2) beats the base `em` serif-italic and the
	 * `.content-body em` italic above. */
	.content-body :global(:is(h1, h2, h3) :is(em, i, cite)) {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-style: normal;
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
	 * Blockquote — a pulled passage set off by hairline rules top and bottom and
	 * a serif-italic voice, indented as a block. No tinted box, no side stripe
	 * (the brief bans left-stripe accents); the rules read as letterpress.
	 */
	.content-body :global(blockquote) {
		margin: var(--space-xl) 0;
		padding: var(--space-md) var(--space-lg);
		background: transparent;
		border: none;
		border-top: var(--rule-hairline) solid var(--color-border);
		border-bottom: var(--rule-hairline) solid var(--color-border);
		border-radius: 0;
		font-style: italic;
		color: var(--color-text-soft);
	}

	/* Headings within content — the DISPLAY voice (Archivo), matching the
	 * site's §-section titles. h1–h3 are display; blurring them to serif is the
	 * one thing the two-voice system forbids. */
	.content-body :global(h2) {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-2xl);
		font-weight: 750;
		letter-spacing: -0.01em;
		line-height: 1.05;
		margin-bottom: var(--space-md);
		margin-top: var(--space-xl);
		color: var(--color-text-emphasis);
	}

	.content-body :global(h2:first-child) {
		margin-top: 0;
	}

	.content-body :global(h3) {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-xl);
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.1;
		margin-bottom: var(--space-sm);
		margin-top: var(--space-lg);
		color: var(--color-text-emphasis);
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

	/* Code styling — square, flat. */
	.content-body :global(code) {
		background: var(--color-code-bg);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-sm);
	}

	.content-body :global(pre) {
		background: var(--color-code-bg);
		padding: var(--space-md);
		border-radius: 0;
		overflow-x: auto;
		margin: var(--space-lg) 0;
	}

	.content-body :global(pre code) {
		background: none;
		padding: 0;
	}

	/* Images within content — plates: square, a single hairline frame. */
	.content-body :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0;
		border: var(--border-width-thin) solid var(--color-border);
		margin: var(--space-lg) 0;
	}

	/* Focus — a flat accent outline, no shadow bloom. */
	.content-body :global(a:focus-visible) {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
		border-radius: 0;
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

	/* Dark mode adjustments are handled automatically through CSS variables and the flat surface utilities */
</style>
