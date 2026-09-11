<script lang="ts">
	import { resolve } from '$app/paths';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import type { RelevantItem } from '$lib/components/panels/RelevantItemsList.svelte';

	// Props - same interface as the old ItemCard for compatibility
	let {
		item,
		basePath,
		formatType,
		formatAuthors
	}: {
		item: RelevantItem;
		basePath: string; // Base path for the item detail link
		formatType: (type: string) => string;
		formatAuthors: (authors: string[]) => string;
	} = $props();

	// Construct the link URL
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let itemLink = $derived(resolve(`${basePath}/${item.id}` as any));
</script>

<div class="relevant-item">
	<div class="relevant-item-meta">
		{#if item.type}
			<span class="relevant-item-type">{formatType(item.type)}</span>
		{/if}
		<span class="relevant-item-date">{item.date}</span>
	</div>

	<h3 class="relevant-item-title">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
		<a href={itemLink}>{typesetQuotes(item.title)}</a>
	</h3>

	{#if item.authors && item.authors.length > 0}
		<div class="relevant-item-authors">
			{typesetQuotes(formatAuthors(item.authors))}
		</div>
	{/if}

	{#if item.abstract}
		<div class="relevant-item-abstract">
			{typesetQuotes(
				item.abstract.length > 120 ? item.abstract.substring(0, 120) + '...' : item.abstract
			)}
		</div>
	{/if}

	<div class="relevant-item-action">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
		<a href={itemLink} class="relevant-item-link">View record <span aria-hidden="true">→</span></a>
	</div>
</div>

<style>
	/* Reading-surface tile: flat paper, 1px border, square corners, no shadow.
	 * The border warms to pine only under the pointer — interaction feedback,
	 * the one accent a standing card may carry. Formerly the global
	 * `.card-accent-border` in cards.css, whose only consumer this was. */
	.relevant-item {
		padding: var(--space-lg);
		border-radius: 0;
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		box-shadow: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.relevant-item:hover {
		border-color: var(--color-accent);
	}

	/* Meta line — the DATA voice: a mono type "kind" marker and a mono dateline,
	 * hairline-ruled beneath, the way a finding-aid entry is headed. */
	.relevant-item-meta {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
	}

	/* Type — a mono "kind" marker, no pill, no fill. Quiet ink, not pine: a
	 * record's kind is a permanent fact about it, never "the current thing",
	 * and a panel of twelve cards printed it twelve times. */
	.relevant-item-type {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-label);
		color: var(--color-text-muted);
	}

	.relevant-item-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
		color: var(--color-text-light);
		min-width: 0;
		line-height: var(--line-height-snug);
	}

	/* Title — the DOCUMENT voice: Newsreader serif. */
	.relevant-item-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-medium);
		margin: 0 0 var(--space-2) 0;
		line-height: var(--line-height-snug);
	}

	.relevant-item-title a {
		color: var(--color-text-emphasis);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.relevant-item-title a:hover {
		color: var(--color-accent);
	}

	.relevant-item-authors {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		font-style: italic;
		margin-bottom: var(--space-2);
		line-height: var(--line-height-relaxed);
	}

	.relevant-item-abstract {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--space-3);
	}

	.relevant-item-action {
		margin-top: auto;
	}

	/* Action — a mono-caps link in the data voice. Ink at rest, pine only under
	 * the pointer or focus: every card in the panel carries one, so at rest it
	 * is a repeated affordance, not the current thing. */
	.relevant-item-link {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-emphasis);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}

	.relevant-item-link:hover,
	.relevant-item-link:focus-visible {
		color: var(--color-accent);
	}

	/* Responsive design */
	@media (--sm-down) {
		.relevant-item-title {
			font-size: var(--font-size-base);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.relevant-item,
		.relevant-item-title a,
		.relevant-item-link {
			transition: none !important;
		}
	}
</style>
