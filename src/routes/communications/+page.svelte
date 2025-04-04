<script lang="ts">
    // import { onMount } from 'svelte'; // Remove onMount import
    // import { page } from '$app/stores'; // Remove page store import
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters, // Keep activeFilters imported
        toggleTagFilter, 
        toggleCountryFilter, 
        toggleTypeFilter, // Keep toggleTypeFilter imported
        // Import setters needed for the action
        setTypes,
        setTags,
        setLanguages,
        setAuthors,
        setCountries,
        setProjects,
        setYearRange,
        clearAllFilters // Ensure clearAllFilters is imported if needed
    } from '$lib/data/communications/filters';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync'; // Import the action
    import Sorter from '$lib/components/common/Sorter.svelte'; // Import the Sorter component
    import { sortItems } from '$lib/utils/sortUtils'; // Import the sorting utility
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte'; // Import FilteredListDisplay
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte'; // Import layout
    import { writable, derived } from 'svelte/store'; // Import writable and derived

    // State for the current sort order
    const activeSort = writable<'date' | 'title'>('date'); // Use a writable store

    // Create a derived store for sorted communications
    const sortedCommunications = derived(
        [filteredCommunications, activeSort],
        ([$filteredCommunications, $activeSort]) => sortItems($filteredCommunications, $activeSort)
    );

    // Function to handle filter requests from items (delegated from CommunicationItem)
    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = event.detail;
        if (type === 'tag') {
            toggleTagFilter(value);
        } else if (type === 'country') {
            toggleCountryFilter(value);
        } else if (type === 'type') { 
            toggleTypeFilter(value);
        }
        // Add other types (like author) if CommunicationItem dispatches them
    }
    
    // Remove the onMount block that handled initial URL params
    /*
    onMount(() => {
        // ... removed code ...
    });
    */

    // Handler for the sortChange event from the Sorter component
    function handleSortChange(event: CustomEvent<{ sortBy: 'date' | 'title' }>) {
        activeSort.set(event.detail.sortBy); // Update the store value
    }

    // Helper to check if any filters are active (reusable)
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.values(filters).some(val => 
            (Array.isArray(val) && val.length > 0) || 
            (val !== null && val !== undefined && typeof val === 'object' && Object.keys(val).length > 0) ||
            (typeof val !== 'object' && val !== null && val !== undefined && val !== '')
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
    title="Communications | Frédérick Madore"
    description="Oral communications by Frédérick Madore, including conference papers, workshops, seminars, lectures, and panels."
    keywords="communications, talks, conferences, workshops, seminars, lectures, panels, Frédérick Madore"
/>

<div 
    class="container mx-auto py-6"
    use:urlFilterSync={{ filtersStore: activeFilters, setters: filterSetters }}
>
    <div class="main-content">
        <PageHeader title="Communications" />

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
                filteredItems={sortedCommunications}
                itemComponent={CommunicationItem}
                itemPropName="communication"
                entityName="communications"
                areFiltersActive={areFiltersActive($activeFilters)}
                {clearAllFilters}
                emptyStateNoFiltersMessage="No communications found. Try adjusting filters or adding new communications."
                onItemEvent={handleFilterRequest}
            />
        </EntityListPageLayout>
    </div>
</div> 