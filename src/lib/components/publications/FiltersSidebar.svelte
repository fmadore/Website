<script lang="ts">
    import { 
        activeFilters, 
        filterOptions, 
        toggleTypeFilter, 
        toggleYearFilter, 
        toggleTagFilter, 
        toggleLanguageFilter, 
        toggleAuthorFilter,
        clearAllFilters,
        tagCounts,
        authorCounts
    } from '$lib/data/publications/filters';
    import { publicationsByType } from '$lib/data/publications';

    // Human-readable labels for publication types
    const typeLabels: {[key: string]: string} = {
        'book': 'Books',
        'article': 'Journal Articles',
        'chapter': 'Book Chapters',
        'special-issue': 'Special Issues'
    };
</script>

<aside class="card bg-gray-50 border-gray-200 p-6 sticky-top">
    <div class="mb-6">
        <h3 class="text-dark font-weight-600 mb-2 pb-2 border-gray-200">Publication Types</h3>
        <div class="flex-column gap-2">
            {#each $filterOptions.types as type}
                <div>
                    <label class="flex items-center gap-2 text-light cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.types.includes(type)} 
                            on:change={() => toggleTypeFilter(type)}
                        />
                        <span>{typeLabels[type] || type}</span>
                        <span class="text-light">({publicationsByType[type]?.length || 0})</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="mb-6">
        <h3 class="text-dark font-weight-600 mb-2 pb-2 border-gray-200">Years</h3>
        <div class="grid grid-cols-3 gap-2">
            {#each $filterOptions.years as year}
                <div>
                    <label class="flex items-center gap-2 text-light cursor-pointer">
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

    <div class="mb-6">
        <h3 class="text-dark font-weight-600 mb-2 pb-2 border-gray-200">Co-Authors</h3>
        <div class="authors-scrollable">
            {#each $filterOptions.authors as author}
                <div>
                    <label class="flex items-center gap-2 text-light cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.authors.includes(author)} 
                            on:change={() => toggleAuthorFilter(author)}
                        />
                        <span>{author}</span>
                        <span class="text-light">({$authorCounts[author] || 0})</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="mb-6">
        <h3 class="text-dark font-weight-600 mb-2 pb-2 border-gray-200">Languages</h3>
        <div class="flex-column gap-2">
            {#each $filterOptions.languages as language}
                <div>
                    <label class="flex items-center gap-2 text-light cursor-pointer">
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

    <div class="mb-6">
        <h3 class="text-dark font-weight-600 mb-2 pb-2 border-gray-200">Tags</h3>
        <div class="flex flex-wrap gap-2">
            {#each $filterOptions.tags as tag}
                <button 
                    class="btn-sm bg-gray-200 hover:bg-gray-300 rounded-full border-0"
                    class:btn-primary={$activeFilters.tags.includes(tag)}
                    on:click={() => toggleTagFilter(tag)}
                >
                    {tag}
                    <span class="text-light">({$tagCounts[tag] || 0})</span>
                </button>
            {/each}
        </div>
    </div>

    <button class="btn btn-block btn-outline-secondary" on:click={clearAllFilters}>
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
    
    .authors-scrollable {
        max-height: 200px;
        overflow-y: auto;
        padding-right: 5px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    /* These are minimal custom styles that aren't covered by our CSS architecture */
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
    
    .rounded-full {
        border-radius: 9999px;
    }
    
    /* Media query */
    @media (max-width: 900px) {
        .sticky-top {
            position: static;
            margin-bottom: 2rem;
        }
    }
</style> 