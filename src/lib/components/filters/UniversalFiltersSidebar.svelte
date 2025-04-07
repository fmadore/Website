<script lang="ts">
    import type { UniversalFilterConfig, FilterSectionConfig } from '$lib/types/filters';
    import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
    import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
    import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';
    import { fly } from 'svelte/transition'; // Import fly transition

    // Prop for the configuration object
    export let config: UniversalFilterConfig;

    // Reactive statement to get the sections array
    $: sections = config?.sections || [];
</script>

<aside class="filter-sidebar sticky-top">
    {#each sections as section, index (section.title)} 
        <!-- Wrap each section for styling and transition -->
        <div class="filter-section" in:fly={{ y: 10, duration: 200, delay: index * 50 }}>
            {#if section.type === 'checkbox'} 
                {#if section.title.toLowerCase().includes('author') || section.title.toLowerCase().includes('countr')}
                    <div class="scrollable-section"> 
                        <FilterSectionCheckbox 
                            title={section.title}
                            items={section.items}
                            itemLabels={section.itemLabels}
                            activeItems={section.activeItems}
                            toggleItem={section.toggleItem}
                            counts={section.counts}
                        />
                    </div>
                {:else}
                    <FilterSectionCheckbox 
                        title={section.title}
                        items={section.items}
                        itemLabels={section.itemLabels}
                        activeItems={section.activeItems}
                        toggleItem={section.toggleItem}
                        counts={section.counts}
                    />
                {/if}
            {:else if section.type === 'range'}
                <FilterSectionRangeSlider 
                    title={section.title}
                    allYears={section.allYears}
                    activeRange={section.activeRange}
                    updateRange={section.updateRange}
                    resetRange={section.resetRange}
                />
            {:else if section.type === 'buttons'}
                <FilterSectionButtons 
                    title={section.title}
                    items={section.items}
                    activeItems={section.activeItems}
                    toggleItem={section.toggleItem}
                    counts={section.counts}
                />
            {/if}
        </div>
    {/each}

    {#if config?.clearAllFilters}
        <div class="clear-button-wrapper" in:fly={{ y: 10, duration: 200, delay: sections.length * 50 }}>
            <button class="clear-filters btn btn-secondary btn-sm" on:click={config.clearAllFilters}>
                Clear all filters
            </button>
        </div>
    {/if}
</aside>

<!-- Reusing the styles from the previous FiltersSidebar components -->
<style>
    /* Main sidebar container - using variables */
    .filter-sidebar {
        background-color: var(--color-sidebar-bg); /* Use the new variable */
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md); /* Slightly larger radius */
        padding: var(--spacing-6); /* Consistent padding */
        box-shadow: var(--shadow-sm); /* Subtle shadow */
        transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; 
    }

    /* Sticky positioning for desktop */
    .sticky-top {
        position: static; 
        max-height: none;
        overflow-y: visible; 
        margin-bottom: var(--spacing-8); 
    }

    @media (min-width: 901px) {
        .sticky-top {
            position: sticky;
            top: var(--spacing-8); 
            max-height: calc(100vh - var(--spacing-8) - 2rem);
            overflow-y: auto;
            margin-bottom: 0;
            scrollbar-width: thin;
            scrollbar-color: var(--color-text-light) transparent;
        }

        .sticky-top::-webkit-scrollbar {
            width: var(--scrollbar-width, 6px); /* Use 6px as default if var not set */
        }

        .sticky-top::-webkit-scrollbar-track {
            background: transparent;
        }

        .sticky-top::-webkit-scrollbar-thumb {
            background-color: var(--color-text-light); 
            border-radius: var(--scrollbar-thumb-radius, var(--border-radius-sm)); 
            transition: background-color 0.2s ease-in-out;
        }

        .sticky-top:hover::-webkit-scrollbar-thumb {
            background-color: var(--color-text); 
        }
    }

    /* Individual filter section styling */
    .filter-section {
        padding-bottom: var(--spacing-4);
        margin-bottom: var(--spacing-4);
        border-bottom: 1px solid var(--color-border);
        /* Remove border and margin from the last section */
    }
    .filter-section:last-of-type {
         border-bottom: none;
         margin-bottom: 0;
         padding-bottom: 0; /* No extra padding at the very end */
    }

    /* Scrollable container for specific sections */
    .scrollable-section {
        max-height: 200px; 
        overflow-y: auto;
        /* Add subtle padding to prevent scrollbar overlap */
        padding-right: var(--spacing-2); 
        /* Margin adjustment might be needed if FilterSectionCheckbox has margin */
        margin-right: calc(-1 * var(--spacing-2)); /* Compensate for padding */
         /* Use theme variables for scrollbar */
        scrollbar-width: thin;
        scrollbar-color: var(--color-text-light) transparent;
    }
     .scrollable-section::-webkit-scrollbar {
        width: var(--scrollbar-width, 6px);
    }
     .scrollable-section::-webkit-scrollbar-track {
        background: transparent;
    }
     .scrollable-section::-webkit-scrollbar-thumb {
        background-color: var(--color-text-light);
        border-radius: var(--scrollbar-thumb-radius, var(--border-radius-sm));
    }
    
    /* Clear button styling - mimic secondary button */
    .clear-button-wrapper {
        margin-top: var(--spacing-6); /* Space above the button */
        padding-top: var(--spacing-4); /* Add padding if last section border is removed */
        border-top: 1px solid var(--color-border); /* Add separator line above */
    }

    .clear-filters {
        /* Inherits btn styles */
        width: 100%; /* Make button full width */
        /* Adjust specific styles if needed, e.g., background */
        /* Using btn-secondary variables implicitly via class */
    }

    /* Override default btn background/border for secondary if needed, 
       or create a specific class. Using btn-secondary directly for now. */
    .clear-filters.btn-secondary {
        background-color: var(--color-secondary);
        border-color: var(--color-secondary);
        color: white;
    }
    .clear-filters.btn-secondary:hover {
         background-color: #374151; /* Slightly darker secondary */
         border-color: #374151;
    }
</style> 