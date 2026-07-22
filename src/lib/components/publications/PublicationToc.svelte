<!--
PublicationToc - Table of contents for edited volumes / special issues

Renders the "Table of Contents" ruled section of /publications/[id] as a
two-column ledger of numbered entries. Only books and special issues that
actually carry a tableOfContents render anything — everything else emits
nothing.
-->
<script lang="ts">
	import type { Publication } from '$lib/types';

	interface Props {
		publication: Publication;
	}

	let { publication }: Props = $props();

	// Table of contents — only for edited volumes / special issues that carry it.
	const tocEntries = $derived(
		(publication.type === 'book' || publication.type === 'special-issue') &&
			publication.tableOfContents &&
			publication.tableOfContents.length > 0
			? publication.tableOfContents
			: []
	);

	// "A, B and C" — same casting as the page byline.
	function formatNameList(names: string[] | undefined): string {
		if (!names || names.length === 0) return '';
		if (names.length === 1) return names[0];
		if (names.length === 2) return `${names[0]} and ${names[1]}`;
		return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
	}
</script>

{#if tocEntries.length > 0}
	<section class="section pub-section scroll-reveal" aria-labelledby="pub-toc-head">
		<div class="section-head">
			<h2 id="pub-toc-head" class="section-title">Table of Contents</h2>
		</div>
		<ol class="pub-toc">
			{#each tocEntries as item, index (index)}
				<li class="pub-toc-item">
					<span class="pub-toc-no">{String(index + 1).padStart(2, '0')}</span>
					{#if typeof item === 'string'}
						<span class="pub-toc-title">{item}</span>
					{:else}
						<span class="pub-toc-title">
							{item.title}
							{#if item.authors && item.authors.length > 0}
								<span class="pub-toc-authors">{formatNameList(item.authors)}</span>
							{/if}
						</span>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
{/if}

<style>
	/* Consistent rhythm with the page's other numbered sections. */
	.pub-section {
		margin-top: var(--space-2xl);
	}

	/* ── Table of contents — two columns of ledger rows ───────────────────── */
	.pub-toc {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	@media (--sm) {
		.pub-toc {
			column-count: 2;
			column-gap: var(--space-2xl);
		}
	}

	.pub-toc-item {
		display: grid;
		grid-template-columns: 2.25rem 1fr;
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm) 0;
		border-top: var(--rule-hairline) solid var(--color-border);
		break-inside: avoid;
	}

	.pub-toc-no {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.08em;
		color: var(--color-accent);
		line-height: var(--line-height-snug);
	}

	.pub-toc-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-snug);
		color: var(--color-text);
	}

	.pub-toc-authors {
		display: block;
		margin-top: var(--space-1);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
</style>
