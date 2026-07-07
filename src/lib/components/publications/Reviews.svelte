<script lang="ts">
	import type { ReviewWork } from '$lib/types/publication';

	// Prop to receive the array of reviews.
	let { reviewedBy = [] }: { reviewedBy?: ReviewWork[] } = $props();

	// Sort the array by year descending (copy first — never mutate the prop).
	const sortedReviews = $derived([...(reviewedBy ?? [])].sort((a, b) => b.year - a.year));
</script>

{#if sortedReviews.length > 0}
	<section class="reviews-section section scroll-reveal">
		<div class="section-head">
			<h2 class="section-title">Reviews</h2>
			<span class="dateline reviews-count">{sortedReviews.length}</span>
		</div>

		<!-- Each review: a serif-italic pull-quote (the document voice) closed by
		     a mono attribution line — AUTHOR · VENUE · YEAR · DOI ↗ (the data
		     voice). No cards, no stripes. -->
		<div class="review-list grid-stagger">
			{#each sortedReviews as review (review.title + review.year + review.author)}
				<article class="review">
					{#if review.excerpt}
						<blockquote class="review-quote">{review.excerpt}</blockquote>
					{/if}

					<p class="review-attribution">
						{#if review.url}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
							<a href={review.url} target="_blank" rel="noopener" class="review-link">
								{review.author}<span class="review-cite-arrow"> ↗</span>
							</a>
						{:else}
							<span>{review.author}</span>
						{/if}
						<span class="review-sep" aria-hidden="true">·</span>
						<span class="review-venue">{review.journal}</span>
						<span class="review-sep" aria-hidden="true">·</span>
						<span class="review-year">{review.year}</span>
						{#if review.doi}
							<span class="review-sep" aria-hidden="true">·</span>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
							<a
								href="https://doi.org/{review.doi}"
								target="_blank"
								rel="noopener"
								class="review-doi">DOI ↗</a
							>
						{/if}
					</p>

					<!-- Full review reference in serif — the record behind the quote. -->
					<p class="review-ref">
						{#if review.url}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
							<a href={review.url} target="_blank" rel="noopener" class="review-ref-link"
								>{review.title}</a
							>
						{:else}
							{review.title}
						{/if}
					</p>
				</article>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Section (3px top rule) supplied by the .section idiom. */
	.reviews-section {
		margin-top: var(--space-2xl);
	}

	/* Count stamp sits after the title as a faint mono dateline. */
	.reviews-count {
		margin-left: auto;
	}

	.review-list {
		display: flex;
		flex-direction: column;
	}

	/* Each review is separated from the previous by a hairline — a bibliography
	 * of quoted opinion, ruled like the ledger but quote-led. */
	.review {
		padding: var(--space-lg) 0;
		border-top: var(--rule-hairline) solid var(--color-border);
	}

	.review:first-child {
		border-top: none;
		padding-top: var(--space-xs);
	}

	/*
	 * Review quote — editorial pull-quote in the document voice: italic serif,
	 * opened by a hanging pine quotation mark. No box, no stripe.
	 */
	.review-quote {
		position: relative;
		margin: 0 0 var(--space-md);
		padding-left: var(--space-lg);
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		max-width: 62ch;
	}

	.review-quote::before {
		content: '\201C';
		position: absolute;
		left: 0;
		top: -0.1em;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-3xl);
		line-height: 1;
		color: color-mix(in srgb, var(--color-accent) 60%, transparent);
	}

	/* Attribution — the data voice: mono caps, dot-separated, DOI stamped. */
	.review-attribution {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-2);
		margin: 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.review-venue {
		color: var(--color-text-soft);
	}

	.review-year {
		color: var(--color-text-muted);
	}

	.review-sep {
		color: var(--color-text-muted);
	}

	.review-link {
		color: var(--color-text-emphasis);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.review-link:hover {
		color: var(--color-accent);
	}

	.review-cite-arrow {
		color: var(--color-text-muted);
	}

	.review-doi {
		color: var(--color-accent);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.review-doi:hover {
		color: var(--color-accent-dark);
		text-decoration: underline;
	}

	/* The full review reference — quiet serif, the bibliographic record. */
	.review-ref {
		margin: var(--space-sm) 0 0;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		line-height: var(--line-height-snug);
		color: var(--color-text-light);
		max-width: 64ch;
	}

	.review-ref-link {
		color: inherit;
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.review-ref-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
	}

	/* Enhanced focus states for accessibility */
	.review-link:focus-visible,
	.review-doi:focus-visible,
	.review-ref-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-0-5);
	}

	@media (prefers-reduced-motion: reduce) {
		.review-link,
		.review-doi,
		.review-ref-link {
			transition: none;
		}
	}
</style>
