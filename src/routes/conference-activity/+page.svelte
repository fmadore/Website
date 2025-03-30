<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters,
        clearAllFilters // Import clear function for button
    } from '$lib/data/communications/filters';
    import { allCoordinates } from '$lib/data/communications'; // Import coordinates
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
    import MapVisualization from '$lib/components/communications/MapVisualization.svelte'; // Import map
    import ToggleButton from '$lib/components/common/ToggleButton.svelte'; // Import the new component
    
    let showMap = false; // State for map visibility

    // Reactive statement to update markers based on filtered communications
    $: mapMarkers = $filteredCommunications
        ?.filter(comm => comm.coordinates) // Only include those with coordinates
        .map(comm => ({
            id: comm.id,
            title: comm.title,
            coordinates: comm.coordinates!,
            year: comm.year
        })) || []; // Default to empty array if filteredCommunications is null/undefined

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
        // TODO: Implement event handling if CommunicationItem dispatches events
        // import { toggleTagFilter, toggleCountryFilter } from '$lib/data/communications/filters';
        // const { type, value } = event.detail;
        // if (type === 'tag') toggleTagFilter(value);
        // else if (type === 'country') toggleCountryFilter(value);
        console.log("Filter request received (needs handler)", event.detail);
    }
</script>

<SEO 
    title="Conference Activity | Frédérick Madore"
    description="Academic conference presentations, workshops, and other speaking engagements by Frédérick Madore focusing on Islam in West Africa."
    keywords="conferences, presentations, workshops, panels, lectures, Islam, West Africa, Frédérick Madore"
/>

<div class="container mx-auto py-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-1">
            <FiltersSidebar />
        </div>

        <main class="md:col-span-3">
            <div class="flex justify-between items-center mb-4">
                 <h1 class="text-dark text-2xl">Conference Activity</h1>
                 <!-- Use ToggleButton component -->
                 <ToggleButton 
                    baseText="Map"
                    bind:isToggled={showMap} 
                    on:toggle={() => showMap = !showMap}
                 />
            </div>
            
            <!-- Conditionally render Map Visualization -->
            {#if showMap}
                <div class="mb-6">
                    <MapVisualization markersData={mapMarkers} />
                </div>
            {/if}

            <div class="text-light mb-6">
                Showing {$filteredCommunications?.length || 0} conference activities
                 {#if areFiltersActive($activeFilters)} <!-- Use helper function -->
                    <span class="text-accent">(Filters applied)</span>
                {/if}
            </div>
            
            {#if $filteredCommunications && $filteredCommunications.length > 0}
                <ul class="list-none p-0">
                    {#each $filteredCommunications as communication}
                        <CommunicationItem {communication} on:filterrequest={handleFilterRequest} />
                    {/each}
                </ul>
            {:else}
                <div class="p-8 bg-gray-50 rounded text-center">
                    <p>No conference activities found matching your criteria.</p>
                    {#if areFiltersActive($activeFilters)} <!-- Use helper function -->
                        <button 
                            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            on:click={clearAllFilters}
                        >
                            Clear all filters
                        </button>
                    {:else}
                        <p class="mt-2 text-sm text-gray-500">
                            Try adding some conference activities to the 'communications' folder.
                        </p>
                    {/if}
                </div>
            {/if}
        </main>
    </div>
</div> 