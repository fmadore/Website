<script lang="ts">
    let {
        primaryUrl = undefined,
        primaryLabel = 'Access Item',
        additionalUrls = [],
        sectionClass = 'action-links',
        primaryButtonClass = 'btn btn-primary',
        secondaryButtonClass = 'btn btn-outline',
        primaryDivClass = 'mb-2',
        secondaryDivClass = 'flex flex-wrap gap-2'
    }: {
        primaryUrl?: string | undefined | null;
        primaryLabel?: string;
        additionalUrls?: Array<{ url: string; label: string }> | undefined | null;
        sectionClass?: string;
        primaryButtonClass?: string;
        secondaryButtonClass?: string;
        primaryDivClass?: string;
        secondaryDivClass?: string;
    } = $props();

    let visibleAdditionalUrls = $derived(additionalUrls?.filter(link => link.url && link.label) ?? []);

</script>

{#if primaryUrl || visibleAdditionalUrls.length > 0}
    <section class={sectionClass}>
        {#if primaryUrl}
            <div class={primaryDivClass}>
                <a href={primaryUrl} target="_blank" rel="noopener noreferrer" class={primaryButtonClass}>
                    {primaryLabel}
                </a>
            </div>
        {/if}
        
        {#if visibleAdditionalUrls.length > 0}
            <div class={secondaryDivClass}>
                {#each visibleAdditionalUrls as link}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" class={secondaryButtonClass}>
                        {link.label}
                    </a>
                {/each}
            </div>
        {/if}
    </section>
{/if}

<style>
    /* Button styles (.btn, .btn-primary, .btn-outline) are assumed 
       to be globally defined or can be included here if needed. */
</style> 