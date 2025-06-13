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
				<div class="review-card glass-card">
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
		margin-top: var(--spacing-12);
	}

	.section-title {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-6);
		color: var(--color-text-emphasis);
		font-family: var(--font-family-serif);
	}

	.reviews-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-8);
	}

	.review-card {
		padding: var(--spacing-6);
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

	.review-card:hover {
		transform: var(--transform-lift-md);
		/* Enhanced hover effect with stronger gradient */
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.05) 0%,
			rgba(var(--color-highlight-rgb), 0.03) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
	}

	.review-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-3);
		color: var(--color-text-emphasis);
		line-height: var(--line-height-snug);
	}

	.review-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
		transition: color 0.2s ease;
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
		opacity: var(--opacity-high);
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
		transition: color 0.2s ease;
	}

	.doi-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	.excerpt {
		margin-top: var(--spacing-5);
		padding: var(--spacing-4) var(--spacing-6);
		border-left: 4px solid var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.05);
		border-radius: 0 var(--border-radius) var(--border-radius) 0;
		font-style: italic;
		color: var(--color-text);
		position: relative;
		line-height: var(--line-height-relaxed);
		letter-spacing: var(--letter-spacing-wide);
		font-family: var(--font-family-serif);
	}

	.excerpt::before {
		content: '"';
		position: absolute;
		left: var(--spacing-2);
		top: -0.3em;
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

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.reviews-section {
			margin-top: var(--spacing-8);
		}

		.section-title {
			font-size: var(--font-size-xl);
		}

		.review-card {
			padding: var(--spacing-4);
		}

		.reviews-grid {
			gap: var(--spacing-6);
		}

		.review-title {
			font-size: var(--font-size-base);
		}

		.excerpt {
			padding: var(--spacing-3) var(--spacing-4);
		}

		.excerpt::before {
			left: var(--spacing-1);
			font-size: var(--font-size-2xl);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.review-card {
			transition: none;
		}

		.review-card:hover {
			transform: none;
		}
	}
</style>
