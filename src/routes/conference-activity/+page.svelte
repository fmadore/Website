<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { filteredCommunications, activeFilters } from '$lib/data/communications/filters';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
    
    // Add debugging console log
    console.log('Conference activity page loading');
    console.log('Filtered communications count:', $filteredCommunications?.length);
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
            <h1 class="text-dark text-2xl mb-4">Conference Activity</h1>
            
            <div class="text-light mb-6">
                Showing {$filteredCommunications?.length || 0} conference activities
                {#if Object.values($activeFilters || {}).some(arr => arr?.length > 0)}
                    <span class="text-accent">(Filters applied)</span>
                {/if}
            </div>
            
            {#if $filteredCommunications && $filteredCommunications.length > 0}
                <ul class="list-none p-0">
                    {#each $filteredCommunications as communication}
                        <CommunicationItem {communication} />
                    {/each}
                </ul>
            {:else}
                <div class="p-8 bg-gray-50 rounded text-center">
                    <p>No conference activities found matching your criteria.</p>
                    {#if Object.values($activeFilters || {}).some(arr => arr?.length > 0)}
                        <button 
                            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            on:click={() => {
                                import('$lib/data/communications/filters').then(module => {
                                    module.clearAllFilters();
                                });
                            }}
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