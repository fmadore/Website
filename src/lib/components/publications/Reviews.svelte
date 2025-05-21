<script lang="ts">
    import type { ReviewWork } from '$lib/types/publication';

    // Prop to receive the array of reviews
    let { reviewedBy = [] }: { reviewedBy?: ReviewWork[] } = $props();

    // Sort the array by year descending
    const sortedReviews = $derived((reviewedBy || []).sort((a, b) => b.year - a.year));
</script>

{#if sortedReviews && sortedReviews.length > 0}
    <section class="mt-8 reviews-section">
        <h2 class="text-xl font-semibold mb-4">Reviews</h2>
        <div class="grid grid-cols-1 gap-4">
            {#each sortedReviews as review}
                <div class="review-card bg-gray-50 p-4 rounded-md shadow-sm border border-gray-100">
                    <div class="font-semibold text-lg mb-1">
                        {#if review.url}
                            <a href="{review.url}" target="_blank" rel="noopener" class="text-primary hover:underline">{review.title}</a>
                        {:else}
                            {review.title}
                        {/if}
                    </div>
                    <div class="text-sm text-text-secondary mb-1">
                        By {review.author} ({review.year})
                    </div>
                    <div class="text-sm italic text-text-muted mb-3">
                        {review.journal}
                        {#if review.volume || review.issue || review.pages}
                            {#if review.volume}{", " + review.volume}{/if}
                            {#if review.issue}{", no. " + review.issue}{/if}
                            {#if review.pages}{", pp. " + review.pages}{/if}
                        {/if}
                        {#if review.doi}
                            <div>DOI: <a href="https://doi.org/{review.doi}" target="_blank" rel="noopener" class="text-primary hover:underline">{review.doi}</a></div>
                        {/if}
                    </div>
                    {#if review.excerpt}
                        <blockquote class="pl-4 border-l-4 border-gray-200 italic text-gray-700">
                            "{review.excerpt}"
                        </blockquote>
                    {/if}
                </div>
            {/each}
        </div>
    </section>
{/if}