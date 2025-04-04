<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters,
        toggleTagFilter,
        toggleCountryFilter,
        toggleTypeFilter
    } from '$lib/data/communications/filters';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';

    // Function to handle filter requests from items
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
    
    // Handle initial type filter from URL query parameter
    onMount(() => {
        const typeFromUrl = $page.url.searchParams.get('type');
        if (typeFromUrl) {
            let currentTypes: string[] = [];
            const unsubscribe = activeFilters.subscribe(value => {
                currentTypes = value.types;
            });
            unsubscribe();
            
            if (!(currentTypes.length === 1 && currentTypes[0] === typeFromUrl)) {
                currentTypes.forEach(activeType => {
                    toggleTypeFilter(activeType); 
                });
                toggleTypeFilter(typeFromUrl); 
            }
        }
        // Handle project filter from URL (Added based on link in RelevantCommunications.svelte)
        const projectFromUrl = $page.url.searchParams.get('project');
        if (projectFromUrl) {
            console.log("Project filter from URL:", projectFromUrl);
            // TODO: Implement project filtering logic similar to type filtering if required.
        }
    });
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
				<PageHeader title="Communications" />

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