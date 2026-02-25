<script lang="ts">
	import type { ReviewWork } from '$lib/types/publication';

	// Prop to receive the array of reviews
	let { reviewedBy = [] }: { reviewedBy?: ReviewWork[] } = $props();

	// Sort the array by year descending
	const sortedReviews = $derived((reviewedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedReviews && sortedReviews.length > 0}
	<section class="reviews-section glass-section-panel scroll-reveal">
		<h2 class="section-title">Reviews</h2>
		<div class="reviews-grid grid-stagger">
			{#each sortedReviews as review (review.title + review.year + review.author)}
				<div class="review-card glass-sub-card scroll-reveal-scale">
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
						<span class="journal-name">{review.journal}</span><!--
						-->{#if review.volume || review.issue || review.pages}<span class="publication-details">{#if review.volume}{', vol. ' + review.volume}{/if}{#if review.issue}{', no. ' + review.issue}{/if}{#if review.pages}{', pp. ' + review.pages}{/if}</span>{/if}
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
	}

	@media (--sm) {
		.reviews-section {
			padding: var(--space-xl);
		}
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
	}

	@media (--sm) {
		.review-card {
			padding: var(--space-lg);
		}
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
		outline: var(--border-width-medium) solid var(--color-highlight);
		outline-offset: var(--space-0-5);
		box-shadow: 0 0 0 var(--space-1) color-mix(in srgb, var(--color-highlight) 20%, transparent);
		border-radius: var(--border-radius-sm);
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
		.section-title::after {
			transition: none;
		}
	}
</style>
