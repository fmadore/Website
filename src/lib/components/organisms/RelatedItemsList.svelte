<!--
RelatedItemsList — "More in this project", the sibling work that closes a record.

A list of dated records, so it is a ledger (DESIGN.md, principle 3): the date
hangs in the mono key column, the title is the serif content and the link, the
byline sits under it. It used to be a grid of bordered tiles, three across,
where a long title ran to eight lines in a third of the column.

The rows arrive cut and capped: `relatedItems()` in `#lib/server/relatedItems.ts`
filters to the project, drops the current record and keeps three, so nothing is
filtered here. Rows render at once — no entrance transition (the motion rule).
-->
<script module lang="ts">
	/** One sibling record, as the server load projects it. */
	export interface RelatedRecord {
		id: string;
		title?: string;
		date?: string;
		authors?: string[];
		/** BCP-47 `lang` for a non-English title (`titleLangAttr`); omitted for English. */
		titleLang?: string;
	}
</script>

<script lang="ts">
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';

	interface Props {
		items: RelatedRecord[];
		/** Section heading. */
		title: string;
		/** Id for the heading, which names the section. */
		headingId: string;
		/** Record URL prefix, base-prefixed by the caller (`pageHref('/publications/')`). */
		baseItemUrl: string;
		/** The index page; with `project`, filtered to it. */
		viewAllUrl?: string;
		/** Project name the index link filters on. */
		project?: string;
	}

	let { items, title, headingId, baseItemUrl, viewAllUrl, project }: Props = $props();

	const viewAllLink = $derived(
		viewAllUrl && project ? `${viewAllUrl}?project=${encodeURIComponent(project)}` : viewAllUrl
	);
</script>

{#if items.length > 0}
	<section class="section section--flush related" aria-labelledby={headingId}>
		<div class="section-head">
			<h2 id={headingId} class="section-title">{title}</h2>
		</div>
		<ul class="ledger ledger--ruled related-ledger">
			{#each items as item (item.id)}
				<li class="ledger-row">
					<span class="ledger-key">{item.date ?? ''}</span>
					<span class="ledger-content">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- base-prefixed by the caller -->
						<a class="ledger-title related-item" href="{baseItemUrl}{item.id}" lang={item.titleLang}
							>{typesetQuotes(item.title ?? item.id)}</a
						>
						{#if item.authors && item.authors.length > 0}
							<span class="related-authors">{typesetQuotes(item.authors.join(', '))}</span>
						{/if}
					</span>
				</li>
			{/each}
		</ul>

		{#if viewAllLink}
			<!-- eslint-disable svelte/no-navigation-without-resolve -- base-prefixed by the caller -->
			<a
				class="ledger-action ledger-action--standalone related-all"
				href={viewAllLink}
				rel={project ? 'nofollow' : undefined}
				>All work in this project<span aria-hidden="true">&nbsp;→</span></a
			>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		{/if}
	</section>
{/if}

<style>
	/* A list reset only: the ledger idiom draws the rows. */
	.related-ledger {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* The title is the row's link. Quiet ink at rest with the pine underline
	   only under the pointer, as the contents ledger sets its links: three
	   stacked accent underlines would stripe the block in pine. One step under
	   the ledger's xl, because this is sibling work closing the page, not the
	   record itself. */
	.related-item {
		font-size: var(--font-size-lg);
		text-decoration: none;
		overflow-wrap: break-word;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.related-item:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-decoration-thickness: var(--rule-hairline);
		text-underline-offset: 0.2em;
	}

	.related-item:focus-visible {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-offset);
	}

	/* A title link is a standalone control, not a link inside running text, so
	   under a coarse pointer it takes the 44px floor (the Touch Floor Rule).
	   A title of two lines or more is taller than that already. */
	@media (--touch) {
		.related-item {
			display: block;
			min-height: 44px;
		}
	}

	.related-authors {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-normal);
		color: var(--color-text-light);
	}

	/* The index link is a control; on paper the rows stand alone. */
	@media print {
		.related-all {
			display: none;
		}

		.related-ledger .ledger-row {
			break-inside: avoid;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.related-item {
			transition: none;
		}
	}
</style>
