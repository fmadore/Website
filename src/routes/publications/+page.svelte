<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredPublications, 
        activeFilters,
        toggleTagFilter,
        toggleAuthorFilter,
        toggleTypeFilter,
        toggleProjectFilter,
        clearAllFilters
    } from '$lib/data/publications/filters';
    import FiltersSidebar from '$lib/components/publications/FiltersSidebar.svelte';
    import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';

    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = event.detail;
        console.log('Filter request received:', type, value);
        if (type === 'tag') {
            toggleTagFilter(value);
        } else if (type === 'author') {
            toggleAuthorFilter(value);
        } else if (type === 'type') {
            toggleTypeFilter(value);
        } else if (type === 'project') {
            toggleProjectFilter(value);
        }
    }

    // Helper to check if any filters are active
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.values(filters).some(val => 
            (Array.isArray(val) && val.length > 0) || 
            (val !== null && val !== undefined && typeof val === 'object' && Object.keys(val).length > 0) ||
            (typeof val !== 'object' && val !== null && val !== undefined) 
        );
    }

    // Handle initial filters from URL query parameters
    onMount(() => {
        const typeFromUrl = $page.url.searchParams.get('type');
        if (typeFromUrl) {
            let currentTypes: string[] = [];
            const unsubscribeTypes = activeFilters.subscribe(value => { 
                currentTypes = value.types;
            });
            unsubscribeTypes(); 
            
            if (!(currentTypes.length === 1 && currentTypes[0] === typeFromUrl)) {
                 currentTypes.forEach(activeType => {
                    toggleTypeFilter(activeType); 
                 });
                 toggleTypeFilter(typeFromUrl); 
            }
        }

        const projectFromUrl = $page.url.searchParams.get('project');
        if (projectFromUrl) {
            let currentProjects: string[] = [];
            const unsubscribeProjects = activeFilters.subscribe(value => {
                 currentProjects = value.projects;
            });
            unsubscribeProjects();
            
            if (!(currentProjects.length === 1 && currentProjects[0] === projectFromUrl)) {
                 currentProjects.forEach(activeProject => {
                    toggleProjectFilter(activeProject);
                 });
                 toggleProjectFilter(projectFromUrl);
            }
        }
    });
</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues focusing on Islam in West Africa."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div class="teaching-container">
    <div class="main-content">
        <PageHeader title="Publications" />

        <EntityListPageLayout>
            <!-- Sidebar slot for filters -->
            <svelte:fragment slot="sidebar">
                <FiltersSidebar />
            </svelte:fragment>
            
            <!-- Default slot for main content -->
            <FilteredListDisplay
                filteredItems={filteredPublications}
                itemComponent={PublicationItem}
                itemPropName="publication"
                entityName="publications"
                areFiltersActive={areFiltersActive($activeFilters)}
                {clearAllFilters}
                emptyStateNoFiltersMessage="No publications found. Try adding some publications to the system."
                onItemEvent={handleFilterRequest}
            />
        </EntityListPageLayout>
    </div>
</div> 

<style>
    .teaching-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4); /* Same padding as teaching */
    }
    
    .main-content {
        width: 100%;
    }

    /* You might need other styles specific to the publications page here */
    /* For example, if you had custom padding or margins before, 
       they might need adjustment or re-integration if they weren't 
       part of the standard 'container' styles. */
</style> 