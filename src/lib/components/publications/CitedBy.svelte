<script lang="ts">
	import type { CitingWork } from '$lib/types/publication';

	// Prop to receive the array of citing works + the section's №-marker.
	let {
		citedBy = [],
		sectionNumber = undefined
	}: { citedBy?: CitingWork[]; sectionNumber?: string } = $props();

	// Sort the array by year descending (copy first — never mutate the prop).
	const sortedCitedBy = $derived([...(citedBy ?? [])].sort((a, b) => b.year - a.year));
</script>

{#if sortedCitedBy && sortedCitedBy.length > 0}
	<section class="cited-by-section section scroll-reveal">
		<div class="section-head">
			<span class="section-no">{sectionNumber ? `№ ${sectionNumber}` : '№'}</span>
			<h2 class="section-title">Cited By</h2>
			<span class="dateline cited-by-count">{sortedCitedBy.length} works</span>
		</div>

		<!-- Each citing work is a ledger record: mono year key left, serif
		     content right, hairline between. A bibliography, not a card grid. -->
		<div class="ledger ledger--ruled grid-stagger">
			{#each sortedCitedBy as citingWork (citingWork.title + citingWork.year)}
				<div class="ledger-row" style="--ledger-key-w: 5.5rem;">
					<div class="ledger-key">{citingWork.year}</div>
					<div class="ledger-content">
						<p class="ledger-title citation-title">
							{#if citingWork.url}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
								<a href={citingWork.url} target="_blank" rel="noopener" class="citation-link"
									>{citingWork.title}</a
								>
							{:else}
								{citingWork.title}
							{/if}
						</p>
						<p class="citation-authors">
							{citingWork.authors.join(', ')}
						</p>
						{#if citingWork.source}
							<p class="citation-source">
								{citingWork.source}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* №-numbered section (3px top rule) supplied by the .section idiom;
	 * only the top-margin rhythm is local. */
	.cited-by-section {
		margin-top: var(--space-2xl);
	}

	/* Count stamp sits after the title as a faint mono dateline. */
	.cited-by-count {
		margin-left: auto;
	}

	/* Serif title inherits from .ledger-title; keep the link inline-quiet. */
	.citation-title {
		margin: 0;
	}

	.citation-link {
		color: inherit;
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.citation-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	/* External link indicator */
	.citation-link:after {
		content: '↗';
		font-size: var(--font-size-sm);
		margin-left: var(--space-2xs);
		color: var(--color-text-muted);
	}

	/* Author line — mono data voice, quiet ink. */
	.citation-authors {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-light);
		margin: 0;
	}

	.citation-source {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		font-style: italic;
		color: var(--color-text-muted);
		margin: 0;
	}

	/* Enhanced focus states for accessibility */
	.citation-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-0-5);
	}
</style>
