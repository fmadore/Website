<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { filteredPublications, activeFilters } from '$lib/data/publications/filters';
    import FiltersSidebar from '$lib/components/publications/FiltersSidebar.svelte';
    import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues focusing on Islam in West Africa."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div class="publications-container">
    <FiltersSidebar />

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
                <PublicationItem {publication} />
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
    
    /* Responsive adjustments */
    @media (max-width: 900px) {
        .publications-container {
            grid-template-columns: 1fr;
        }
    }
</style> 