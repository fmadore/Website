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
			{#each sortedCitedBy as citingWork (citingWork.title + citingWork.year)}
				<div class="citing-work-card">
					<div class="citation-title">
						{#if citingWork.url}
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
	.cited-by-section {
		margin-top: var(--spacing-8);
		padding: var(--spacing-6);
		border-radius: var(--border-radius-xl);
		position: relative;

		/* Sophisticated glassmorphism effect matching AbstractSection */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.035) 0%,
			rgba(var(--color-accent-rgb), 0.025) 50%,
			rgba(var(--color-highlight-rgb), 0.02) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 8px));
		backdrop-filter: blur(var(--glass-blur-fallback, 8px));
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-low, 0.08));
		box-shadow:
			var(--shadow-md),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-low, 0.1));
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.cited-by-section:hover {
		transform: var(--transform-lift-sm, translateY(-1px));
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-accent-rgb), 0.035) 50%,
			rgba(var(--color-highlight-rgb), 0.03) 100%
		);
		box-shadow:
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0
				rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-medium, 0.15));
	}

	.section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--spacing-6);
		line-height: var(--line-height-tight);
		position: relative;
	}

	/* Elegant accent line under title matching AbstractSection */
	.section-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--spacing-2));
		left: 0;
		width: var(--spacing-16);
		height: var(--border-width-medium, 2px);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			rgba(var(--color-highlight-rgb), 0.3) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.cited-by-section:hover .section-title::after {
		width: var(--spacing-20);
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
		padding: var(--spacing-5);
		border-radius: var(--border-radius-lg);
		position: relative;

		/* Enhanced glassmorphism for individual cards */
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.03) 0%,
			rgba(var(--color-primary-rgb), 0.02) 50%,
			rgba(var(--color-highlight-rgb), 0.015) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		backdrop-filter: blur(var(--glass-blur-fallback, 6px));
		border: var(--border-width-thin) solid rgba(var(--color-accent-rgb), var(--opacity-low, 0.08));
		box-shadow: var(--shadow-sm);
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.citing-work-card:hover {
		transform: var(--transform-lift-sm, translateY(-2px));
		background: linear-gradient(
			135deg,
			rgba(var(--color-accent-rgb), 0.05) 0%,
			rgba(var(--color-primary-rgb), 0.03) 50%,
			rgba(var(--color-highlight-rgb), 0.025) 100%
		);
		box-shadow: var(--shadow-md);
	}

	/* Subtle inner highlight for depth */
	.citing-work-card::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
		background: linear-gradient(
			180deg,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.08) 0%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 40%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0) 60%,
			rgba(var(--color-white-rgb, 255, 255, 255), 0.08) 100%
		);
		mix-blend-mode: overlay;
		opacity: 0.3;
	}

	.citation-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-2);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
		font-family: var(--font-family-serif);
	}

	.citation-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		transition: color var(--anim-duration-fast, 0.2s) var(--anim-ease-out, ease);
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
		opacity: var(--opacity-high, 0.8);
	}

	.citation-authors {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-2);
		font-weight: var(--font-weight-medium);
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

	/* Dark mode refinements */
	:global(html.dark) .cited-by-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.6) 0%,
			rgba(var(--color-primary-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.08);
	}

	:global(html.dark) .cited-by-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.7) 0%,
			rgba(var(--color-primary-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	:global(html.dark) .citing-work-card {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.4) 0%,
			rgba(var(--color-accent-rgb), 0.08) 50%,
			rgba(var(--color-primary-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.06);
	}

	:global(html.dark) .citing-work-card:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.5) 0%,
			rgba(var(--color-accent-rgb), 0.12) 50%,
			rgba(var(--color-primary-rgb), 0.08) 100%
		);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.cited-by-section {
			padding: var(--spacing-4);
		}

		.section-title {
			font-size: var(--font-size-lg);
		}

		.citing-work-card {
			padding: var(--spacing-3);
		}

		.citation-title {
			font-size: var(--font-size-base);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.cited-by-section,
		.cited-by-section:hover,
		.citing-work-card,
		.citing-work-card:hover,
		.section-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
