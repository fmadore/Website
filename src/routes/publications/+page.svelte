<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        activeFilters, 
        filterOptions, 
        filteredPublications,
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
    import type { Publication } from '$lib/types';

    // Human-readable labels for publication types
    const typeLabels: {[key: string]: string} = {
        'book': 'Books',
        'article': 'Journal Articles',
        'chapter': 'Book Chapters',
        'special-issue': 'Special Issues'
    };
</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues focusing on Islam in West Africa."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div class="publications-container">
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

    <main class="publications-content">
        <h1 class="publications-title">Publications</h1>
        
        <div class="results-info">
            Showing {$filteredPublications.length} publications
            {#if Object.values($activeFilters).some(arr => arr.length > 0)}
                <span class="filters-applied">(Filters applied)</span>
            {/if}
        </div>
        
        <ul class="publication-list">
            {#each $filteredPublications as publication}
                <li class="publication-item">
                    <div class="publication-layout">
                        {#if publication.heroImage?.src || publication.image}
                            <div class="publication-image">
                                <img 
                                    src={publication.heroImage?.src || publication.image} 
                                    alt={publication.heroImage?.alt || `Cover of ${publication.title}`}
                                    class="cover-image"
                                />
                                {#if publication.heroImage?.caption}
                                    <div class="image-caption">{publication.heroImage.caption}</div>
                                {/if}
                            </div>
                        {/if}
                        
                        <div class="publication-content">
                            <div class="publication-type-badge">
                                {typeLabels[publication.type] || publication.type}
                            </div>
                            
                            <div class="publication-title">
                                <a href={publication.url}>
                                    {publication.title}
                                </a>
                            </div>
                            
                            {#if publication.type === 'book'}
                                <p class="publication-meta">
                                    {#if publication.isEditedVolume}
                                        Edited by 
                                        {#if publication.editors && typeof publication.editors === 'string'}
                                            <!-- Parse editor names from string format -->
                                            {#each publication.editors.split(' and ').map(name => name.trim()) as editor, i}
                                                {#if editor === "Frédérick Madore"}
                                                    {editor}
                                                {:else}
                                                    <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                                        {editor}
                                                    </button>
                                                {/if}
                                                {#if i < publication.editors.split(' and ').length - 1} and {/if}
                                            {/each}
                                        {:else if Array.isArray(publication.editors)}
                                            <!-- Handle editors as an array -->
                                            {#each publication.editors as editor, i}
                                                {#if editor === "Frédérick Madore"}
                                                    {editor}
                                                {:else}
                                                    <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                                        {editor}
                                                    </button>
                                                {/if}
                                                {#if i < publication.editors.length - 1}, {/if}
                                            {/each}
                                        {:else}
                                            Unknown
                                        {/if}. {publication.publisher}, {publication.placeOfPublication}, {publication.year}
                                        {#if publication.series}
                                            <br>{publication.series}
                                        {/if}
                                    {:else}
                                        {#each publication.authors as author, i}
                                            {#if author === "Frédérick Madore"}
                                                {author}
                                            {:else}
                                                <button class="author-link" on:click={() => toggleAuthorFilter(author)}>
                                                    {author}
                                                </button>
                                            {/if}
                                            {#if i < publication.authors.length - 1}, {/if}
                                        {/each}. {publication.publisher}, {publication.placeOfPublication}, {publication.year}
                                    {/if}
                                    {#if publication.isbn}
                                        <br>ISBN: {publication.isbn}
                                    {/if}
                                </p>
                            {:else if publication.type === 'article'}
                                <p class="publication-meta">
                                    {#each publication.authors as author, i}
                                        {#if author === "Frédérick Madore"}
                                            {author}
                                        {:else}
                                            <button class="author-link" on:click={() => toggleAuthorFilter(author)}>
                                                {author}
                                            </button>
                                        {/if}
                                        {#if i < publication.authors.length - 1}, {/if}
                                    {/each}. {publication.journal}, {publication.year}
                                    {#if publication.volume}
                                        <br>Vol. {publication.volume}
                                        {#if publication.issue}
                                            , No. {publication.issue}
                                        {/if}
                                    {/if}
                                    {#if publication.pages}
                                        , pp. {publication.pages}
                                    {/if}
                                </p>
                            {:else if publication.type === 'chapter'}
                                <p class="publication-meta">
                                    {#each publication.authors as author, i}
                                        {#if author === "Frédérick Madore"}
                                            {author}
                                        {:else}
                                            <button class="author-link" on:click={() => toggleAuthorFilter(author)}>
                                                {author}
                                            </button>
                                        {/if}
                                        {#if i < publication.authors.length - 1}, {/if}
                                    {/each}. In <em>{publication.book}</em>, edited by 
                                    {#if publication.editors && typeof publication.editors === 'string'}
                                        <!-- Parse editor names from string format -->
                                        {#each publication.editors.split(' and ').map(name => name.trim()) as editor, i}
                                            {#if editor === "Frédérick Madore"}
                                                {editor}
                                            {:else}
                                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                                    {editor}
                                                </button>
                                            {/if}
                                            {#if i < publication.editors.split(' and ').length - 1} and {/if}
                                        {/each}
                                    {:else if Array.isArray(publication.editors)}
                                        <!-- Handle editors as an array -->
                                        {#each publication.editors as editor, i}
                                            {#if editor === "Frédérick Madore"}
                                                {editor}
                                            {:else}
                                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                                    {editor}
                                                </button>
                                            {/if}
                                            {#if i < publication.editors.length - 1}, {/if}
                                        {/each}
                                    {:else}
                                        Unknown
                                    {/if}. 
                                    {publication.publisher}, {publication.placeOfPublication}, {publication.year}
                                    {#if publication.pages}
                                        , pp. {publication.pages}
                                    {/if}
                                </p>
                            {:else if publication.type === 'special-issue'}
                                <p class="publication-meta">
                                    Edited by 
                                    {#if publication.editors && typeof publication.editors === 'string'}
                                        <!-- Parse editor names from string format -->
                                        {#each publication.editors.split(' and ').map(name => name.trim()) as editor, i}
                                            {#if editor === "Frédérick Madore"}
                                                {editor}
                                            {:else}
                                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                                    {editor}
                                                </button>
                                            {/if}
                                            {#if i < publication.editors.split(' and ').length - 1} and {/if}
                                        {/each}
                                    {:else if Array.isArray(publication.editors)}
                                        <!-- Handle editors as an array -->
                                        {#each publication.editors as editor, i}
                                            {#if editor === "Frédérick Madore"}
                                                {editor}
                                            {:else}
                                                <button class="author-link" on:click={() => toggleAuthorFilter(editor)}>
                                                    {editor}
                                                </button>
                                            {/if}
                                            {#if i < publication.editors.length - 1}, {/if}
                                        {/each}
                                    {:else}
                                        Unknown
                                    {/if}. <em>{publication.journal}</em>, {publication.volume}
                                    {#if publication.publisher}
                                        , {publication.publisher}
                                    {/if}
                                    , {publication.date}
                                </p>
                                {#if publication.additionalUrls && publication.additionalUrls.length > 0}
                                    <p class="additional-urls">
                                        Additional links: 
                                        {#each publication.additionalUrls as link, i}
                                            <a href={link.url} class="additional-link">{link.label}</a>
                                            {#if i < publication.additionalUrls.length - 1}, {/if}
                                        {/each}
                                    </p>
                                {/if}
                            {/if}
                            
                            {#if publication.abstract}
                                <p class="publication-abstract">{publication.abstract}</p>
                            {/if}
                            
                            {#if publication.tags && publication.tags.length > 0}
                                <div class="publication-tags">
                                    {#each publication.tags as tag}
                                        <button class="tag" on:click={() => toggleTagFilter(tag)}>
                                            {tag}
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    </main>
</div>

<style>
    .publications-container {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 2rem;
    }
    
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
    
    .publications-content {
        flex: 1;
    }
    
    .publications-title {
        margin-bottom: 1rem;
        color: #2d3748;
        font-size: 2rem;
    }
    
    .results-info {
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        color: #4a5568;
    }
    
    .filters-applied {
        font-style: italic;
    }
    
    .publication-list {
        list-style: none;
        padding: 0;
    }
    
    .publication-item {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .publication-layout {
        display: flex;
        flex-direction: row;
        gap: 1.5rem;
    }
    
    .publication-image {
        flex: 0 0 150px;
    }
    
    .cover-image {
        width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .image-caption {
        font-size: 0.75rem;
        color: #718096;
        margin-top: 0.5rem;
        text-align: center;
    }
    
    .publication-content {
        flex: 1;
    }
    
    .publication-type-badge {
        display: inline-block;
        background-color: #ebf4ff;
        color: #2c5282;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }
    
    .publication-title {
        font-weight: 600;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }
    
    .publication-title a {
        color: #2b6cb0;
        text-decoration: none;
    }
    
    .publication-title a:hover {
        text-decoration: underline;
    }
    
    .publication-meta {
        color: #4a5568;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .publication-abstract {
        color: #4a5568;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
    }
    
    .publication-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .tag {
        background-color: #e2e8f0;
        color: #4a5568;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        border: none;
        cursor: pointer;
    }
    
    .tag:hover {
        background-color: #cbd5e0;
    }
    
    .additional-urls {
        color: #4a5568;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .additional-link {
        color: #2b6cb0;
        text-decoration: none;
    }
    
    .additional-link:hover {
        text-decoration: underline;
    }
    
    .author-link {
        background: none;
        border: none;
        padding: 0;
        color: #2b6cb0;
        font-size: inherit;
        cursor: pointer;
        text-decoration: none;
        font-family: inherit;
    }
    
    .author-link:hover {
        text-decoration: underline;
    }
    
    /* Responsive adjustments */
    @media (max-width: 900px) {
        .publications-container {
            grid-template-columns: 1fr;
        }
        
        .filters-sidebar {
            position: static;
            margin-bottom: 2rem;
        }
    }
    
    @media (max-width: 768px) {
        .publication-layout {
            flex-direction: column;
        }
        
        .publication-image {
            flex: 0 0 auto;
            margin-bottom: 1rem;
            max-width: 200px;
        }
    }
</style> 