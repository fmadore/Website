<script lang="ts">
	import type { ReviewWork } from '$lib/types/publication';

	// Prop to receive the array of reviews
	let { reviewedBy = [] }: { reviewedBy?: ReviewWork[] } = $props();

	// Sort the array by year descending
	const sortedReviews = $derived((reviewedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedReviews && sortedReviews.length > 0}
	<section class="reviews-section">
		<h2 class="section-title">Reviews</h2>
		<div class="reviews-grid">
			{#each sortedReviews as review}
				<div class="review-card">
					<div class="review-title">
						{#if review.url}
							<a
								href={review.url}
								target="_blank"
								rel="noopener"
								class="review-link">{review.title}</a
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
							"{review.excerpt}"
						</blockquote>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.reviews-section {
		margin-top: var(--spacing-8);
		padding: var(--spacing-6);
		border-radius: var(--border-radius-xl);
		position: relative;
		
		/* Sophisticated glassmorphism effect matching other components */
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
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-low, 0.1));
		transition: all var(--anim-duration-base, 0.3s) var(--anim-ease-out, ease-out);
	}

	.reviews-section:hover {
		transform: var(--transform-lift-sm, translateY(-1px));
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-accent-rgb), 0.035) 50%,
			rgba(var(--color-highlight-rgb), 0.03) 100%
		);
		box-shadow: 
			var(--shadow-lg),
			inset 0 var(--border-width-thin) 0 rgba(var(--color-white-rgb, 255, 255, 255), var(--opacity-medium, 0.15));
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

	/* Elegant accent line under title matching other components */
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

	.reviews-section:hover .section-title::after {
		width: var(--spacing-20);
	}

	.reviews-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-6);
	}

	.review-card {
		padding: var(--spacing-6);
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

	.review-card:hover {
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
	.review-card::before {
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

	.review-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-3);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
		font-family: var(--font-family-serif);
	}

	.review-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-semibold);
		transition: color var(--anim-duration-fast, 0.2s) var(--anim-ease-out, ease);
	}

	.review-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	/* External link indicator */
	.review-link:after {
		content: '↗';
		font-size: var(--font-size-sm);
		margin-left: var(--spacing-1);
		opacity: var(--opacity-high, 0.8);
	}

	.review-author {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-3);
	}

	.author-label {
		font-weight: var(--font-weight-medium);
	}

	.journal-info {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-4);
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
		margin-top: var(--spacing-2);
	}

	.doi-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color var(--anim-duration-fast, 0.2s) var(--anim-ease-out, ease);
	}

	.doi-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	.excerpt {
		margin-top: var(--spacing-5);
		padding: var(--spacing-5) var(--spacing-6);
		border-radius: var(--border-radius-lg);
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.08) 0%,
			rgba(var(--color-accent-rgb), 0.05) 100%
		);
		border-left: var(--border-width-thick, 4px) solid var(--color-primary);
		font-style: italic;
		color: var(--color-text);
		position: relative;
		line-height: var(--line-height-relaxed);
		letter-spacing: var(--letter-spacing-wide, 0.025em);
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
	}

	.excerpt::before {
		content: '"';
		position: absolute;
		left: var(--spacing-3);
		top: -0.2em;
		color: var(--color-primary);
		font-size: var(--font-size-3xl);
		font-family: var(--font-family-serif);
		font-weight: var(--font-weight-bold);
		opacity: 0.6;
	}

	/* Enhanced focus states for accessibility */
	.review-link:focus-visible,
	.doi-link:focus-visible {
		outline: 2px solid var(--color-highlight);
		outline-offset: 2px;
		box-shadow: 0 0 0 4px rgba(var(--color-highlight-rgb), 0.2);
		border-radius: var(--border-radius-sm);
	}

	/* Dark mode refinements */
	:global(html.dark) .reviews-section {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.6) 0%,
			rgba(var(--color-primary-rgb), 0.12) 50%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.08);
	}

	:global(html.dark) .reviews-section:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.7) 0%,
			rgba(var(--color-primary-rgb), 0.15) 50%,
			rgba(var(--color-accent-rgb), 0.1) 100%
		);
	}

	:global(html.dark) .review-card {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.4) 0%,
			rgba(var(--color-accent-rgb), 0.08) 50%,
			rgba(var(--color-primary-rgb), 0.06) 100%
		);
		border-color: rgba(var(--color-white-rgb, 255, 255, 255), 0.06);
	}

	:global(html.dark) .review-card:hover {
		background: linear-gradient(
			135deg,
			rgba(var(--color-dark-surface-rgb, 51, 65, 85), 0.5) 0%,
			rgba(var(--color-accent-rgb), 0.12) 50%,
			rgba(var(--color-primary-rgb), 0.08) 100%
		);
	}

	:global(html.dark) .excerpt {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.12) 0%,
			rgba(var(--color-accent-rgb), 0.08) 100%
		);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.reviews-section {
			padding: var(--spacing-4);
		}

		.section-title {
			font-size: var(--font-size-lg);
		}

		.review-card {
			padding: var(--spacing-4);
		}

		.reviews-grid {
			gap: var(--spacing-4);
		}

		.review-title {
			font-size: var(--font-size-base);
		}

		.excerpt {
			padding: var(--spacing-3) var(--spacing-4);
		}

		.excerpt::before {
			left: var(--spacing-2);
			font-size: var(--font-size-2xl);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.reviews-section,
		.reviews-section:hover,
		.review-card,
		.review-card:hover,
		.section-title::after {
			transition: none;
			transform: none;
		}
	}
</style>
