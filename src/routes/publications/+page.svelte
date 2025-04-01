<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredPublications, 
        activeFilters,
        toggleTagFilter,
        toggleAuthorFilter
    } from '$lib/data/publications/filters';
    import FiltersSidebar from '$lib/components/publications/FiltersSidebar.svelte';
    import PublicationItem from '$lib/components/publications/PublicationItem.svelte';

    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = event.detail;
        console.log('Filter request received:', type, value);
        if (type === 'tag') {
            toggleTagFilter(value);
        } else if (type === 'author') {
            toggleAuthorFilter(value);
        }
    }
</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues focusing on Islam in West Africa."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div class="container mx-auto py-6">
    <h1 class="mb-6 text-primary">Publications</h1>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-1">
            <FiltersSidebar />
        </div>

        <main class="md:col-span-3">
            
            <div class="text-light mb-6">
                Showing {$filteredPublications.length} publications
                {#if Object.values($activeFilters).some(val => Array.isArray(val) && val.length > 0) || $activeFilters.yearRange !== null}
                    <span class="text-accent">(Filters applied)</span>
                {/if}
            </div>
            
            <ul class="list-none p-0">
                {#each $filteredPublications as publication}
                    <PublicationItem 
                        {publication} 
                        on:filterrequest={handleFilterRequest}
                    />
                {/each}
            </ul>
        </main>
    </div>
</div> 