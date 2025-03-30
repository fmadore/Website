<script lang="ts">
    import { 
        activeFilters, 
        filterOptions, 
        toggleTypeFilter, 
        updateYearRange,
        resetYearRange,
        toggleTagFilter, 
        toggleLanguageFilter, 
        toggleAuthorFilter,
        clearAllFilters,
        tagCounts,
        authorCounts
    } from '$lib/data/publications/filters';
    import { publicationsByType } from '$lib/data/publications';
    import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
    import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
    import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';

    // Human-readable labels for publication types
    const typeLabels: {[key: string]: string} = {
        'book': 'Books',
        'article': 'Journal Articles',
        'chapter': 'Book Chapters',
        'special-issue': 'Special Issues',
        'report': 'Reports',
        'encyclopedia': 'Encyclopedia Entries',
        'blogpost': 'Blog Posts',
        'dissertation': 'Ph.D. Dissertations'
    };

    // Calculate counts for publication types
    $: typeCounts = $filterOptions.types.reduce((acc, type) => {
        acc[type] = publicationsByType[type]?.length || 0;
        return acc;
    }, {} as { [key: string]: number });

    // Ensure years are sorted ascending for the slider
    $: sortedYearsAsc = $filterOptions.years.slice().sort((a, b) => a - b);
</script>

<aside class="p-6 bg-gray-50 border border-gray-200 rounded shadow-sm sticky-top">
    <FilterSectionCheckbox 
        title="Publication Types"
        items={$filterOptions.types}
        itemLabels={typeLabels}
        activeItems={$activeFilters.types}
        toggleItem={toggleTypeFilter}
        counts={typeCounts}
    />

    <FilterSectionRangeSlider 
        title="Years"
        allYears={sortedYearsAsc}
        activeRange={$activeFilters.yearRange}
        updateRange={updateYearRange}
        resetRange={resetYearRange}
    />

    <div class="authors-scrollable">
        <FilterSectionCheckbox 
            title="Co-Authors"
            items={$filterOptions.authors}
            activeItems={$activeFilters.authors}
            toggleItem={toggleAuthorFilter}
            counts={$authorCounts}
        />
    </div>

    <FilterSectionCheckbox 
        title="Languages"
        items={$filterOptions.languages}
        activeItems={$activeFilters.languages}
        toggleItem={toggleLanguageFilter}
        counts={undefined}
    />

    <FilterSectionButtons 
        title="Tags"
        items={$filterOptions.tags}
        activeItems={$activeFilters.tags}
        toggleItem={toggleTagFilter}
        counts={$tagCounts}
    />

    <button class="clear-filters" on:click={clearAllFilters}>
        Clear all filters
    </button>
</aside>

<style>
    /* Custom component styles using CSS variables */
    /* Base (Mobile) styles: Sidebar is static by default below 900px */
    .sticky-top {
        position: static; 
        max-height: none;
        overflow-y: visible; /* Ensure overflow isn't hidden */
        margin-bottom: var(--spacing-8, 2rem); /* Keep bottom margin for mobile */
    }

    /* Desktop styles (901px and up) */
    @media (min-width: 901px) {
        .sticky-top {
            position: sticky;
            top: var(--spacing-8, 2rem); 
            max-height: calc(100vh - var(--spacing-8, 2rem) - 2rem);
            overflow-y: auto;
            margin-bottom: 0;

            /* Subtle scrollbar styling for Firefox */
            scrollbar-width: thin; /* Or use a variable like var(--scrollbar-width, thin) if defined */
            scrollbar-color: var(--color-gray-400, #a0aec0) transparent; /* thumb track */
        }

        /* Subtle scrollbar styling for WebKit browsers using CSS Variables */
        .sticky-top::-webkit-scrollbar {
            width: var(--scrollbar-width, var(--spacing-1-5, 6px)); /* Use variable for width */
        }

        .sticky-top::-webkit-scrollbar-track {
            background: transparent;
        }

        .sticky-top::-webkit-scrollbar-thumb {
            background-color: var(--color-gray-300, #d1d5db); /* Use color variable */
            border-radius: var(--scrollbar-thumb-radius, var(--border-radius-sm, 3px)); /* Use radius variable */
            transition: background-color 0.2s ease-in-out;
        }

        .sticky-top:hover::-webkit-scrollbar-thumb {
            background-color: var(--color-gray-400, #a0aec0); /* Use color variable for hover */
        }
    }
    
    .authors-scrollable {
        max-height: 200px; /* Keep fixed height or use variable if available */
        overflow-y: auto;
        /* Use spacing variable, e.g., --spacing-1 */
        padding-right: var(--spacing-1, 5px); 
        display: flex;
        flex-direction: column;
        /* Use spacing variable, e.g., --spacing-2 */
        gap: var(--spacing-2, 0.5rem); 
    }
    
    .clear-filters {
        width: 100%;
        /* Use spacing variable, e.g., --spacing-2 */
        padding: var(--spacing-2, 0.5rem);
        /* Use color variables */
        background-color: var(--color-gray-200, #e2e8f0);
        color: var(--color-gray-700, #4a5568);
        border: none;
        /* Use border-radius variable, e.g., --border-radius-md */
        border-radius: var(--border-radius-md, 4px);
        cursor: pointer;
        /* Use font-size variable, e.g., --font-size-sm */
        font-size: var(--font-size-sm, 0.9rem);
        transition: all 0.2s;
    }
    
    .clear-filters:hover {
        /* Use color variable, e.g., --color-gray-300 */
        background-color: var(--color-gray-300, #cbd5e0);
    }
    
    /* Removed redundant utility classes like .border-gray-200, .font-weight-600, .flex-column, etc. */
    /* Assuming they are globally available */
</style> 