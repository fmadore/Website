<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters,
        toggleTagFilter,
        toggleCountryFilter 
    } from '$lib/data/communications/filters';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';

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
                <h1 class="mb-4">Communications</h1>

                <div class="text-light mb-6">
                    Showing {$filteredCommunications.length} communications
                    {#if Object.values($activeFilters).some(val => Array.isArray(val) && val.length > 0) || $activeFilters.yearRange !== null}
                        <span class="text-accent">(Filters applied)</span>
                    {/if}
                </div>

                <ul class="list-none p-0">
                    {#each $filteredCommunications as communication}
                        <CommunicationItem 
                            {communication} 
                            on:filterrequest={handleFilterRequest}
                        />
                    {/each}
                </ul>
            </main>
        </div>
    </div>
</div> 