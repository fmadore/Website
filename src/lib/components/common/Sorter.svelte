<script lang="ts">
    import { ArrowDownAZ, SortDesc, TrendingUp } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    import Button from '$lib/components/atoms/Button.svelte'; // Import the Button component

    interface Props {
        activeSort?: 'date' | 'title' | 'citations'; // Default sort
    }

    let { activeSort = 'date' }: Props = $props();

    const dispatch = createEventDispatcher();

    function toggleSort() {
        // Toggle between 'date', 'title', and 'citations'
        let newSort: 'date' | 'title' | 'citations';
        if (activeSort === 'date') {
            newSort = 'title';
        } else if (activeSort === 'title') {
            newSort = 'citations';
        } else {
            newSort = 'date';
        }
        dispatch('sortChange', { sortBy: newSort });
    }

    // Determine button text and title based on the *current* sort state for display
    let IconComponent = $derived(
        activeSort === 'date'
            ? SortDesc
            : activeSort === 'title'
              ? ArrowDownAZ
              : TrendingUp
    );
    let labelText = $derived(
        activeSort === 'date'
            ? 'Sorted by Date'
            : activeSort === 'title'
              ? 'Sorted A-Z'
              : 'Sorted by Citations'
    );
    let ariaTitle = $derived(
        activeSort === 'date'
            ? 'Current sort: Date (Newest First). Click to sort by Title (A-Z).'
            : activeSort === 'title'
              ? 'Current sort: Title (A-Z). Click to sort by Citations (Most Cited).'
              : 'Current sort: Citations (Most Cited). Click to sort by Date (Newest First).'
    );
</script>

<div class="sorter">
    <Button 
        variant="outline-primary" 
        size="sm" 
        on:click={toggleSort}
        ariaLabel={ariaTitle}
        title={ariaTitle} 
        additionalClasses="control-button-rounded"
    >
        {#snippet icon()}
            
                <IconComponent size={18} />
            
            {/snippet}
        {labelText}
    </Button>
</div>

<style>
    /* Add scoped element for Svelte compiler */
    .sorter {
        display: contents; /* Won\'t affect layout */
    }
    
    /* The .control-button-rounded styles are now handled globally 
       via src/styles/components/buttons.css and imported in app.css */
</style>