<script lang="ts">
    import type { UniversalFilterConfig, FilterSectionConfig } from '$lib/types/filters';
    import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
    import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
    import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';
    import { fly, slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte'; // Import event dispatcher

    // Prop for the configuration object
    export let config: UniversalFilterConfig;
    
    // Prop to control mobile expansion (controlled by parent)
    export let isExpandedMobile = false; 

    // Reactive statement to get the sections array
    $: sections = config?.sections || [];

    // Setup event dispatcher
    const dispatch = createEventDispatcher();

    // Function to handle clearing filters and notifying parent to collapse
    function handleClearFilters() {
        if (config?.clearAllFilters) {
            config.clearAllFilters();
            dispatch('collapse'); // Dispatch event instead of setting state directly
        }
    }
</script>

<aside class="filter-sidebar sticky-top">
    <!-- Mobile Toggle Button Removed -->

    <!-- Collapsible Filter Sections Wrapper (Mobile) -->
    {#if isExpandedMobile}
        <div class="filter-sections-wrapper" transition:slide={{ duration: 200 }}>
            {#each sections as section, index (section.title)} 
                <div class="filter-section" in:fly={{ y: 10, duration: 200, delay: index * 50 }}>
                    {#if section.type === 'checkbox'} 
                        <FilterSectionCheckbox 
                            title={section.title}
                            items={section.items}
                            itemLabels={section.itemLabels}
                            activeItems={section.activeItems}
                            toggleItem={section.toggleItem}
                            counts={section.counts}
                        />
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

            {#if sections.length > 0}
                <div class="clear-button-wrapper" in:fly={{ y: 10, duration: 200, delay: sections.length * 50 }}>
                    <!-- Use the handler function -->
                    <button class="clear-filters btn btn-secondary btn-sm" on:click={handleClearFilters}>
                        Clear all filters
                    </button>
                </div>
            {/if}
        </div>
    {/if}

    <!-- Always visible on desktop -->
    <div class="filter-sections-wrapper-desktop">
        {#each sections as section, index (section.title)} 
            <div class="filter-section">
                {#if section.type === 'checkbox'} 
                    <FilterSectionCheckbox 
                        title={section.title}
                        items={section.items}
                        itemLabels={section.itemLabels}
                        activeItems={section.activeItems}
                        toggleItem={section.toggleItem}
                        counts={section.counts}
                    />
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

        {#if sections.length > 0}
            <div class="clear-button-wrapper">
                 <button class="clear-filters btn btn-secondary btn-sm" on:click={config.clearAllFilters}>
                    Clear all filters
                </button>
            </div>
        {/if}
    </div>
</aside>

<style>
    /* Main sidebar container - using variables */
    .filter-sidebar {
        background-color: var(--color-sidebar-bg); /* Use the new variable */
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md); /* Slightly larger radius */
        padding: var(--spacing-4); /* Adjusted padding */
        box-shadow: var(--shadow-sm); /* Subtle shadow */
        transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; 
    }

    /* Mobile Toggle Button Styling Removed */
    /*.mobile-toggle { ... }*/

    /* Filter sections wrapper (for mobile collapse) */
    .filter-sections-wrapper {
        display: none; /* Hidden by default on mobile, shown via JS */
        overflow: hidden; /* Needed for slide transition */
    }

    /* Desktop filter sections wrapper */
    .filter-sections-wrapper-desktop {
        display: block; /* Always visible on desktop */
    }

    /* Sticky positioning for desktop */
    .sticky-top {
        position: static; 
        max-height: none;
        overflow-y: visible; 
        margin-bottom: var(--spacing-8); 
    }

    @media (max-width: 900px) { /* Mobile breakpoint */
        .filter-sidebar {
            padding: var(--spacing-4);
            border: none; /* Remove border on mobile */
            box-shadow: none; /* Remove shadow on mobile */
            padding: 0; /* Remove padding on mobile as sections are conditionally rendered */
            background-color: transparent; /* Make background transparent */
        }
        /* Mobile toggle button styles removed */
        .filter-sections-wrapper {
            display: block; /* Allow Svelte's #if to control visibility */
             /* Add back some visual separation if needed */
            background-color: var(--color-sidebar-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
            padding: var(--spacing-4);
            box-shadow: var(--shadow-sm);
            margin-top: var(--spacing-4); /* Add space below the new toggle button */
        }
        .filter-sections-wrapper-desktop {
            display: none; /* Hide the desktop wrapper on mobile */
        }
         /* Remove sticky behavior on mobile */
        .sticky-top {
            position: static; 
            max-height: none;
            overflow-y: visible;
            margin-bottom: 0; /* Removed margin as wrapper handles spacing */
        }
    }

    @media (min-width: 901px) { /* Desktop breakpoint */
         /* Mobile toggle styles removed */
        .filter-sections-wrapper {
            display: none; /* Hide mobile wrapper on desktop */
        }
         .filter-sections-wrapper-desktop {
            display: block; /* Show desktop wrapper */
        }
        .filter-sidebar {
            /* Restore desktop styles potentially overridden by mobile */
             background-color: var(--color-sidebar-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
            padding: var(--spacing-4);
            box-shadow: var(--shadow-sm);
            margin-bottom: 0; /* Reset margin from static */
        }
        .sticky-top {
            position: sticky;
            top: var(--spacing-8); 
            max-height: calc(100vh - var(--spacing-8) - 2rem);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--color-text-light) transparent;
        }

        .sticky-top::-webkit-scrollbar {
            width: var(--scrollbar-width, 6px);
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
    }
    .filter-section:last-of-type {
         border-bottom: none;
         margin-bottom: 0;
         padding-bottom: 0; 
    }

    /* Clear button styling */
    .clear-button-wrapper {
        margin-top: var(--spacing-6); 
        padding-top: var(--spacing-4); 
        border-top: 1px solid var(--color-border); 
    }

    .clear-filters {
        width: 100%; 
    }
    .clear-filters.btn-secondary {
        background-color: var(--color-secondary);
        border-color: var(--color-secondary);
        color: white;
    }
    .clear-filters.btn-secondary:hover {
         background-color: #374151; 
         border-color: #374151;
    }
</style> 