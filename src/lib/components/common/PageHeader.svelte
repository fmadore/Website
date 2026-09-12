<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatByline } from '$lib/utils/byline';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
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
		tier = 'record',
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
		/**
		 * Which masthead tier this page opens on.
		 *
		 * `record` (the default) is the detail-page head every existing consumer
		 * gets: the 4xl title on the wide display axis, closed by a hairline box
		 * edge. `index` is the section-index masthead — the shared
		 * `.index-masthead` rule and `.index-title` of `ink-signal.css`, the same
		 * one /publications, /activities and /digital-humanities set directly. A
		 * section index and its own sub-pages are meant to fork here: the rule
		 * above says which of the two a reader is on before they read a word.
		 */
		tier?: 'record' | 'index';
		additionalClasses?: string;
	} = $props();

	// The masthead title — the one string every detail route funnels through here.
	const displayTitle = $derived(typesetQuotes(title));
	const isIndex = $derived(tier === 'index');
</script>

<header
	class="page-header mb-8 {additionalClasses}"
	class:page-header--index={isIndex}
	class:index-masthead={isIndex}
>
	{#if backLinkHref}
		<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic path resolved at runtime -->
		<a href={resolve(`/${backLinkHref}` as any)} class="back-link mb-4 inline-block"
			><span aria-hidden="true">← </span>{backLinkLabel.replace(/^←s*/, '')}</a
		>
	{/if}

	<div class="header-content">
		{#if typeBadgeText || date}
			<p class="header-eyebrow">
				{#if typeBadgeText}<span class="eyebrow-type">{typeBadgeText}</span>{/if}
				{#if typeBadgeText && date}<span class="eyebrow-separator" aria-hidden="true">·</span>{/if}
				{#if date}<span class="eyebrow-date">{date}</span>{/if}
			</p>
		{/if}

		<!-- One title, two tiers. The classes are exclusive rather than layered:
		     a scoped `.page-title` selector outranks the global `.index-title`
		     by a class, so keeping both would silently leave the index masthead
		     at the record tier's size. -->
		<h1 class:page-title={!isIndex} class:index-title={isIndex}>{displayTitle}</h1>

		{#if authors && authors.length > 0}
			<div class="authors">
				{formatByline(authors)}
			</div>
		{/if}

		{#if editors}
			<div class="editors">
				Edited by {formatByline(editors)}
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
		/* A separator, so it takes the rule pair, not the box-edge pair. */
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
		margin-bottom: var(--space-xl);
	}

	/* The section-index tier. The masthead rule above the header — drawn by the
	 * global `.index-masthead` — is what closes this module off from the page
	 * above it, so the box edge underneath goes: two boundaries around one head
	 * is the templated-CMS "title in a panel" the record tier already retired,
	 * and the rule is the heavier, more legible of the two. The record tier is
	 * untouched; the ten pages that never opt in look exactly as they did. */
	.page-header--index {
		padding-bottom: 0;
		border-bottom: 0;
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
		letter-spacing: var(--tracking-eyebrow);
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
		letter-spacing: var(--tracking-label);
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
		letter-spacing: var(--tracking-display);
		margin: 0;
		/* Mobile-first font size */
		font-size: var(--font-size-3xl);
		/* The display-face cap: a headline is sized for its shape, not for the
		 * reading measure. The role is documented in `variables.css`. */
		max-width: var(--measure-title);
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

	/* Below 375px the longest record titles break mid-word: "Visualisations"
	 * sets 299px into 264px at 320. One step down the scale clears it (238px)
	 * and nothing moves at 375 and up. */
	@media (--2xs-down) {
		.page-title {
			font-size: var(--font-size-2xl);
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
