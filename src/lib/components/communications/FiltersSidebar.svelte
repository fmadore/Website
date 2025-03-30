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
        clearAllFilters,
        tagCounts,
        countryCounts
    } from '$lib/data/communications/filters';
    import { communicationsByType, communicationsByCountry } from '$lib/data/communications';
    import FilterSectionCheckbox from '$lib/components/filters/FilterSectionCheckbox.svelte';
    import FilterSectionRangeSlider from '$lib/components/filters/FilterSectionRangeSlider.svelte';

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

    // Calculate counts for communication types
    $: typeCounts = types.reduce((acc, type) => {
        acc[type] = communicationsByType?.[type]?.length || 0;
        return acc;
    }, {} as { [key: string]: number });

    // Ensure years are sorted ascending for the slider
    $: sortedYearsAsc = years.slice().sort((a, b) => a - b);
</script>

<aside class="p-6 bg-gray-50 border border-gray-200 rounded shadow-sm sticky-top">
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

    {#if countries.length > 0}
    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Countries</h3>
        <div class="countries-scrollable">
            {#each countries as country}
                <div class="mb-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters?.countries?.includes(country) || false} 
                            on:change={() => toggleCountryFilter(country)}
                        />
                        <span>{country}</span>
                        <span class="text-light text-sm">({$countryCounts?.[country] || communicationsByCountry?.[country]?.length || 0})</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>
    {/if}

    {#if languages.length > 0}
    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Languages</h3>
        <div class="flex-column gap-2">
            {#each languages as language}
                <div class="mb-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters?.languages?.includes(language) || false} 
                            on:change={() => toggleLanguageFilter(language)}
                        />
                        <span>{language}</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>
    {/if}

    {#if tags.length > 0}
    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Tags</h3>
        <div class="flex flex-wrap gap-2">
            {#each tags as tag}
                <button 
                    class="tag-button"
                    class:active={$activeFilters?.tags?.includes(tag) || false}
                    on:click={() => toggleTagFilter(tag)}
                >
                    {tag}
                    <span class="tag-count">({$tagCounts?.[tag] || 0})</span>
                </button>
            {/each}
        </div>
    </div>
    {/if}

    <button class="clear-filters" on:click={clearAllFilters}>
        Clear all filters
    </button>
</aside>

<style>
    /* Custom component styles using CSS variables */
    .sticky-top {
        position: sticky;
        top: var(--spacing-8, 2rem);
        height: fit-content;
    }
    
    .filter-section {
        margin-bottom: var(--spacing-6, 1.5rem);
    }
    
    .countries-scrollable { /* Renamed from authors-scrollable */
        max-height: 200px;
        overflow-y: auto;
        padding-right: var(--spacing-1, 5px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2, 0.5rem);
    }
    
    .border-gray-200 {
        border-bottom: 1px solid #e2e8f0;
    }
    
    .font-weight-600 {
        font-weight: 600;
    }
    
    .flex-column {
        display: flex;
        flex-direction: column;
    }
    
    .items-center {
        align-items: center;
    }
    
    .gap-2 {
        gap: 0.5rem;
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
    
    .clear-filters {
        width: 100%;
        padding: var(--spacing-2, 0.5rem);
        background-color: var(--color-gray-200, #e2e8f0);
        color: var(--color-gray-700, #4a5568);
        border: none;
        border-radius: var(--border-radius-md, 4px);
        cursor: pointer;
        font-size: var(--font-size-sm, 0.9rem);
        transition: all 0.2s;
    }
    
    .clear-filters:hover {
        background-color: var(--color-gray-300, #cbd5e0);
    }
    
    .text-sm {
        font-size: 0.875rem;
    }
    
    /* Media query */
    @media (max-width: 900px) {
        .sticky-top {
            position: static;
            margin-bottom: var(--spacing-8, 2rem);
        }
    }
</style> 