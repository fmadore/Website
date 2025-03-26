<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { filteredCommunications, activeFilters } from '$lib/data/communications/filters';
    import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
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
                Showing {$filteredCommunications.length} conference activities
                {#if Object.values($activeFilters).some(arr => arr.length > 0)}
                    <span class="text-accent">(Filters applied)</span>
                {/if}
            </div>
            
            <ul class="list-none p-0">
                {#each $filteredCommunications as communication}
                    <CommunicationItem {communication} />
                {/each}
            </ul>
        </main>
    </div>
</div> 