<script lang="ts">
	import type { ReviewWork } from '$lib/types/publication';

	// Prop to receive the array of reviews
	let { reviewedBy = [] }: { reviewedBy?: ReviewWork[] } = $props();

	// Sort the array by year descending
	const sortedReviews = $derived((reviewedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedReviews && sortedReviews.length > 0}
	<section class="reviews-section scroll-reveal">
		<h2 class="section-title">Reviews</h2>
		<div class="reviews-grid grid-stagger">
			{#each sortedReviews as review (review.title + review.year + review.author)}
				<div class="review-card scroll-reveal-scale">
					<div class="review-title">
						{#if review.url}
							<a href={review.url} target="_blank" rel="noopener" class="review-link"
								>{review.title}</a
							>
						{:else}
							{review.title}
						{/if}
					</div>

					<div class="review-author">
						<span class="author-label">By {review.author}</span> ({review.year})
					</div>

					<div class="journal-info">
						<span class="journal-name">{review.journal}</span>
						{#if review.volume || review.issue || review.pages}
							<span class="publication-details">
								{#if review.volume}{', ' + review.volume}{/if}
								{#if review.issue}{', no. ' + review.issue}{/if}
								{#if review.pages}{', pp. ' + review.pages}{/if}
							</span>
						{/if}
						{#if review.doi}
							<div class="doi">
								DOI: <a
									href="https://doi.org/{review.doi}"
									target="_blank"
									rel="noopener"
									class="doi-link">{review.doi}</a
								>
							</div>
						{/if}
					</div>

					{#if review.excerpt}
						<blockquote class="excerpt">
							{review.excerpt}
						</blockquote>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.reviews-section {
		margin-top: var(--space-xl);
		padding: var(--space-lg);
		border-radius: var(--border-radius-xl);
		position: relative;
		will-change: transform, box-shadow;

		/* Sophisticated glassmorphism effect matching other components */
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
		.reviews-section {
			padding: var(--space-xl);
		}
	}

	.reviews-section:hover {
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

	/* Elegant accent line under title matching other components */
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

	.reviews-section:hover .section-title::after {
		width: var(--space-5xl);
	}

	.reviews-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
	}

	.review-card {
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
		.review-card {
			padding: var(--space-lg);
		}
	}

	.review-card:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
	}

	.review-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--space-sm);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
		font-family: var(--font-family-serif);
	}

	@media (--sm) {
		.review-title {
			font-size: var(--font-size-lg);
		}
	}

	.review-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.review-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* External link indicator */
	.review-link:after {
		content: '↗';
		font-size: var(--font-size-sm);
		margin-left: var(--space-2xs);
		opacity: var(--opacity-high);
	}

	.review-author {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--space-sm);
	}

	.author-label {
		font-weight: var(--font-weight-medium);
	}

	.journal-info {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.journal-name {
		font-style: italic;
		font-weight: var(--font-weight-medium);
		color: var(--color-text);
	}

	.publication-details {
		color: var(--color-text-light);
	}

	.doi {
		margin-top: var(--space-xs);
	}

	.doi-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.doi-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	.excerpt {
		margin-top: var(--space-md);
		padding: var(--space-md);
		border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-left: var(--border-width-thick) solid var(--color-accent);
		font-style: italic;
		color: var(--color-text-light);
		position: relative;
		line-height: var(--line-height-relaxed);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
	}

	@media (--sm) {
		.excerpt {
			padding: var(--space-md) var(--space-lg);
			font-size: var(--font-size-base);
		}
	}

	/* Enhanced focus states for accessibility */
	.review-link:focus-visible,
	.doi-link:focus-visible {
		outline: 2px solid var(--color-highlight);
		outline-offset: 2px;
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-highlight) 20%, transparent);
		border-radius: var(--border-radius-sm);
	}

	/* Dark mode refinements */
	:global(html.dark) .reviews-section {
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

	:global(html.dark) .reviews-section:hover {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 12%, transparent) 0%,
			color-mix(in srgb, var(--color-highlight) 6%, transparent) 50%,
			color-mix(in srgb, var(--color-accent) 8%, transparent) 100%
		);
	}

	:global(html.dark) .review-card {
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

	:global(html.dark) .review-card:hover {
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

	:global(html.dark) .excerpt {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	/* Responsive adjustments */
	/* Mobile-first styles are now default, with overrides in media queries above */

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.reviews-section,
		.reviews-section:hover,
		.review-card,
		.review-card:hover,
		.section-title::after {
			transition: none !important;
			transform: none !important;
			will-change: auto !important;
		}
	}
</style>
