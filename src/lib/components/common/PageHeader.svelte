<script lang="ts">
	import { resolve } from '$app/paths';
	import TagList from '$lib/components/molecules/TagList.svelte'; // Use the one from molecules

	let {
		title,
		backLinkHref = undefined,
		backLinkLabel = '← Back',
		date = undefined,
		tags = undefined,
		typeBadgeText = undefined, // e.g., "Journal Article", "Conference Paper"
		authors = undefined,
		editors = undefined, // For publications
		additionalClasses = ''
	}: {
		title: string;
		backLinkHref?: string | undefined;
		backLinkLabel?: string;
		date?: string | undefined;
		tags?: string[] | undefined;
		typeBadgeText?: string | undefined;
		authors?: string[] | undefined;
		editors?: string | string[] | undefined;
		additionalClasses?: string;
	} = $props();

	// Helper function to format a list of names with "and" before the last one
	function formatNameList(names: string | string[] | undefined): string {
		if (!names) return '';
		if (typeof names === 'string') return names;
		if (names.length === 1) return names[0] ?? '';
		if (names.length === 2) return `${names[0]} and ${names[1]}`;
		return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
	}
</script>

<header class="page-header page-enter scroll-reveal mb-8 {additionalClasses}">
	{#if backLinkHref}
		<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic path resolved at runtime -->
		<a href={resolve(`/${backLinkHref}` as any)} class="back-link mb-4 inline-block">
			{backLinkLabel}
		</a>
	{/if}

	<div class="header-content">
		{#if typeBadgeText || date}
			<p class="header-eyebrow">
				{#if typeBadgeText}<span class="eyebrow-type">{typeBadgeText}</span>{/if}
				{#if typeBadgeText && date}<span class="eyebrow-separator" aria-hidden="true">·</span>{/if}
				{#if date}<span class="eyebrow-date">{date}</span>{/if}
			</p>
		{/if}

		<h1 class="page-title">{title}</h1>

		{#if authors && authors.length > 0}
			<div class="authors">
				{formatNameList(authors)}
			</div>
		{/if}

		{#if editors}
			<div class="editors">
				Edited by {formatNameList(editors)}
			</div>
		{/if}

		{#if tags && tags.length > 0}
			<div class="mt-4">
				<TagList {tags} />
			</div>
		{/if}
	</div>
</header>

<style>
	/*
	 * Editorial page header — content on paper, not a tile.
	 * The previous iteration wrapped every page title in a rounded warm-paper
	 * box (background + border + shadow). That read as "title in a card" —
	 * the templated-CMS gesture the brief argues against. Now the title sits
	 * directly on the page ground, hierarchy carried by the display serif and
	 * a single hairline rule underneath: a magazine headline, not a banner.
	 */
	.page-header {
		position: relative;
		padding-bottom: var(--space-lg);
		border-bottom: var(--border-width-thin) solid var(--color-border);
		margin-bottom: var(--space-xl);
	}

	.header-content {
		position: relative;
	}

	/* Eyebrow — type + date as one quiet letterspaced line above the title.
	 * Replaces the solid primary pill + bordered date chip: the rare brand
	 * accent now lives in type colour, not in button-like chrome. */
	.header-eyebrow {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: 0 0 var(--space-sm);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}

	.eyebrow-type {
		color: var(--color-accent);
	}

	.eyebrow-separator {
		color: var(--color-text-muted);
	}

	.eyebrow-date {
		color: var(--color-text-light);
	}

	.back-link {
		color: var(--color-text-light);
		text-decoration: none;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.back-link:hover {
		color: var(--color-accent);
	}

	.back-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
		border-radius: 0;
	}

	.page-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display);
		color: var(--color-text-emphasis);
		line-height: 1;
		font-weight: 820;
		letter-spacing: -0.015em;
		margin: 0;
		/* Mobile-first font size */
		font-size: var(--font-size-3xl);
		max-width: 20ch;
		text-wrap: balance;
	}

	/* Authors set in the editorial serif — a byline, not UI chrome. */
	.authors {
		font-family: var(--font-family-serif);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
		margin-top: var(--space-sm);
		font-size: var(--font-size-lg);
	}

	.editors {
		font-family: var(--font-family-serif);
		color: var(--color-text-soft);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		margin-top: var(--space-2xs);
	}

	@media (prefers-reduced-motion: reduce) {
		.back-link {
			transition: none;
		}
	}

	/* Desktop responsive design */
	@media (--sm) {
		.page-header {
			margin-bottom: var(--space-2xl);
		}

		.page-title {
			font-size: var(--font-size-4xl);
		}

		.authors {
			font-size: var(--font-size-xl);
		}
	}
</style>
