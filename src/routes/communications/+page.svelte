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
        setYearRange
    } from '$lib/data/communications/filters';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync'; // Import the action

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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="md:col-span-1">
            <FiltersSidebar />
        </div>
        <div class="md:col-span-3">
            <main>
				<PageHeader title="Communications" />

                <div class="text-light mb-6">
                    Showing {$filteredCommunications.length} communications
                    {#if Object.values($activeFilters).some(val => (Array.isArray(val) && val.length > 0) || (val && typeof val === 'object' && Object.keys(val).length > 0))}
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