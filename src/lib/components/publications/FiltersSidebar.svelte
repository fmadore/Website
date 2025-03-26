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

<aside class="filters-sidebar">
    <div class="filter-section">
        <h3 class="filter-title">Publication Types</h3>
        <div class="filter-options">
            {#each $filterOptions.types as type}
                <div class="filter-option">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.types.includes(type)} 
                            on:change={() => toggleTypeFilter(type)}
                        />
                        <span>{typeLabels[type] || type}</span>
                        <span class="count">({publicationsByType[type]?.length || 0})</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="filter-section">
        <h3 class="filter-title">Years</h3>
        <div class="filter-options years-grid">
            {#each $filterOptions.years as year}
                <div class="filter-option year-option">
                    <label>
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
        <h3 class="filter-title">Co-Authors</h3>
        <div class="filter-options authors-list">
            {#each $filterOptions.authors as author}
                <div class="filter-option">
                    <label>
                        <input 
                            type="checkbox" 
                            checked={$activeFilters.authors.includes(author)} 
                            on:change={() => toggleAuthorFilter(author)}
                        />
                        <span>{author}</span>
                        <span class="count">({$authorCounts[author] || 0})</span>
                    </label>
                </div>
            {/each}
        </div>
    </div>

    <div class="filter-section">
        <h3 class="filter-title">Languages</h3>
        <div class="filter-options">
            {#each $filterOptions.languages as language}
                <div class="filter-option">
                    <label>
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
        <h3 class="filter-title">Tags</h3>
        <div class="filter-options tags-cloud">
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
    .filters-sidebar {
        position: sticky;
        top: 2rem;
        height: fit-content;
        padding: 1.5rem;
        background-color: #f7fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }
    
    .filter-section {
        margin-bottom: 1.5rem;
    }
    
    .filter-title {
        font-size: 1rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .filter-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .years-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: 0.5rem;
    }
    
    .authors-list {
        max-height: 200px;
        overflow-y: auto;
        padding-right: 5px;
    }
    
    .authors-list::-webkit-scrollbar {
        width: 4px;
    }
    
    .authors-list::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    .authors-list::-webkit-scrollbar-thumb {
        background: #c5c5c5;
        border-radius: 4px;
    }
    
    .filter-option label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .count {
        color: #718096;
        font-size: 0.8rem;
    }
    
    .tags-cloud {
        display: flex;
        flex-wrap: wrap;
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
    }
    
    .tag-button.active {
        background-color: #2b6cb0;
        color: white;
    }
    
    .tag-count {
        opacity: 0.7;
        margin-left: 2px;
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
    
    /* Responsive adjustments for smaller screens */
    @media (max-width: 900px) {
        .filters-sidebar {
            position: static;
            margin-bottom: 2rem;
        }
    }
</style> 