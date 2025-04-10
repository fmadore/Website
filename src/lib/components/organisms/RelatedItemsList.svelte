<script lang="ts">
    import type { ComponentType } from 'svelte';
    import { base } from '$app/paths';

    // Props
    export let allItems: any[] = []; // Array of all potential items (e.g., allPublications)
    export let currentItemId: string | number;
    export let filterKey: string; // Property to filter by (e.g., 'project', 'type')
    export let filterValue: any; // Value to match for the filterKey
    export let title: string; // Section title (e.g., "More Publications in this Project")
    export let itemComponent: ComponentType; // Component to render each item (e.g., ItemCard)
    // Removed itemPropName as it complicates <svelte:component>
    export let baseItemUrl: string; // Base URL for item links (e.g., "/publications/")
    export let maxItems: number = 3; // Max items to display

    // Optional styling props
    export let sectionClass: string = 'mt-8';
    export let titleClass: string = 'text-xl font-semibold mb-4';
    export let gridClass: string = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

    // Reactive calculation for related items
    $: relatedItems = allItems
        .filter(item => 
            item.id !== currentItemId && // Exclude current item
            item[filterKey] === filterValue // Match filter criteria
        )
        .slice(0, maxItems); // Limit number of items

</script>

{#if relatedItems.length > 0}
    <section class={sectionClass}>
        <h2 class={titleClass}>{title}</h2>
        <div class={gridClass}>
            {#each relatedItems as item (item.id)}
                <svelte:component 
                    this={itemComponent} 
                    item={item}
                    itemUrl={`${base}${baseItemUrl}${item.id}`}
                />
            {/each}
        </div>
    </section>
{/if}

<style>
    /* Styles specific to the list layout itself, if needed. 
       Item styles should be handled by the passed itemComponent. */
</style>
