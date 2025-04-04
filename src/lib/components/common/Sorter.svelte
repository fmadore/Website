<script lang="ts">
    import { ArrowDownAZ } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';

    export let activeSort: 'date' | 'title' = 'date'; // Default sort

    const dispatch = createEventDispatcher();

    function toggleSort() {
        // Simple toggle for now: default (date) -> title (A-Z)
        const newSort = activeSort === 'date' ? 'title' : 'date';
        dispatch('sortChange', { sortBy: newSort });
    }
</script>

<button 
    on:click={toggleSort}
    class="sorter-button btn btn-outline p-2 flex items-center space-x-1"
    aria-label={activeSort === 'title' ? "Sort by Date (Default)" : "Sort by Title (A-Z)"}
    title={activeSort === 'title' ? "Sort by Date (Default)" : "Sort by Title (A-Z)"}
>
    <ArrowDownAZ size={18} class={activeSort === 'title' ? 'text-primary' : 'text-text-muted'} />
    <span class="text-sm {activeSort === 'title' ? 'text-primary' : 'text-text-muted'}">
        {activeSort === 'title' ? 'Sorted A-Z' : 'Sort A-Z'}
    </span>
</button>

<style>
    .sorter-button {
        border-radius: var(--border-radius-md);
        transition: all 0.2s ease;
    }
    .sorter-button:hover {
        background-color: var(--color-border-hover);
    }
    .text-text-muted {
        color: var(--color-text-muted);
    }
</style> 