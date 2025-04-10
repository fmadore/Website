<script lang="ts">
    import { base } from '$app/paths';

    export let tags: string[] | undefined | null = [];
    export let baseUrl: string = '/search?tag='; // Default base URL, can be overridden
    export let sectionTitle: string = 'Tags';
    export let titleClass: string = 'text-lg font-semibold mb-2';
    export let listClass: string = 'flex flex-wrap gap-2';
    export let tagLinkClass: string = 'tag-link text-sm px-3 py-1 rounded-full'; // Re-uses existing style
    export let sectionClass: string = 'mb-6';

    $: visibleTags = tags?.filter(tag => !!tag) ?? [];
</script>

{#if visibleTags.length > 0}
    <section class={sectionClass}>
        <h2 class={titleClass}>{sectionTitle}</h2>
        <div class={listClass}>
            {#each visibleTags as tag}
                <a href="{base}{baseUrl}{encodeURIComponent(tag)}" class={tagLinkClass}>
                    {tag}
                </a>
            {/each}
        </div>
    </section>
{/if}

<style>
    /* Style for tag-link can be kept in the global stylesheet 
       or defined here if needed for component-specific overrides. 
       Using the one from the page for now. */
    .tag-link {
        background-color: var(--color-border);
        color: var(--color-text-light);
        transition: background-color 0.2s ease, color 0.2s ease;
    }
    .tag-link:hover {
        background-color: var(--color-primary);
        color: var(--color-background);
    }
</style> 