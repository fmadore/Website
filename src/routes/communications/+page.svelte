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
        setYearRange,
        clearAllFilters, // Ensure clearAllFilters is imported if needed
        // Import necessary stores and functions for the config
        filterOptions, 
        tagCounts,
        countryCounts,
        authorCounts,
        // Import toggle/update functions
        updateYearRange,
        resetYearRange,
        toggleLanguageFilter,
        toggleAuthorFilter
    } from '$lib/data/communications/filters';
    // Remove old sidebar import
    // import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
    // Import the new universal sidebar and its config type
    import UniversalFiltersSidebar from '$lib/components/filters/UniversalFiltersSidebar.svelte';
    import type { UniversalFilterConfig, FilterSectionConfig, CheckboxFilterOption, RangeFilterOption, ButtonsFilterOption } from '$lib/types/filters';
    import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync'; // Import the action
    import Sorter from '$lib/components/common/Sorter.svelte'; // Import the Sorter component
    import { sortItems } from '$lib/utils/sortUtils'; // Import the sorting utility
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte'; // Import FilteredListDisplay
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte'; // Import layout
    import { writable, derived } from 'svelte/store'; // Import writable and derived

    // State for the current sort order
    const activeSort = writable<'date' | 'title'>('date'); // Use a writable store

    // Create a derived store for sorted communications
    const sortedCommunications = derived(
        [filteredCommunications, activeSort],
        ([$filteredCommunications, $activeSort]) => sortItems($filteredCommunications, $activeSort)
    );

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

    // Handler for the sortChange event from the Sorter component
    function handleSortChange(event: CustomEvent<{ sortBy: 'date' | 'title' }>) {
        activeSort.set(event.detail.sortBy); // Update the store value
    }

    // Helper to check if any filters are active (reusable)
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.values(filters).some(val => 
            (Array.isArray(val) && val.length > 0) || 
            (val !== null && val !== undefined && typeof val === 'object' && Object.keys(val).length > 0 && val.constructor === Object) || 
            (!Array.isArray(val) && typeof val !== 'object' && val !== null && val !== undefined && val !== '')
        );
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

    // Define labels locally
    const typeLabels: {[key: string]: string} = {
        'conference': 'Conferences',
        'workshop': 'Workshops',
        'seminar': 'Seminars',
        'lecture': 'Lectures',
        'panel': 'Panels',
        'event': 'Academic Events'
    };

    // Reactive calculations needed for the config
    $: types = $filterOptions?.types || [];
    $: years = $filterOptions?.years || [];
    $: countries = $filterOptions?.countries || [];
    $: languages = $filterOptions?.languages || [];
    $: tags = $filterOptions?.tags || [];
    $: authors = $filterOptions?.authors || [];
    $: sortedYearsAsc = years.slice().sort((a, b) => a - b);

    // Calculate counts for communication types (assuming structure from original communications sidebar)
    // Note: $typeCounts wasn't imported, suggesting it might need calculation here or import if available
    // If $typeCounts is available from filters.ts, import and use it directly.
    // Otherwise, calculate locally:
    // $: typeCounts = types.reduce((acc, type) => { 
    //    acc[type] = ($communicationsByType?.[type]?.length || 0); // Need communicationsByType if calculating here
    //    return acc;
    // }, {} as { [key: string]: number });
    // For now, assuming typeCounts might not be readily available or needed, setting to undefined.
    // TODO: Verify if typeCounts are needed/available for communications.

    // Construct the configuration object for the UniversalFiltersSidebar
    $: communicationFilterConfig = {
        sections: [
            // Sections explicitly cast to their specific type
            {
                type: 'checkbox',
                title: 'Event Types',
                items: types,
                itemLabels: typeLabels,
                activeItems: $activeFilters?.types || [],
                toggleItem: toggleTypeFilter,
                counts: undefined
            } as CheckboxFilterOption<string>,
            {
                type: 'range',
                title: 'Years',
                allYears: sortedYearsAsc,
                activeRange: $activeFilters?.yearRange || null,
                updateRange: updateYearRange,
                resetRange: resetYearRange
            } as RangeFilterOption,
            {
                type: 'checkbox',
                title: 'Co-authors / Participants',
                items: authors,
                activeItems: $activeFilters?.authors || [],
                toggleItem: toggleAuthorFilter,
                counts: $authorCounts
            } as CheckboxFilterOption<string>,
            {
                type: 'checkbox',
                title: 'Countries',
                items: countries,
                activeItems: $activeFilters?.countries || [],
                toggleItem: toggleCountryFilter,
                counts: $countryCounts
            } as CheckboxFilterOption<string>,
            {
                type: 'checkbox',
                title: 'Languages',
                items: languages,
                activeItems: $activeFilters?.languages || [],
                toggleItem: toggleLanguageFilter,
                counts: undefined
            } as CheckboxFilterOption<string>,
            {
                type: 'buttons',
                title: 'Tags',
                items: tags,
                activeItems: $activeFilters?.tags || [],
                toggleItem: toggleTagFilter,
                counts: $tagCounts
            } as ButtonsFilterOption<string>
        ].filter(section => {
            if (section.type === 'range') return section.allYears && section.allYears.length > 0;
            return section.items && section.items.length > 0;
        }) as FilterSectionConfig[], // Cast filtered array
        clearAllFilters: clearAllFilters
    } satisfies UniversalFilterConfig;

</script>

<SEO 
    title="Communications | Frédérick Madore"
    description="Oral communications by Frédérick Madore, including conference papers, workshops, seminars, lectures, and panels."
    keywords="communications, talks, conferences, workshops, seminars, lectures, panels, Frédérick Madore"
/>

<div 
    class="page-container" 
    use:urlFilterSync={{ filtersStore: activeFilters, setters: filterSetters }}
>
    <div class="main-content">
        <PageHeader title="Communications" />

        <EntityListPageLayout>
            <!-- Sidebar slot for filters -->
            <svelte:fragment slot="sidebar">
                <UniversalFiltersSidebar config={communicationFilterConfig} />
            </svelte:fragment>

            <!-- Default slot for main content -->
            <div class="flex justify-end mb-4">
                <Sorter activeSort={$activeSort} on:sortChange={handleSortChange} />
            </div>
            <FilteredListDisplay
                filteredItems={sortedCommunications}
                itemComponent={CommunicationItem}
                itemPropName="communication"
                entityName="communications"
                areFiltersActive={areFiltersActive($activeFilters)}
                {clearAllFilters}
                emptyStateNoFiltersMessage="No communications found matching your criteria. Try clearing some filters."
                onItemEvent={handleFilterRequest}
            />
        </EntityListPageLayout>
    </div>
</div> 

<style>
    /* Minimal styles, relying on global styles and layout components */
    .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4); 
    }
    
    .main-content {
        width: 100%;
    }
</style> 