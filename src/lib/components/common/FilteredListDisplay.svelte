<script lang="ts">
    import { type ComponentProps, type ComponentType } from 'svelte';
    
    // Generic type to represent any store with a subscribe method
    type Readable<T> = { subscribe: (run: (value: T) => void) => () => void };
    
    // Use a more generic type definition that doesn't rely on SvelteComponent
    type AnyComponentType = any;

    interface Props {
        filteredItems: Readable<any[]>; // Store of filtered items
        itemComponent: AnyComponentType; // Component to render each item
        itemComponentProps?: ComponentProps<any>; // Props to pass to each item component
        areFiltersActive?: boolean; // Whether filters are active
        clearAllFilters: () => void; // Function to clear all filters
        emptyStateMessage?: string; // Message for empty state
        emptyStateNoFiltersMessage?: string; // Message when no filters but still empty
        itemPropName?: string; // The prop name used by the item component (e.g., "communication", "publication")
        onitemrequest?: ((event: CustomEvent) => void) | null; // Optional event handler for item events (e.g., filter requests)
    }
      
    let { 
        filteredItems, 
        itemComponent, 
        itemComponentProps = {}, 
        areFiltersActive = false, 
        clearAllFilters, 
        emptyStateMessage = "No items found matching your criteria.", 
        emptyStateNoFiltersMessage = "Try adding some items to the system.", 
        itemPropName = "item",
        onitemrequest = null
    }: Props = $props();
</script>

<div>
    {#if $filteredItems && $filteredItems.length > 0}
        <ul class="list-none p-0 space-y-8 mt-6">
            {#each $filteredItems as item (item.id)}
                {#if onitemrequest}
                    {@const Component = itemComponent}
                    <Component 
                        {...itemComponentProps}
                        {...{[itemPropName]: item}}
                        onfilterrequest={onitemrequest}
                        onclick={onitemrequest}
                        oncustomaction={onitemrequest}
                    />
                {:else}
                    {@const Component = itemComponent}
                    <Component 
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
                    onclick={clearAllFilters} 
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
