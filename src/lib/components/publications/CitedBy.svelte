<script lang="ts">
    import type { CitingWork } from '$lib/types/publication';

    // Prop to receive the array of citing works
    export let citedBy: CitingWork[] = [];

    // Sort the array by year descending
    $: sortedCitedBy = (citedBy || []).sort((a, b) => b.year - a.year);
</script>

{#if sortedCitedBy && sortedCitedBy.length > 0}
    <section class="mt-8 cited-by-section">
        <h2 class="text-xl font-semibold mb-4">Cited By</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each sortedCitedBy as citingWork}
                <div class="citing-work-card bg-sidebar p-4 rounded-md shadow-sm border border-default">
                    <div class="font-semibold text-lg mb-1">
                        {#if citingWork.url}
                            <a href="{citingWork.url}" target="_blank" rel="noopener" class="text-primary hover:underline">{citingWork.title}</a>
                        {:else}
                            {citingWork.title}
                        {/if}
                    </div>
                    <div class="text-sm text-secondary mb-1">
                        {citingWork.authors.join(', ')} ({citingWork.year})
                    </div>
                    {#if citingWork.source}
                        <div class="text-sm italic text-light">
                            {citingWork.source}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </section>
{/if} 