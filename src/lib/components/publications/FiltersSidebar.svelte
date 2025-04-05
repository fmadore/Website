<script lang="ts">
    import { 
        activeFilters, 
        displayedAuthors,
        displayedTypes,
        displayedTags,
        displayedLanguages,
        toggleTypeFilter, 
        updateYearRange,
        resetYearRange,
        toggleTagFilter, 
        toggleLanguageFilter, 
        toggleAuthorFilter,
        clearAllFilters,
        tagCounts,
        authorCounts,
        typeCounts,
        languageCounts,
        filterOptions
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

    // Ensure years are sorted ascending for the slider
    $: sortedYearsAsc = $filterOptions.years.slice().sort((a, b) => a - b);
</script>

<aside class="p-6 border rounded shadow-sm sticky-top">
    <FilterSectionCheckbox 
        title="Publication Types"
        items={$displayedTypes}
        itemLabels={typeLabels}
        activeItems={$activeFilters.types}
        toggleItem={toggleTypeFilter}
        counts={$typeCounts}
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
            items={$displayedAuthors}
            activeItems={$activeFilters.authors}
            toggleItem={toggleAuthorFilter}
            counts={$authorCounts}
        />
    </div>

    <FilterSectionCheckbox 
        title="Languages"
        items={$displayedLanguages}
        activeItems={$activeFilters.languages}
        toggleItem={toggleLanguageFilter}
        counts={$languageCounts}
    />

    <FilterSectionButtons 
        title="Tags"
        items={$displayedTags}
        activeItems={$activeFilters.tags}
        toggleItem={toggleTagFilter}
        counts={$tagCounts}
    />

    <button class="clear-filters" on:click={clearAllFilters}>
        Clear all filters
    </button>
</aside>

<style>
    aside.sticky-top {
        background-color: var(--color-background);
        border: 1px solid var(--color-border);
        transition: background-color 0.3s ease, border-color 0.3s ease; 
    }

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
            scrollbar-color: var(--color-text-light) transparent; /* Use theme variable */
        }

        /* Subtle scrollbar styling for WebKit browsers using CSS Variables */
        .sticky-top::-webkit-scrollbar {
            width: var(--scrollbar-width, var(--spacing-1-5, 6px)); /* Use variable for width */
        }

        .sticky-top::-webkit-scrollbar-track {
            background: transparent;
        }

        .sticky-top::-webkit-scrollbar-thumb {
            background-color: var(--color-text-light); /* Use theme variable */
            border-radius: var(--scrollbar-thumb-radius, var(--border-radius-sm, 3px)); /* Use radius variable */
            transition: background-color 0.2s ease-in-out;
        }

        .sticky-top:hover::-webkit-scrollbar-thumb {
            background-color: var(--color-text); /* Use theme variable for hover */
        }
    }
    
    .authors-scrollable {
        /* max-height: 200px;  Removed fixed height */
        /* overflow-y: auto; Removed overflow */
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
        background-color: var(--color-border); /* Use theme variable */
        color: var(--color-text); /* Use theme variable */
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
        background-color: var(--color-text-light); /* Use theme variable */
        color: var(--color-background); /* Contrast */
    }
    
    /* Removed redundant utility classes like .border-gray-200, .font-weight-600, .flex-column, etc. */
    /* Assuming they are globally available */
</style> 