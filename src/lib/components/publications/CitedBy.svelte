<script lang="ts">
	import type { CitingWork } from '$lib/types/publication';

	// Prop to receive the array of citing works
	let { citedBy = [] }: { citedBy?: CitingWork[] } = $props();

	// Sort the array by year descending
	const sortedCitedBy = $derived((citedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedCitedBy && sortedCitedBy.length > 0}
	<section class="cited-by-section scroll-reveal">
		<h2 class="section-title">Cited By ({sortedCitedBy.length})</h2>
		<div class="citations-grid grid-stagger">
			{#each sortedCitedBy as citingWork (citingWork.title + citingWork.year)}
				<div class="citing-work-card scroll-reveal-scale">
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
		margin-top: var(--space-xl);
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		position: relative;
		will-change: transform, box-shadow;

		/* Sophisticated glassmorphism effect matching AbstractSection */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent);
		box-shadow: var(--shadow-md);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}

	@media (--sm) {
		.cited-by-section {
			padding: var(--space-xl);
		}
	}

	.cited-by-section:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-lg);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-highlight) calc(var(--opacity-very-low) * 100%), transparent)
				50%,
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-very-low) * 100%), transparent) 100%
		);
	}

	.section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-emphasis);
		margin-bottom: var(--space-lg);
		line-height: var(--line-height-tight);
		position: relative;
	}

	@media (--sm) {
		.section-title {
			font-size: var(--font-size-xl);
		}
	}

	/* Elegant accent line under title matching AbstractSection */
	.section-title::after {
		content: '';
		position: absolute;
		bottom: calc(-1 * var(--space-sm));
		left: 0;
		width: var(--space-3xl);
		height: var(--border-width-medium);
		background: linear-gradient(
			90deg,
			var(--color-highlight) 0%,
			color-mix(in srgb, var(--color-highlight) 30%, transparent) 100%
		);
		border-radius: var(--border-radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.cited-by-section:hover .section-title::after {
		width: var(--space-5xl);
	}

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
		border-radius: var(--border-radius-lg);
		position: relative;
		will-change: transform, box-shadow;

		/* Enhanced glassmorphism for individual cards */
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-surface) calc(var(--opacity-medium) * 100%), transparent) 0%,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent)
				100%
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-medium) * 100%), transparent);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
	}

	@media (--sm) {
		.citing-work-card {
			padding: var(--space-lg);
		}
	}

	.citing-work-card:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
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
		opacity: var(--opacity-high);
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

	/* Dark mode refinements */
	:global(html.dark) .cited-by-section {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 8%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 4%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 6%, transparent) 100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	:global(html.dark) .cited-by-section:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 6%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 8%, transparent) 100%
		);
	}

	:global(html.dark) .citing-work-card {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-dark-surface) calc(var(--opacity-medium) * 100%), transparent)
				0%,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-very-low) * 100%), transparent)
				100%
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-very-low) * 100%),
			transparent
		);
	}

	:global(html.dark) .citing-work-card:hover {
		background: linear-gradient(
			135deg,
			color-mix(
					in srgb,
					var(--color-dark-surface) calc(var(--opacity-medium-high) * 100%),
					transparent
				)
				0%,
			color-mix(in srgb, var(--color-primary) calc(var(--opacity-low) * 100%), transparent) 100%
		);
	}

	/* Responsive adjustments */
	/* Mobile-first styles are now default, with overrides in media queries above */

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.cited-by-section,
		.cited-by-section:hover,
		.citing-work-card,
		.citing-work-card:hover,
		.section-title::after {
			transition: none !important;
			transform: none !important;
			will-change: auto !important;
		}
	}
</style>
