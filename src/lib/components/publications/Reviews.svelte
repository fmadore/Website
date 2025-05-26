<script lang="ts">
	import type { ReviewWork } from '$lib/types/publication';

	// Prop to receive the array of reviews
	let { reviewedBy = [] }: { reviewedBy?: ReviewWork[] } = $props();

	// Sort the array by year descending
	const sortedReviews = $derived((reviewedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedReviews && sortedReviews.length > 0}
	<section class="mt-12 reviews-section">
		<h2 class="text-2xl font-semibold mb-6">Reviews</h2>
		<div class="grid grid-cols-1 gap-8">
			{#each sortedReviews as review}
				<div
					class="review-card bg-sidebar p-6 rounded-md shadow-sm border border-default hover:shadow-md transition-shadow"
				>
					<div class="font-semibold text-lg mb-3">
						{#if review.url}
							<a
								href={review.url}
								target="_blank"
								rel="noopener"
								class="text-primary hover:underline">{review.title}</a
							>
						{:else}
							{review.title}
						{/if}
					</div>

					<div class="text-sm text-secondary mb-3">
						<span class="font-medium">By {review.author}</span> ({review.year})
					</div>

					<div class="journal-info text-sm text-light mb-4">
						<span class="journal-name">{review.journal}</span>
						{#if review.volume || review.issue || review.pages}
							<span class="publication-details">
								{#if review.volume}{', ' + review.volume}{/if}
								{#if review.issue}{', no. ' + review.issue}{/if}
								{#if review.pages}{', pp. ' + review.pages}{/if}
							</span>
						{/if}
						{#if review.doi}
							<div class="doi mt-2">
								DOI: <a
									href="https://doi.org/{review.doi}"
									target="_blank"
									rel="noopener"
									class="text-primary hover:underline">{review.doi}</a
								>
							</div>
						{/if}
					</div>

					{#if review.excerpt}
						<blockquote
							class="excerpt mt-5 pl-6 border-l-4 border-primary-light bg-primary-lightest p-4 rounded-r-md italic text-text"
						>
							"{review.excerpt}"
						</blockquote>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.review-card {
		transition: transform 0.2s ease-in-out;
	}
	.review-card:hover {
		transform: translateY(-2px);
	}
	.journal-name {
		font-style: italic;
	}
	.excerpt {
		position: relative;
		line-height: 1.7;
		letter-spacing: 0.01em;
	}
	.excerpt::before,
	.excerpt::after {
		color: var(--color-primary);
		font-size: 1.5em;
		font-family: Georgia, serif;
	}
	.excerpt::before {
		content: '"';
		position: absolute;
		left: 0;
		top: -0.3em;
		transform: translateX(-50%);
	}
</style>
