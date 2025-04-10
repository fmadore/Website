<script lang="ts">
    import { ArrowDownAZ, SortDesc } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    import Button from '$lib/components/atoms/Button.svelte'; // Import the Button component

    export let activeSort: 'date' | 'title' = 'date'; // Default sort

    const dispatch = createEventDispatcher();

    function toggleSort() {
        // Toggle between 'date' and 'title'
        const newSort = activeSort === 'date' ? 'title' : 'date';
        dispatch('sortChange', { sortBy: newSort });
    }

    // Determine button text and title based on the *current* sort state for display
    let IconComponent: typeof ArrowDownAZ | typeof SortDesc;
    let labelText: string;
    let ariaTitle: string;
    $: {
        if (activeSort === 'date') {
            IconComponent = SortDesc;
            labelText = 'Sorted by Date';
            ariaTitle = 'Current sort: Date (Newest First). Click to sort by Title (A-Z).';
        } else {
            IconComponent = ArrowDownAZ;
            labelText = 'Sorted A-Z';
            ariaTitle = 'Current sort: Title (A-Z). Click to sort by Date (Newest First).';
        }
    }
</script>

<Button 
    variant="outline-primary" 
    size="sm" 
    on:click={toggleSort}
    ariaLabel={ariaTitle}
    title={ariaTitle} 
    additionalClasses="control-button-rounded"
>
    <svelte:fragment slot="icon">
        <svelte:component this={IconComponent} size={18} />
    </svelte:fragment>
    {labelText}
</Button>

<style>
    :global(.control-button-rounded) {
       border-radius: var(--border-radius-md);
    }
    :global(.control-button-rounded:hover) {
       background-color: var(--color-primary);
       color: white;
    }
</style> 