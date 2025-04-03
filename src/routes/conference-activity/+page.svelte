<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters,
        clearAllFilters
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
    
    let showMap = false; // State for map visibility

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
    }
</script>

<SEO 
    title="Conference Activity | Frédérick Madore"
    description="Academic conference presentations, workshops, and other speaking engagements by Frédérick Madore focusing on Islam in West Africa."
    keywords="conferences, presentations, workshops, panels, lectures, Islam, West Africa, Frédérick Madore"
/>

<div class="container mx-auto py-6">
    <PageHeader title="Conference Activity" />

    <p class="text-xl mb-10">Over the last decade, I have given talks to audiences in 13 countries across Africa, Europe, and North America.</p>

    <div class="flex justify-end mb-4">
        <ToggleButton 
            baseText="Map"
            bind:isToggled={showMap} 
            on:toggle={() => showMap = !showMap}
        />
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
            filteredItems={filteredCommunications}
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