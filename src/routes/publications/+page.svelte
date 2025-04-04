<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredPublications, 
        activeFilters,
        toggleTagFilter,
        toggleAuthorFilter,
        toggleTypeFilter,
        toggleProjectFilter,
        clearAllFilters,
        setTypes,
        setTags,
        setLanguages,
        setAuthors,
        setCountries,
        setProjects,
        setYearRange
    } from '$lib/data/publications/filters';
    import FiltersSidebar from '$lib/components/publications/FiltersSidebar.svelte';
    import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync';
    import Sorter from '$lib/components/common/Sorter.svelte';
    import { sortItems } from '$lib/utils/sortUtils';
    import { writable, derived } from 'svelte/store';

    // State for the current sort order
    const activeSort = writable<'date' | 'title'>('date'); // Use a writable store for sort order

    // Create a derived store for sorted publications
    const sortedPublications = derived(
        [filteredPublications, activeSort], // Depends on these stores
        ([$filteredPublications, $activeSort]) => sortItems($filteredPublications, $activeSort)
    );

    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = event.detail;
        console.log('Filter request received:', type, value);
        if (type === 'tag') {
            toggleTagFilter(value);
        } else if (type === 'author') {
            toggleAuthorFilter(value);
        } else if (type === 'type') {
            toggleTypeFilter(value);
        } else if (type === 'project') {
            toggleProjectFilter(value);
        }
    }

    // Handler for the sortChange event from the Sorter component
    function handleSortChange(event: CustomEvent<{ sortBy: 'date' | 'title' }>) {
        activeSort.set(event.detail.sortBy); // Update the store value
    }

    // Helper to check if any filters are active
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.values(filters).some(val => 
            (Array.isArray(val) && val.length > 0) || 
            (val !== null && val !== undefined && typeof val === 'object' && Object.keys(val).length > 0) ||
            (typeof val !== 'object' && val !== null && val !== undefined) 
        );
    }

    // Prepare setters object for the action
    const filterSetters = {
        setTypes,
        setTags,
        setLanguages,
        setAuthors,
        setCountries,
        setProjects,
        setYearRange
    };
</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues focusing on Islam in West Africa."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div 
    class="teaching-container" 
    use:urlFilterSync={{ filtersStore: activeFilters, setters: filterSetters }}
>
    <div class="main-content">
        <PageHeader title="Publications" />

        <EntityListPageLayout>
            <!-- Sidebar slot for filters -->
            <svelte:fragment slot="sidebar">
                <FiltersSidebar />
            </svelte:fragment>
            
            <!-- Default slot for main content -->
            <div class="flex justify-end mb-4">
                <Sorter activeSort={$activeSort} on:sortChange={handleSortChange} />
            </div>
            <FilteredListDisplay
                filteredItems={sortedPublications}
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
</div> 

<style>
    .teaching-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4); /* Same padding as teaching */
    }
    
    .main-content {
        width: 100%;
    }

    /* You might need other styles specific to the publications page here */
    /* For example, if you had custom padding or margins before, 
       they might need adjustment or re-integration if they weren't 
       part of the standard 'container' styles. */
</style> 