<script lang="ts">
    import { ArrowDownAZ, SortDesc } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';

    export let activeSort: 'date' | 'title' = 'date'; // Default sort

    const dispatch = createEventDispatcher();

    function toggleSort() {
        // Toggle between 'date' and 'title'
        const newSort = activeSort === 'date' ? 'title' : 'date';
        dispatch('sortChange', { sortBy: newSort });
    }

    // Determine button text and title based on the *next* sort state
    let buttonText: string;
    let buttonTitle: string;
    $: {
        if (activeSort === 'date') {
            buttonText = 'Sort A-Z';
            buttonTitle = 'Sort by Title (A-Z)';
        } else {
            buttonText = 'Sort by Date';
            buttonTitle = 'Sort by Date (Newest First)';
        }
    }
</script>

<button 
    on:click={toggleSort}
    class="sorter-button btn btn-outline p-2 flex items-center space-x-1"
    aria-label={buttonTitle}
    title={buttonTitle}
>
    {#if activeSort === 'date'}
        <SortDesc size={18} class="text-primary" />
        <span class="text-sm text-primary">Sorted by Date</span>
    {:else}
        <ArrowDownAZ size={18} class="text-primary" />
        <span class="text-sm text-primary">Sorted A-Z</span>
    {/if}
    <!-- Optional: Add text indicating the next action -->
    <!-- <span class="text-sm text-text-muted ml-2">({buttonText})</span> -->
</button>

<style>
    .sorter-button {
        border-radius: var(--border-radius-md);
        transition: all 0.2s ease;
    }
    .sorter-button:hover {
        background-color: var(--color-border-hover);
    }
    .text-primary {
        color: var(--color-primary);
    }
</style> 