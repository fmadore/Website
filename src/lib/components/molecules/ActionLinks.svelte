<script lang="ts">
    export let primaryUrl: string | undefined | null = undefined;
    export let primaryLabel: string = 'Access Item';
    export let additionalUrls: Array<{ url: string; label: string }> | undefined | null = [];

    export let sectionClass: string = 'action-links';
    export let primaryButtonClass: string = 'btn btn-primary';
    export let secondaryButtonClass: string = 'btn btn-outline';
    export let primaryDivClass: string = 'mb-2';
    export let secondaryDivClass: string = 'flex flex-wrap gap-2';

    $: visibleAdditionalUrls = additionalUrls?.filter(link => link.url && link.label) ?? [];

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