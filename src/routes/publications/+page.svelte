<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { 
        filteredPublications, 
        activeFilters,
        filterOptions,
        displayedAuthors,
        displayedTypes,
        displayedTags,
        displayedLanguages,
        tagCounts,
        authorCounts,
        typeCounts,
        languageCounts,
        countryCounts,
        toggleTypeFilter, 
        updateYearRange,
        resetYearRange,
        toggleTagFilter, 
        toggleLanguageFilter, 
        toggleAuthorFilter,
        toggleCountryFilter,
        toggleProjectFilter,
        clearAllFilters,
        setTypes,
        setTags,
        setLanguages,
        setAuthors,
        setCountries,
        setProjects,
        setYearRange
    } from '$lib/data/publications/filters';
    import UniversalFiltersSidebar from '$lib/components/filters/UniversalFiltersSidebar.svelte';
    import type { UniversalFilterConfig, FilterSectionConfig, CheckboxFilterOption, RangeFilterOption, ButtonsFilterOption } from '$lib/types/filters';
    import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
    import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
    import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { urlFilterSync } from '$lib/actions/urlFilterSync';    import Sorter from '$lib/components/common/Sorter.svelte';    import { sortItems } from '$lib/utils/sortUtils';
    import { Filter } from 'lucide-svelte';
    import Button from '$lib/components/atoms/Button.svelte';
    import { derived } from 'svelte/store';    // State for the current sort order
    let activeSort = $state<'date' | 'title' | 'citations'>('date');

    // State for mobile filter sidebar expansion
    let mobileFiltersExpanded = $state(false);

    // Create a derived store for sorted publications that updates when activeSort changes
    const sortedPublications = derived(
        filteredPublications,
        ($filteredPublications) => sortItems($filteredPublications, activeSort)
    );

    // Update the derived store when activeSort changes
    $effect(() => {
        // This effect will re-run when activeSort changes
        // The derived store will automatically update because we access activeSort inside the derivation
    });

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
        } else if (type === 'country') {
            toggleCountryFilter(value);
        }
    }    // Handler for the sortChange event from the Sorter component
    function handleSortChange(data: { sortBy: 'date' | 'title' | 'citations' }) {
        activeSort = data.sortBy;
    }

    // Helper to check if any filters are active
    function areFiltersActive(filters: typeof $activeFilters): boolean {
        if (!filters) return false;
        return Object.values(filters).some(val => 
            (Array.isArray(val) && val.length > 0) || 
            (val !== null && val !== undefined && typeof val === 'object' && Object.keys(val).length > 0 && val.constructor === Object) || // Check for non-null, non-array objects like yearRange
            (!Array.isArray(val) && typeof val !== 'object' && val !== null && val !== undefined) // Check for primitive values if needed
        );
    }

    // Prepare setters object for the action
    const filterSetters = {
        setTypes,
        setTags,
        setLanguages,
        setAuthors,
        setCountries,
        setYearRange
    };

    // Define labels locally or move to a central config if used elsewhere
    const typeLabels: {[key: string]: string} = {
        'blogpost': 'Blog post',
        'book': 'Book',
        'chapter': 'Book chapter',
        'encyclopedia': 'Encyclopedia entry',
        'article': 'Journal article',
        'masters-thesis': 'Master\'s thesis',
        'phd-dissertation': 'Ph.D. dissertation',
        'report': 'Report',
        'special-issue': 'Special issue'
    };    // Ensure years are sorted ascending for the slider
    const sortedYearsAsc = derived(filterOptions, ($filterOptions) => 
        ($filterOptions?.years || []).slice().sort((a, b) => a - b)
    );    // Construct the configuration object for the UniversalFiltersSidebar
    const publicationFilterConfig = derived(
        [displayedTypes, sortedYearsAsc, displayedAuthors, displayedLanguages, filterOptions, displayedTags, activeFilters, typeCounts, authorCounts, languageCounts, countryCounts, tagCounts],
        ([$displayedTypes, $sortedYearsAsc, $displayedAuthors, $displayedLanguages, $filterOptions, $displayedTags, $activeFilters, $typeCounts, $authorCounts, $languageCounts, $countryCounts, $tagCounts]) => ({
            sections: [
                // Sections explicitly cast to their specific type
                {
                    type: 'checkbox',
                    title: 'Publication Types',
                    items: $displayedTypes,
                    itemLabels: typeLabels,
                    activeItems: $activeFilters.types,
                    toggleItem: toggleTypeFilter,
                    counts: $typeCounts
                } as CheckboxFilterOption<string>,
                {
                    type: 'range',
                    title: 'Years',
                    allYears: $sortedYearsAsc,
                    activeRange: $activeFilters.yearRange,
                    updateRange: updateYearRange,
                    resetRange: resetYearRange
                } as RangeFilterOption,
                {
                    type: 'checkbox',
                    title: 'Co-Authors',
                    items: $displayedAuthors,
                    activeItems: $activeFilters.authors,
                    toggleItem: toggleAuthorFilter,
                    counts: $authorCounts
                } as CheckboxFilterOption<string>,
                {
                    type: 'checkbox',
                    title: 'Languages',
                    items: $displayedLanguages,
                    activeItems: $activeFilters.languages,
                    toggleItem: toggleLanguageFilter,
                    counts: $languageCounts
                } as CheckboxFilterOption<string>,
                {
                    type: 'checkbox',
                    title: 'Countries', 
                    items: $filterOptions.countries, 
                    activeItems: $activeFilters.countries,
                    toggleItem: toggleCountryFilter,
                    counts: $countryCounts
                } as CheckboxFilterOption<string>,
                {
                    type: 'buttons',
                    title: 'Tags',
                    items: $displayedTags,
                    activeItems: $activeFilters.tags,
                    toggleItem: toggleTagFilter,
                    counts: $tagCounts
                } as ButtonsFilterOption<string>            ].filter(section => section.title !== 'Tags')
            .filter(section => {
                // Dynamically hide sections if they have no items/options
                if (section.type === 'range') return section.allYears && section.allYears.length > 0;
                return section.items && section.items.length > 0;
            }) as FilterSectionConfig[], // Cast filtered array
            clearAllFilters: clearAllFilters
        } satisfies UniversalFilterConfig)
    );

