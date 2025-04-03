<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredPublications, 
        activeFilters,
        toggleTagFilter,
        toggleAuthorFilter,
        clearAllFilters
    } from '$lib/data/publications/filters';
    import FiltersSidebar from '$lib/components/publications/FiltersSidebar.svelte';
    import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';

    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = event.detail;
        console.log('Filter request received:', type, value);
        if (type === 'tag') {
            toggleTagFilter(value);
        } else if (type === 'author') {
            toggleAuthorFilter(value);
        }
    }

    // Helper to check if any filters are active
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.values(filters).some(val => 
            (Array.isArray(val) && val.length > 0) || 
            (val !== null && val !== undefined)
        );
    }
</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues focusing on Islam in West Africa."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div class="container mx-auto py-6">
    <PageHeader title="Publications" />

    <EntityListPageLayout>
        <!-- Sidebar slot for filters -->
        <svelte:fragment slot="sidebar">
            <FiltersSidebar />
        </svelte:fragment>
        
        <!-- Default slot for main content -->
        <FilteredListDisplay
            filteredItems={filteredPublications}
            itemComponent={PublicationItem}
            itemPropName="publication"
            entityName="publications"
            areFiltersActive={areFiltersActive($activeFilters)}
            {clearAllFilters}
            emptyStateNoFiltersMessage="No publications found. Try adding some publications to the system."
            onItemEvent={handleFilterRequest}
        />
    </EntityListPageLayout>
</div> 