<script lang="ts">
    export let title: string;
    export let items: string[]; // List of tags
    export let activeItems: string[]; // List of active tags
    export let toggleItem: (item: string) => void; // Function to toggle a tag
    export let counts: { [key: string]: number | undefined } | undefined; // Tag counts

    // Helper to safely get count
    function getCount(item: string): number {
        return counts?.[item] ?? 0;
    }
</script>

<div class="filter-section">
    <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">{title}</h3>
    <div class="flex flex-wrap gap-2">
        {#each items as item}
            <button 
                class="tag-button"
                class:active={activeItems.includes(item)}
                on:click={() => toggleItem(item)}
            >
                {item}
                {#if counts !== undefined}
                <span class="tag-count">({getCount(item)})</span>
                {/if}
            </button>
        {/each}
    </div>
</div>

<style>
    /* Styles moved from sidebar components */
    .filter-section {
        margin-bottom: var(--spacing-6, 1.5rem);
    }

    .text-dark {
         color: var(--color-gray-800, #2d3748);
    }

    .font-weight-600 {
        font-weight: var(--font-weight-semibold, 600);
    }

    .mb-3 {
        margin-bottom: var(--spacing-3, 0.75rem);
    }

    .pb-2 {
        padding-bottom: var(--spacing-2, 0.5rem);
    }

    .border-gray-200 {
        border-bottom: 1px solid var(--color-gray-200, #e2e8f0);
    }

    .flex {
        display: flex;
    }

    .flex-wrap {
        flex-wrap: wrap;
    }

    .gap-2 {
        gap: var(--spacing-2, 0.5rem);
    }

    .tag-button {
        background-color: var(--color-gray-200, #e2e8f0);
        color: var(--color-gray-700, #4a5568);
        padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
        border-radius: var(--border-radius-full, 9999px);
        font-size: var(--font-size-xs, 0.8rem);
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: var(--spacing-2, 0.5rem);
    }
    
    .tag-button.active {
        background-color: var(--color-primary, #2b6cb0);
        color: var(--color-white, white);
    }
    
    .tag-count {
        opacity: 0.7;
        margin-left: var(--spacing-px, 2px);
        font-size: var(--font-size-xxs, 0.7rem);
    }
</style> 