</script>

<SEO 
    title="Publications | Frédérick Madore"
    description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues."
    keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
/>

<div 
    class="page-container" 
    use:urlFilterSync={{ filtersStore: activeFilters, setters: filterSetters }}
>
    <div class="main-content">
        <PageHeader title="Publications" />

        <p class="text-xl mb-10">This page lists my academic publications, including books, journal articles, book chapters, reports, and more.</p>

        <!-- Mobile Controls: Two Rows -->
        <div class="mobile-controls">
            <div class="mobile-controls-row">                <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onclick={() => mobileFiltersExpanded = !mobileFiltersExpanded}
                    ariaLabel={mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'} 
                    additionalClasses="control-button-rounded filter-toggle-button"
                >
                    {#snippet icon()}
                        <Filter size={18} /> 
                    {/snippet}
                    {mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <!-- Intentionally empty for the first row, right side -->
            </div>
              <div 
                class="mobile-controls-row sorter-clear-group"                class:single-item-row={!areFiltersActive($activeFilters)}
            >
                <Sorter activeSort={activeSort} onsortchange={handleSortChange} />
                {#if areFiltersActive($activeFilters)}
                    <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onclick={clearAllFilters}
                        additionalClasses="control-button-rounded clear-filters-button-page"
                    >
                        Clear all filters
                    </Button>
                {/if}
            </div>
        </div>        <EntityListPageLayout>
            {#snippet sidebar()}
                <UniversalFiltersSidebar 
                    config={$publicationFilterConfig} 
                    isExpandedMobile={mobileFiltersExpanded} 
                    oncollapse={() => mobileFiltersExpanded = false}
                />
            {/snippet}
            
            {#snippet children()}
                <!-- Desktop Controls: Sorter + Clear Button -->
                <div class="desktop-controls">
                    <div class="list-status text-light">
                        Showing {$filteredPublications.length || 0} publications
                        {#if areFiltersActive($activeFilters)}
                            <span class="text-accent"> (Filters applied)</span>
                        {/if}
                    </div>                    <div class="buttons-group">
                        <Sorter activeSort={activeSort} onsortchange={handleSortChange} />
                        {#if areFiltersActive($activeFilters)}
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onclick={clearAllFilters}
                                additionalClasses="control-button-rounded clear-filters-button-page"
                            >
                                Clear all filters
                            </Button>
                        {/if}
                    </div>
                </div>                <FilteredListDisplay
                    filteredItems={sortedPublications}
                    itemComponent={PublicationItem}
                    itemPropName="publication"
                    areFiltersActive={areFiltersActive($activeFilters)}
                    {clearAllFilters}
                    emptyStateNoFiltersMessage="No publications found matching your criteria. Try clearing some filters."
                    onitemrequest={handleFilterRequest}
                />
            {/snippet}
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

    /* Mobile controls styling */
    .mobile-controls {
        display: none; /* Hidden by default, shown in media query */
        flex-direction: column; /* Stack rows vertically */
        gap: var(--spacing-3); /* Space between rows */
        margin-bottom: var(--spacing-4);
    }

    .mobile-controls-row {
        display: flex;
        justify-content: space-between; /* Default for when both items are present */
        align-items: center;
    }

    .mobile-controls-row.single-item-row {
        justify-content: flex-start; /* Align to left if only one item (Sorter) */
    }

    /* The rule for .mobile-controls-row .filter-toggle-button was empty and has been removed. */

    .mobile-controls .sorter-clear-group { 
        gap: var(--spacing-2); /* Explicitly set gap for items in this row */
    }

    /* Styles for .control-button-rounded and its hover effect are now globally handled by Sorter.svelte */

    /* Desktop controls styling */
    .desktop-controls {
        display: flex; /* Shown by default */
        justify-content: space-between; /* Pushes status to left, buttons to right */
        align-items: center; /* Align items vertically */
        margin-bottom: var(--spacing-4);
    }

    .desktop-controls .buttons-group {
        display: flex;
        align-items: center;
        gap: var(--spacing-2); /* Add gap between sorter and clear button */
    }

    /* .list-status { */
        /* Styles for the "Showing X publications" text if needed */
        /* For example, font size, color, etc. Handled by text-light for now */
    /* } */

    /* Media query for mobile */
    @media (max-width: 900px) {
        .mobile-controls {
            display: flex; /* Enable flex for column layout */
        }
        /* .mobile-controls > .sorter-clear-group { // Removed as sorter-clear-group is now a row itself
        /*    margin-left: auto; 
        /* } */
        .desktop-controls {
            display: none; /* Hide desktop controls on mobile */
        }
    }

</style> 