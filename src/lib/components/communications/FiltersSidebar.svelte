<script lang="ts">
    import { 
        activeFilters, 
        filterOptions, 
        toggleTypeFilter, 
        updateYearRange,
        resetYearRange,
        toggleTagFilter, 
        toggleLanguageFilter, 
        toggleCountryFilter,
        toggleAuthorFilter,
        clearAllFilters,
        tagCounts,
        countryCounts,
        authorCounts
    } from '$lib/data/communications/filters';
    import { communicationsByType, communicationsByCountry } from '$lib/data/communications';
    import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
    import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';
    import FilterSectionButtons from '$lib/components/filters/FilterSectionButtons.svelte';

    // Human-readable labels for communication types
    const typeLabels: {[key: string]: string} = {
        'conference': 'Conferences',
        'workshop': 'Workshops',
        'seminar': 'Seminars',
        'lecture': 'Lectures',
        'panel': 'Panels',
        'event': 'Academic Events'
    };
    
    // Ensure we have values to avoid undefined errors
    $: types = $filterOptions?.types || [];
    $: years = $filterOptions?.years || [];
    $: countries = $filterOptions?.countries || [];
    $: languages = $filterOptions?.languages || [];
    $: tags = $filterOptions?.tags || [];
    $: authors = $filterOptions?.authors || [];

    // Calculate counts for communication types
    $: typeCounts = types.reduce((acc, type) => {
        acc[type] = communicationsByType?.[type]?.length || 0;
        return acc;
    }, {} as { [key: string]: number });

    // Ensure years are sorted ascending for the slider
    $: sortedYearsAsc = years.slice().sort((a, b) => a - b);
</script>

<aside class="p-6 border rounded shadow-sm sticky-top">
    {#if types.length > 0}
    <FilterSectionCheckbox 
        title="Event Types"
        items={types}
        itemLabels={typeLabels}
        activeItems={$activeFilters?.types || []}
        toggleItem={toggleTypeFilter}
        counts={typeCounts}
    />
    {/if}

    {#if years.length > 0}
    <FilterSectionRangeSlider 
        title="Years"
        allYears={sortedYearsAsc}
        activeRange={$activeFilters?.yearRange || null}
        updateRange={updateYearRange}
        resetRange={resetYearRange}
    />
    {/if}

    {#if authors.length > 0}
    <div class="authors-scrollable">
        <FilterSectionCheckbox 
            title="Co-authors / Participants"
            items={authors}
            activeItems={$activeFilters?.authors || []}
            toggleItem={toggleAuthorFilter}
            counts={$authorCounts}
        />
    </div>
    {/if}

    {#if countries.length > 0}
    <div class="authors-scrollable">
        <FilterSectionCheckbox 
            title="Countries"
            items={countries}
            activeItems={$activeFilters?.countries || []}
            toggleItem={toggleCountryFilter}
            counts={$countryCounts}
        />
    </div>
    {/if}

    {#if languages.length > 0}
    <FilterSectionCheckbox 
        title="Languages"
        items={languages}
        activeItems={$activeFilters?.languages || []}
        toggleItem={toggleLanguageFilter}
        counts={undefined}
    />
    {/if}

    {#if tags.length > 0}
    <FilterSectionButtons 
        title="Tags"
        items={tags}
        activeItems={$activeFilters?.tags || []}
        toggleItem={toggleTagFilter}
        counts={$tagCounts}
    />
    {/if}

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
    /* Base (Mobile) styles */
    .sticky-top {
        position: static;
        max-height: none;
        overflow-y: visible;
        margin-bottom: var(--spacing-8, 2rem);
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
            scrollbar-width: thin;
            scrollbar-color: var(--color-text-light) transparent;
        }

        /* Subtle scrollbar styling for WebKit browsers using CSS Variables */
        .sticky-top::-webkit-scrollbar {
            width: var(--scrollbar-width, var(--spacing-1-5, 6px));
        }

        .sticky-top::-webkit-scrollbar-track {
            background: transparent;
        }

        .sticky-top::-webkit-scrollbar-thumb {
            background-color: var(--color-text-light);
            border-radius: var(--scrollbar-thumb-radius, var(--border-radius-sm, 3px));
            transition: background-color 0.2s ease-in-out;
        }

        .sticky-top:hover::-webkit-scrollbar-thumb {
            background-color: var(--color-text);
        }
    }

    .authors-scrollable { /* Renamed back from countries-scrollable */
        max-height: 200px;
        overflow-y: auto;
        padding-right: var(--spacing-1, 5px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2, 0.5rem);
    }
    
    .clear-filters {
        width: 100%;
        padding: var(--spacing-2, 0.5rem);
        background-color: var(--color-border);
        color: var(--color-text);
        border: none;
        border-radius: var(--border-radius-md, 4px);
        cursor: pointer;
        font-size: var(--font-size-sm, 0.9rem);
        transition: all 0.2s;
    }
    
    .clear-filters:hover {
        background-color: var(--color-text-light);
        color: var(--color-background);
    }
</style> 