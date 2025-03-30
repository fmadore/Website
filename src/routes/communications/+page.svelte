<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters,
        // Import necessary filter functions
        toggleTagFilter,
        toggleCountryFilter 
    } from '$lib/data/communications/filters';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
    import MapVisualization from '$lib/components/communications/MapVisualization.svelte'; // Assuming you have this

    // Function to handle filter requests from items
    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = event.detail;
        if (type === 'tag') {
            toggleTagFilter(value);
        } else if (type === 'country') {
            toggleCountryFilter(value);
        }
        // Add other types (like author) if CommunicationItem dispatches them
    }
</script>

<SEO 
    title="Communications | Frédérick Madore"
    description="Oral communications by Frédérick Madore, including conference papers, workshops, seminars, lectures, and panels."
    keywords="communications, talks, conferences, workshops, seminars, lectures, panels, Frédérick Madore"
/>

<div class="container mx-auto py-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-1">
            <FiltersSidebar />
        </div>
        <div class="md:col-span-3">
            <main>
                <h1>Communications</h1>
                <ul class="list-none p-0">
                    {#each $filteredCommunications as communication}
                        <CommunicationItem 
                            {communication} 
                            on:filterrequest={handleFilterRequest} /* Listen for event */
                        />
                    {/each}
                </ul>
            </main>
        </div>
    </div>
</div> 