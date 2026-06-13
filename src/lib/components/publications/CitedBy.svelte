<script lang="ts">
	import type { CitingWork } from '$lib/types/publication';

	// Prop to receive the array of citing works
	let { citedBy = [] }: { citedBy?: CitingWork[] } = $props();

	// Sort the array by year descending
	const sortedCitedBy = $derived((citedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedCitedBy && sortedCitedBy.length > 0}
	<section class="cited-by-section glass-section-panel scroll-reveal">
		<h2 class="editorial-section-title">Cited By ({sortedCitedBy.length})</h2>
		<div class="citations-grid grid-stagger">
			{#each sortedCitedBy as citingWork (citingWork.title + citingWork.year)}
				<div class="citing-work-card glass-sub-card scroll-reveal-scale">
					<div class="citation-title">
						{#if citingWork.url}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
							<a href={citingWork.url} target="_blank" rel="noopener" class="citation-link"
								>{citingWork.title}</a
							>
						{:else}
							{citingWork.title}
						{/if}
					</div>
					<div class="citation-authors">
						{citingWork.authors.join(', ')} ({citingWork.year})
					</div>
					{#if citingWork.source}
						<div class="citation-source">
							{citingWork.source}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Content-on-paper section; the entity cards inside carry the chrome. */
	.cited-by-section {
		margin-top: var(--space-2xl);
	}

	/* Section title comes from the shared .editorial-section-title utility
	 * (typography.css). */

	.citations-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
	}

	@media (--md) {
		.citations-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.citing-work-card {
		padding: var(--space-md);
	}

	@media (--sm) {
		.citing-work-card {
			padding: var(--space-lg);
		}
	}

	.citation-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--space-xs);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
		font-family: var(--font-family-serif);
	}

	@media (--sm) {
		.citation-title {
			font-size: var(--font-size-lg);
		}
	}

	.citation-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.citation-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* External link indicator */
	.citation-link:after {
		content: '↗';
		font-size: var(--font-size-sm);
		margin-left: var(--space-2xs);
		opacity: var(--opacity-90);
	}

	.citation-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--space-xs);
		font-weight: var(--font-weight-medium);
	}

	.citation-source {
		font-size: var(--font-size-sm);
		font-style: italic;
		color: var(--color-text-muted);
	}

	/* Enhanced focus states for accessibility */
	.citation-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-0-5);
		box-shadow: 0 0 0 var(--space-1) color-mix(in srgb, var(--color-highlight) 20%, transparent);
		border-radius: var(--border-radius-sm);
	}
</style>
