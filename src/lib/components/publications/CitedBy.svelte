<script lang="ts">
	import type { CitingWork } from '$lib/types/publication';

	// Prop to receive the array of citing works
	let { citedBy = [] }: { citedBy?: CitingWork[] } = $props();

	// Sort the array by year descending
	const sortedCitedBy = $derived((citedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedCitedBy && sortedCitedBy.length > 0}
	<section class="cited-by-section">
		<h2 class="section-title">Cited By ({sortedCitedBy.length})</h2>
		<div class="citations-grid">
			{#each sortedCitedBy as citingWork}
				<div class="citing-work-card glass-card">
					<div class="citation-title">
						{#if citingWork.url}
							<a
								href={citingWork.url}
								target="_blank"
								rel="noopener"
								class="citation-link">{citingWork.title}</a
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
	.cited-by-section {
		margin-top: var(--spacing-8);
	}

	.section-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-4);
		color: var(--color-text-emphasis);
		font-family: var(--font-family-serif);
	}

	.citations-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-4);
	}

	@media (min-width: 768px) {
		.citations-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.citing-work-card {
		padding: var(--spacing-4);
		border-radius: var(--border-radius-lg);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		/* Enhanced glassmorphism with subtle gradient overlay to match ContentBody */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
	}

	.citing-work-card:hover {
		transform: var(--transform-lift-sm);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
	}

	.citation-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-1);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
	}

	.citation-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color 0.2s ease;
	}

	.citation-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* External link indicator */
	.citation-link:after {
		content: '↗';
		font-size: var(--font-size-sm);
		margin-left: var(--spacing-1);
		opacity: var(--opacity-high);
	}

	.citation-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-1);
		font-weight: var(--font-weight-normal);
	}

	.citation-source {
		font-size: var(--font-size-sm);
		font-style: italic;
		color: var(--color-text-muted);
	}

	/* Enhanced focus states for accessibility */
	.citation-link:focus-visible {
		outline: 2px solid var(--color-highlight);
		outline-offset: 2px;
		box-shadow: 0 0 0 4px rgba(var(--color-highlight-rgb), 0.2);
		border-radius: var(--border-radius-sm);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.citing-work-card {
			padding: var(--spacing-3);
		}

		.citation-title {
			font-size: var(--font-size-base);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.citing-work-card {
			transition: none;
		}

		.citing-work-card:hover {
			transform: none;
		}
	}
</style>
