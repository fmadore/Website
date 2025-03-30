<script lang="ts">
    export let title: string;
    export let items: string[]; // e.g., ['book', 'article']
    export let itemLabels: { [key: string]: string }; // e.g., {'book': 'Books'}
    export let activeItems: string[]; // The reactive list of active filters (e.g., $activeFilters.types)
    export let toggleItem: (item: string) => void; // Function to toggle an item
    export let counts: { [key: string]: number | undefined } | undefined; // e.g., { 'book': 10, 'article': 5 }

    // Helper to safely get count, defaulting to 0
    function getCount(item: string): number {
        return counts?.[item] ?? 0;
    }
</script>

<div class="filter-section">
    <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">{title}</h3>
    <div class="flex-column gap-2">
        {#each items as item}
            <div class="mb-2">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={activeItems.includes(item)} 
                        on:change={() => toggleItem(item)}
                    />
                    <span>{itemLabels[item] || item}</span>
                    {#if counts !== undefined}
                    <span class="text-light text-sm">({getCount(item)})</span>
                    {/if}
                </label>
            </div>
        {/each}
    </div>
</div>

<!-- Style block removed to rely on global CSS --> 