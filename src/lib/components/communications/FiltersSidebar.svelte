<script lang="ts">
    import { 
        activeFilters, 
        filterOptions, 
        toggleTypeFilter, 
        toggleYearFilter, 
        toggleTagFilter, 
        toggleLanguageFilter, 
        toggleCountryFilter,
        clearAllFilters,
        tagCounts,
        countryCounts
    } from '$lib/data/communications/filters';
    import { communicationsByType, communicationsByCountry } from '$lib/data/communications';

    // Human-readable labels for communication types
    const typeLabels: {[key: string]: string} = {
        'conference': 'Conferences',
        'workshop': 'Workshops',
        'seminar': 'Seminars',
        'lecture': 'Lectures',
        'panel': 'Panels'
    };
</script>

<aside class="p-6 bg-gray-50 border border-gray-200 rounded shadow-sm sticky-top">
    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Event Types</h3>
        <div class="flex-column gap-2">
            {#each $filterOptions.types as type}
                <div class="mb-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.types.includes(type)} 
                            on:change={() => toggleTypeFilter(type)}
                        />
                        <span>{typeLabels[type] || type}</span>
                        <span class="text-light text-sm">({communicationsByType[type]?.length || 0})</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Years</h3>
        <div class="grid grid-cols-2 gap-2">
            {#each $filterOptions.years as year}
                <div class="mb-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.years.includes(year)} 
                            on:change={() => toggleYearFilter(year)}
                        />
                        <span>{year}</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Countries</h3>
        <div class="countries-scrollable">
            {#each $filterOptions.countries as country}
                <div class="mb-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.countries.includes(country)} 
                            on:change={() => toggleCountryFilter(country)}
                        />
                        <span>{country}</span>
                        <span class="text-light text-sm">({$countryCounts[country] || communicationsByCountry[country]?.length || 0})</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Languages</h3>
        <div class="flex-column gap-2">
            {#each $filterOptions.languages as language}
                <div class="mb-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.languages.includes(language)} 
                            on:change={() => toggleLanguageFilter(language)}
                        />
                        <span>{language}</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="filter-section">
        <h3 class="text-dark font-weight-600 mb-3 pb-2 border-gray-200">Tags</h3>
        <div class="flex flex-wrap gap-2">
            {#each $filterOptions.tags as tag}
                <button 
                    class="tag-button"
                    class:active={$activeFilters.tags.includes(tag)}
                    on:click={() => toggleTagFilter(tag)}
                >
                    {tag}
                    <span class="tag-count">({$tagCounts[tag] || 0})</span>
                </button>
            {/each}
        </div>
    </div>

    <button class="clear-filters" on:click={clearAllFilters}>
        Clear all filters
    </button>
</aside>

<style>
    /* Only keep styles that aren't in our CSS architecture */
    .sticky-top {
        position: sticky;
        top: 2rem;
        height: fit-content;
    }
    
    .filter-section {
        margin-bottom: 1.5rem;
    }
    
    .countries-scrollable {
        max-height: 200px;
        overflow-y: auto;
        padding-right: 5px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
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
        background-color: #e2e8f0;
        color: #4a5568;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 0.5rem;
    }
    
    .tag-button.active {
        background-color: #2b6cb0;
        color: white;
    }
    
    .tag-count {
        opacity: 0.7;
        margin-left: 2px;
        font-size: 0.7rem;
    }
    
    .clear-filters {
        width: 100%;
        padding: 0.5rem;
        background-color: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }
    
    .clear-filters:hover {
        background-color: #cbd5e0;
    }
    
    .text-sm {
        font-size: 0.875rem;
    }
    
    /* Media query */
    @media (max-width: 900px) {
        .sticky-top {
            position: static;
            margin-bottom: 2rem;
        }
    }
</style> 