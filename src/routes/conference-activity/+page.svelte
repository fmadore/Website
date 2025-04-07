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
    import MapVisualization from '$lib/components/communications/MapVisualization.svelte';
    import ToggleButton from '$lib/components/common/ToggleButton.svelte';
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync'; 
    import Sorter from '$lib/components/common/Sorter.svelte'; 
    import { sortItems } from '$lib/utils/sortUtils'; 
    import { writable, derived } from 'svelte/store'; 
    
    let showMap = false; 

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
            year: comm.year
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
        'conference': 'Conferences',
        'workshop': 'Workshops',
        'seminar': 'Seminars',
        'lecture': 'Lectures',
        'panel': 'Panels',
        'event': 'Academic Events'
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
                type: 'checkbox', title: 'Event Types', items: types, itemLabels: typeLabels, 
                activeItems: $activeFilters?.types || [], toggleItem: toggleTypeFilter, counts: undefined 
            } as CheckboxFilterOption<string>,
            { 
                type: 'range', title: 'Years', allYears: sortedYearsAsc, 
                activeRange: $activeFilters?.yearRange || null, updateRange: updateYearRange, resetRange: resetYearRange 
            } as RangeFilterOption,
            { 
                type: 'checkbox', title: 'Co-authors / Participants', items: authors, 
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
        ].filter(section => {
            if (section.type === 'range') return section.allYears && section.allYears.length > 0;
            return section.items && section.items.length > 0;
        }) as FilterSectionConfig[], // Cast filtered array
        clearAllFilters: clearAllFilters
    } satisfies UniversalFilterConfig;

</script>

<SEO 
    title="Conference Activity | Frédérick Madore"
    description="Academic conference presentations, workshops, and other speaking engagements by Frédérick Madore focusing on Islam in West Africa."
    keywords="conferences, presentations, workshops, panels, lectures, Islam, West Africa, Frédérick Madore"
/>

<div 
    class="page-container" 
    use:urlFilterSync={{ filtersStore: activeFilters, setters: filterSetters }}
> 
    <div class="main-content">
        <PageHeader title="Conference Activity" />

        <p class="text-xl mb-10">Over the last decade, I have given talks to audiences in 13 countries across Africa, Europe, and North America.</p>

        <div class="flex justify-end items-center mb-4">
            <ToggleButton 
                baseText="Map"
                bind:isToggled={showMap} 
                on:toggle={() => showMap = !showMap}
            />
            <Sorter activeSort={$activeSort} on:sortChange={handleSortChange} />
        </div>

        <EntityListPageLayout>
            <!-- Sidebar slot for filters -->
            <svelte:fragment slot="sidebar">
                <UniversalFiltersSidebar config={communicationFilterConfig} />
            </svelte:fragment>
            
            <!-- Default slot for main content -->
            {#if showMap}
                <div class="mb-6">
                    <MapVisualization markersData={mapMarkers} />
                </div>
            {/if}
            
            <FilteredListDisplay
                filteredItems={sortedCommunications}
                itemComponent={CommunicationItem}
                itemPropName="communication"
                entityName="conference activities"
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
    
    .flex {
        display: flex;
    }
    .justify-end {
        justify-content: flex-end;
    }
    .items-center {
        align-items: center;
        gap: var(--spacing-2);
    }
    .mb-4 {
        margin-bottom: var(--spacing-4);
    }
    .mb-6 {
        margin-bottom: var(--spacing-6);
    }
</style> 