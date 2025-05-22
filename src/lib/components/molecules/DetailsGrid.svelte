<script lang="ts">
    let { details = [] }: { details: Array<{ label: string; value: string | string[]; link?: string; condition?: boolean }> } = $props();

    // Filter details based on the condition (if provided) and if the value exists
    let visibleDetails = $derived(details.filter(detail => 
        (detail.condition === undefined || detail.condition === true) && 
        (detail.value !== null && detail.value !== undefined && detail.value !== '' && (!Array.isArray(detail.value) || detail.value.length > 0))
    ));
</script>

{#if visibleDetails.length > 0}
    <section class="details-grid grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-6">
        {#each visibleDetails as detail}
            <div class="detail-item py-2 border-b border-border">
                <strong class="detail-label font-semibold mr-2">{detail.label}:</strong>
                {#if detail.link}
                    <a href={detail.link} target="_blank" rel="noopener" class="detail-value text-primary hover:underline">
                        {Array.isArray(detail.value) ? detail.value.join(', ') : detail.value}
                    </a>
                {:else}
                    <span class="detail-value">
                        {Array.isArray(detail.value) ? detail.value.join(', ') : detail.value}
                    </span>
                {/if}
            </div>
        {/each}
    </section>
{/if}

<style>
    .detail-label {
        color: var(--color-text-light);
    }
    .detail-value {
         word-break: break-word; /* Prevent long values like DOIs from breaking layout */
    }
</style>