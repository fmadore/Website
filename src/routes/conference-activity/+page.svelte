<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters,
        clearAllFilters,
        // Import setters needed for the action
        setTypes,
        setTags,
        setLanguages,
        setAuthors,
        setCountries,
        setProjects,
        setYearRange
    } from '$lib/data/communications/filters';
    import { allCoordinates } from '$lib/data/communications';
    // Import the Communication type
    import type { Communication } from '$lib/types/communication';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
    import MapVisualization from '$lib/components/communications/MapVisualization.svelte';
    import ToggleButton from '$lib/components/common/ToggleButton.svelte';
    // Import new components
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync'; // Import the action
    import Sorter from '$lib/components/common/Sorter.svelte'; // Import Sorter
    import { sortItems } from '$lib/utils/sortUtils'; // Import sort utility
    import { writable, derived } from 'svelte/store'; // Import stores
    
    let showMap = false; // State for map visibility

    // State for the current sort order
    const activeSort = writable<'date' | 'title'>('date');

    // Create a derived store for sorted communications
    const sortedCommunications = derived(
        [filteredCommunications, activeSort],
        ([$filteredCommunications, $activeSort]) => sortItems($filteredCommunications, $activeSort)
    );

    // Reactive statement to update markers based on filtered communications
    $: mapMarkers = $filteredCommunications
        ?.filter((comm: Communication) => comm.coordinates)
        .map((comm: Communication) => ({
            id: comm.id,
            title: comm.title,
            coordinates: comm.coordinates!,
            year: comm.year
        })) || [];

    // Helper to check if any filters are active (handles yearRange)
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.entries(filters).some(([key, value]) => {
            if (key === 'yearRange') {
                return value !== null;
            } else if (Array.isArray(value)) {
                return value.length > 0;
            }
            return false;
        });
    }

    // Need event handler if items dispatch events
    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        console.log("Filter request received (needs handler)", event.detail);
        // TODO: Implement toggling based on event if CommunicationItem dispatches them
    }

    // Handler for the sortChange event from the Sorter component
    function handleSortChange(event: CustomEvent<{ sortBy: 'date' | 'title' }>) {
        activeSort.set(event.detail.sortBy);
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
    title="Conference Activity | Frédérick Madore"
    description="Academic conference presentations, workshops, and other speaking engagements by Frédérick Madore focusing on Islam in West Africa."
    keywords="conferences, presentations, workshops, panels, lectures, Islam, West Africa, Frédérick Madore"
/>

<div 
    class="teaching-container"
    use:urlFilterSync={{ filtersStore: activeFilters, setters: filterSetters }}
> 
    <div class="main-content">
        <PageHeader title="Conference Activity" />

        <p class="text-xl mb-10">Over the last decade, I have given talks to audiences in 13 countries across Africa, Europe, and North America.</p>

        <div class="flex justify-end items-center space-x-2 mb-4">
            <ToggleButton 
                baseText="Map"
                bind:isToggled={showMap} 
                on:toggle={() => showMap = !showMap}
            />
            <Sorter activeSort={$activeSort} on:sortChange={handleSortChange} />
        </div>

        <EntityListPageLayout 
        >
            <!-- Sidebar slot for filters -->
            <svelte:fragment slot="sidebar">
                <FiltersSidebar />
            </svelte:fragment>
            
            <!-- Default slot for main content -->
            <!-- Conditionally render Map Visualization -->
            {#if showMap}
                <div class="mb-6">
                    <MapVisualization markersData={mapMarkers} />
                </div>
            {/if}
            
            <FilteredListDisplay
                filteredItems={sortedCommunications}
                itemComponent={CommunicationItem}
                itemPropName="communication"
                entityName="conference activities"
                areFiltersActive={areFiltersActive($activeFilters)}
                {clearAllFilters}
                emptyStateNoFiltersMessage="Try adding some conference activities to the 'communications' folder."
                onItemEvent={handleFilterRequest}
            />
        </EntityListPageLayout>
    </div>
</div> 

<style>
    .teaching-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }
    
    .main-content {
        width: 100%;
    }
    
    /* Keep existing utility classes if needed, or remove if redundant */
    .text-xl {
        font-size: var(--font-size-xl);
    }
    
    .mb-10 {
        margin-bottom: var(--spacing-10);
    }
    
    /* Keep other specific styles for this page */
    .flex {
        display: flex;
    }
    .justify-end {
        justify-content: flex-end;
    }
    .mb-4 {
        margin-bottom: var(--spacing-4);
    }
    .mb-6 {
        margin-bottom: var(--spacing-6);
    }

</style> 