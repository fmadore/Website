<script lang="ts">
    import { type ComponentProps, type ComponentType } from 'svelte';
    
    // Generic type to represent any store with a subscribe method
    type Readable<T> = { subscribe: (run: (value: T) => void) => () => void };
    
    // Use a more generic type definition that doesn't rely on SvelteComponent
    type AnyComponentType = any;
    
    export let filteredItems: Readable<any[]>; // Store of filtered items
    export let itemComponent: AnyComponentType; // Component to render each item
    export let itemComponentProps: ComponentProps<any> = {}; // Props to pass to each item component
    export let areFiltersActive: boolean = false; // Whether filters are active
    export let clearAllFilters: () => void; // Function to clear all filters
    export let emptyStateMessage = "No items found matching your criteria."; // Message for empty state
    export let emptyStateNoFiltersMessage = "Try adding some items to the system."; // Message when no filters but still empty
    export let itemPropName = "item"; // The prop name used by the item component (e.g., "communication", "publication")
    
    // Optional event handler for item events (e.g., filter requests)
    export let onItemEvent: ((event: CustomEvent) => void) | null = null;
</script>

<div>
    {#if $filteredItems && $filteredItems.length > 0}
        <ul class="list-none p-0 space-y-8 mt-6">
            {#each $filteredItems as item (item.id)}
                {#if onItemEvent}
                    <svelte:component 
                        this={itemComponent} 
                        {...itemComponentProps}
                        {...{[itemPropName]: item}}
                        on:filterrequest={onItemEvent}
                        on:click={onItemEvent}
                        on:customaction={onItemEvent}
                    />
                {:else}
                    <svelte:component 
                        this={itemComponent} 
                        {...itemComponentProps}
                        {...{[itemPropName]: item}}
                    />
                {/if}
            {/each}
        </ul>
    {:else}
        <div class="p-8 bg-gray-50 rounded text-center mt-6">
            <p>{emptyStateMessage}</p>
            {#if areFiltersActive}
                <button 
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition btn btn-secondary btn-sm"
                    on:click={clearAllFilters} 
                >
                    Clear all filters
                </button>
            {:else if !areFiltersActive}
                <p class="mt-2 text-sm text-gray-500">
                    {emptyStateNoFiltersMessage}
                </p>
            {/if}
        </div>
    {/if}
</div>

<style>
    /* Styles for status-bar-container and clear-filters-inline removed */
</style>
