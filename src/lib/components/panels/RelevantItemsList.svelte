<script module lang="ts">
	// Define a generic item type structure that includes properties from both publications and communications
	export type RelevantItem = {
		id: string;
		project?: string; // Project might not always be directly on the item if filtered beforehand
		type: string;
		date: string;
		dateISO: string; // Needed for sorting
		title: string;
		authors: string[];
		abstract?: string;
	};
</script>

<script lang="ts">
	import { type Snippet } from 'svelte';
	import { base, resolve } from '$app/paths';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import { PANEL_EXCERPT_LENGTH } from '$lib/data/publications/summaryConfig';
	import PanelBase from './PanelBase.svelte';
	import Button from '../atoms/Button.svelte';

	// Props
	let {
		title,
		items,
		collectionLabel,
		emptyLabel,
		basePath,
		viewAllPath,
		projectName,
		formatType,
		formatAuthors,
		filters
	}: {
		title: string; // e.g., "Related publications", "Related talks & events"
		items: RelevantItem[];
		/** Reader-facing plural for the link, e.g. "publications", "talks & events". */
		collectionLabel: string;
		/** Same set in a negative sentence, e.g. "publications", "talks or events". */
		emptyLabel: string;
		basePath: string; // Base path for individual item links e.g., "/publications", "/communications"
		viewAllPath: string; // Path for the "View all" link e.g., "/publications", "/conference-activity"
		projectName?: string; // Project name to use as a filter parameter
		formatType: (type: string) => string;
		formatAuthors: (authors: string[]) => string;
		filters?: Snippet;
	} = $props();

	// Construct the view all URL with project filter if projectName is provided
	const viewAllUrl = $derived(
		projectName
			? `${base}${viewAllPath}?project=${encodeURIComponent(projectName)}`
			: `${base}${viewAllPath}`
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const itemHref = (id: string) => resolve(`${basePath}/${id}` as any);

	/**
	 * The panel's own cut of an already-cut excerpt, at the last whole word
	 * before the limit. The hard cut this replaces ended rows mid-word
	 * ("d'Abome...") and closed them with three ASCII dots.
	 */
	function panelExcerpt(text: string): string {
		if (text.length <= PANEL_EXCERPT_LENGTH) return text;
		const cut = text.slice(0, PANEL_EXCERPT_LENGTH);
		const lastSpace = cut.lastIndexOf(' ');
		return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, '') + '…';
	}
</script>

{#snippet headerContent()}
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
		<h2 class="panel-title mb-0">{title}</h2>
		{#if filters}
			<div class="filters-wrapper">
				{@render filters()}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet panelContent()}
	{#if items.length === 0}
		<p class="no-items">No {emptyLabel} are filed under this project.</p>
	{:else}
		<!-- Dated, keyed records, so: the ledger. These used to be bordered cards
		     at 277–306px each (2,606px for nine at 1440), each carrying two links
		     to the same record; the same record is a 147px row on /publications and
		     an 84px row in the home page's own activity ledger. The whole row is
		     the one anchor, which is what retired the `View record →` action. -->
		<ol class="ledger ledger--ruled relevant-ledger">
			{#each items as item (item.id)}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
					<a class="ledger-row relevant-row" href={itemHref(item.id)}>
						<span class="ledger-key">
							<span>{item.date}</span>
							{#if item.type}
								<span class="ledger-status">{formatType(item.type)}</span>
							{/if}
						</span>
						<span class="ledger-content">
							<span class="ledger-title relevant-title">{typesetQuotes(item.title)}</span>
							{#if item.authors && item.authors.length > 0}
								<span class="relevant-byline">{typesetQuotes(formatAuthors(item.authors))}</span>
							{/if}
							{#if item.abstract}
								<span class="ledger-desc">{typesetQuotes(panelExcerpt(item.abstract))}</span>
							{/if}
						</span>
					</a>
				</li>
			{/each}
		</ol>

		<div class="view-all-container">
			<Button
				href={viewAllUrl}
				rel={projectName ? 'nofollow' : undefined}
				variant="outline-secondary"
				size="base"
			>
				All {collectionLabel} in this project<span aria-hidden="true">&nbsp;→</span>
			</Button>
		</div>
	{/if}
{/snippet}

<PanelBase {title} variant="items" header={headerContent} content={panelContent} />

<style>
	.relevant-ledger {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* The row is the anchor, so it owns its own link language: no prose underline,
	 * ink at rest, the title warming to pine under the pointer or focus. */
	.relevant-row {
		text-decoration: none;
		color: inherit;
	}

	.relevant-row:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-1);
	}

	/* One step below the reading column beside it: the panel is apparatus
	 * pointing at the record, not a second reading column. */
	.relevant-title {
		font-size: var(--font-size-lg);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.relevant-row:hover .relevant-title {
		color: var(--color-accent);
	}

	/* Same reason as the title: the excerpt is apparatus beside a reading column,
	 * so it sets at the note size the retired card used rather than at the
	 * idiom's reading size. */
	.relevant-row :global(.ledger-desc) {
		font-size: var(--font-size-sm);
	}

	/* Byline — the document voice, one step under the title, as on a
	 * bibliography row (`.bib-byline`). */
	.relevant-byline {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		font-style: italic;
		line-height: var(--line-height-snug);
		color: var(--color-text-light);
	}

	@media (--sm-down) {
		.relevant-title {
			font-size: var(--font-size-base);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.relevant-title {
			transition: none;
		}
	}
</style>
