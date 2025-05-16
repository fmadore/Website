<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredCommunications, 
        activeFilters,
        clearAllFilters,
        // Import necessary stores and functions for the config
        filterOptions, 
        tagCounts,
        countryCounts,
        authorCounts,
        // Import toggle/update functions
        toggleTagFilter, 
        toggleCountryFilter, 
        toggleTypeFilter, 
        updateYearRange,
        resetYearRange,
        toggleLanguageFilter,
        toggleAuthorFilter,
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
    import type { Communication } from '$lib/types/communication';
    // Remove old sidebar import
    // import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    // Import the new universal sidebar and its config type
    import UniversalFiltersSidebar from '$lib/components/filters/UniversalFiltersSidebar.svelte';
    import type { UniversalFilterConfig, FilterSectionConfig, CheckboxFilterOption, RangeFilterOption, ButtonsFilterOption } from '$lib/types/filters';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
    import MapVisualization from '$lib/components/visualisations/MapVisualization.svelte';
    import ToggleButton from '$lib/components/common/ToggleButton.svelte';
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync'; 
    import Sorter from '$lib/components/common/Sorter.svelte'; 
    import { sortItems } from '$lib/utils/sortUtils'; 
    import { writable, derived } from 'svelte/store'; 
    import { Filter } from 'lucide-svelte'; // Import the Filter icon
    import Button from '$lib/components/atoms/Button.svelte'; // Import Button
    
    let showMap = false; 

    // State for mobile filter sidebar expansion
    let mobileFiltersExpanded = false;

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
            year: comm.year,
            activityType: comm.type,
            image: comm.image
        })) || [];

    // Helper to check if any filters are active (consistent with communications/+page.svelte)
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.values(filters).some(val => 
            (Array.isArray(val) && val.length > 0) || 
            (val !== null && val !== undefined && typeof val === 'object' && Object.keys(val).length > 0 && val.constructor === Object) || 
            (!Array.isArray(val) && typeof val !== 'object' && val !== null && val !== undefined && val !== '')
        );
    }

    // Function to handle filter requests from items (consistent with communications/+page.svelte)
    function handleFilterRequest(event: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = event.detail;
        if (type === 'tag') {
            toggleTagFilter(value);
        } else if (type === 'country') {
            toggleCountryFilter(value);
        } else if (type === 'type') { 
            toggleTypeFilter(value);
        }
        // Add other filter types if needed (e.g., author)
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

    // Define labels locally (same as communications)
    const typeLabels: {[key: string]: string} = {
        'conference': 'Conference Papers',
        'workshop': 'Workshop Presentations',
        'seminar': 'Seminars',
        'lecture': 'Lectures',
        'panel': 'Panels Organized',
        'event': 'Academic Events Organized'
    };

    // Reactive calculations needed for the config (same as communications)
    $: types = $filterOptions?.types || [];
    $: years = $filterOptions?.years || [];
    $: countries = $filterOptions?.countries || [];
    $: languages = $filterOptions?.languages || [];
    $: tags = $filterOptions?.tags || [];
    $: authors = $filterOptions?.authors || [];
    $: sortedYearsAsc = years.slice().sort((a, b) => a - b);

    // Construct the configuration object (same as communications)
    $: communicationFilterConfig = {
        sections: [
            // Sections explicitly cast to their specific type
            { 
                type: 'checkbox', title: 'Type', items: types, itemLabels: typeLabels, 
                activeItems: $activeFilters?.types || [], toggleItem: toggleTypeFilter, counts: undefined 
            } as CheckboxFilterOption<string>,
            { 
                type: 'range', title: 'Years', allYears: sortedYearsAsc, 
                activeRange: $activeFilters?.yearRange || null, updateRange: updateYearRange, resetRange: resetYearRange 
            } as RangeFilterOption,
            { 
                type: 'checkbox', title: 'Co-authors', items: authors,
                activeItems: $activeFilters?.authors || [], toggleItem: toggleAuthorFilter, counts: $authorCounts 
            } as CheckboxFilterOption<string>,
            { 
                type: 'checkbox', title: 'Countries', items: countries, 
                activeItems: $activeFilters?.countries || [], toggleItem: toggleCountryFilter, counts: $countryCounts 
            } as CheckboxFilterOption<string>,
            { 
                type: 'checkbox', title: 'Languages', items: languages, 
                activeItems: $activeFilters?.languages || [], toggleItem: toggleLanguageFilter, counts: undefined 
            } as CheckboxFilterOption<string>,
            { 
                type: 'buttons', title: 'Tags', items: tags, 
                activeItems: $activeFilters?.tags || [], toggleItem: toggleTagFilter, counts: $tagCounts 
            } as ButtonsFilterOption<string>
        ].filter(section => section.title !== 'Tags')
        .filter(section => {
            if (section.type === 'range') return section.allYears && section.allYears.length > 0;
            return section.items && section.items.length > 0;
        }) as FilterSectionConfig[], // Cast filtered array
        clearAllFilters: clearAllFilters
    } satisfies UniversalFilterConfig;

</script>

<SEO 
    title="Conference Activity | Frédérick Madore"
    description="Academic conference presentations, workshops, and other speaking engagements by Frédérick Madore."
    keywords="conferences, presentations, workshops, panels, lectures, Islam, West Africa, digital humanities, Frédérick Madore"
/>

<div 
    class="page-container" 
    use:urlFilterSync={{ filtersStore: activeFilters, setters: filterSetters }}
> 
    <div class="main-content">
        <PageHeader title="Conference Activity" />

        <p class="text-xl mb-10">Since 2012, I have given talks to audiences in {countries.length} countries across Africa, Europe, and North America.</p>

        <!-- Mobile Controls: Two Rows -->
        <div class="mobile-controls">
            <div class="mobile-controls-row">
                <Button 
                    variant="outline-primary" 
                    size="sm" 
                    on:click={() => mobileFiltersExpanded = !mobileFiltersExpanded}
                    ariaLabel={mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'} 
                    additionalClasses="control-button-rounded"
                >
                    <svelte:fragment slot="icon">
                        <Filter size={18} /> 
                    </svelte:fragment>
                    {mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <ToggleButton 
                    baseText="Map"
                    bind:isToggled={showMap} 
                    on:toggle={() => showMap = !showMap}
                />
            </div>
            <div class="mobile-controls-row">
                <Sorter activeSort={$activeSort} on:sortChange={handleSortChange} />
                {#if areFiltersActive($activeFilters)}
                    <Button 
                        variant="outline-primary" 
                        size="sm" 
                        on:click={clearAllFilters}
                        additionalClasses="control-button-rounded"
                    >
                        Clear all filters
                    </Button>
                {/if}
            </div>
        </div>

        <EntityListPageLayout>
            <!-- Sidebar slot for filters -->
            <svelte:fragment slot="sidebar">
                <UniversalFiltersSidebar 
                    config={communicationFilterConfig} 
                    bind:isExpandedMobile={mobileFiltersExpanded}
                    on:collapse={() => mobileFiltersExpanded = false}
                />
            </svelte:fragment>
            
            <!-- Default slot for main content -->
            <div class="desktop-controls">
                <div class="list-status text-light">
                    Showing {$filteredCommunications.length || 0} conference activities
                    {#if areFiltersActive($activeFilters)}
                        <span class="text-accent"> (Filters applied)</span>
                    {/if}
                </div>
                <div class="actions-group">
                    <ToggleButton 
                        baseText="Map"
                        bind:isToggled={showMap} 
                        on:toggle={() => showMap = !showMap}
                    />
                    <Sorter activeSort={$activeSort} on:sortChange={handleSortChange} />
                    {#if areFiltersActive($activeFilters)}
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            on:click={clearAllFilters}
                            additionalClasses="control-button-rounded"
                        >
                            Clear all filters
                        </Button>
                    {/if}
                </div>
            </div>

            {#if showMap}
                <div class="mb-6">
                    <MapVisualization markersData={mapMarkers} />
                </div>
            {/if}
            
            <FilteredListDisplay
                filteredItems={sortedCommunications}
                itemComponent={CommunicationItem}
                itemPropName="communication"
                areFiltersActive={areFiltersActive($activeFilters)}
                {clearAllFilters}
                emptyStateNoFiltersMessage="No conference activities found matching your criteria. Try clearing some filters."
                onItemEvent={handleFilterRequest}
            />
        </EntityListPageLayout>
    </div>
</div> 

<style>
    .page-container { 
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }
    
    .main-content {
        width: 100%;
    }
    
    .text-xl {
        font-size: var(--font-size-xl);
    }
    
    .mb-10 {
        margin-bottom: var(--spacing-10);
    }
    
    .mb-6 {
        margin-bottom: var(--spacing-6);
    }

    /* Mobile controls styling */
    .mobile-controls {
        display: none; /* Hidden by default, shown in media query */
        flex-direction: column; /* Stack rows vertically */
        gap: var(--spacing-3); /* Space between rows */
        margin-bottom: var(--spacing-4);
    }

    .mobile-controls-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* control-button-rounded styles are global (buttons.css) */

    /* Desktop controls styling */
    .desktop-controls {
        display: flex;
        justify-content: space-between; /* Pushes status to left, buttons to right */
        align-items: center; /* Align items vertically */
        margin-bottom: var(--spacing-4);
    }

    /* Media query for mobile */
    @media (max-width: 900px) {
        .mobile-controls {
            display: flex; /* Enable flex for column layout */
        }
        /* .mobile-controls > .actions-group { // Removed as actions-group logic is changed 
        /*    margin-left: auto; 
        /* } */
        .desktop-controls {
            display: none; /* Hide desktop controls container on mobile */
        }
    }

    /* Add margin to the bottom of each communication item */
    /*
    :global(.communication-item) { 
        margin-bottom: var(--spacing-6); 
    }
    */
</style> 