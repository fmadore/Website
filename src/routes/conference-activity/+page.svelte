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
		projectCounts,
		// Import toggle/update functions
		toggleTagFilter,
		toggleCountryFilter,
		toggleTypeFilter,
		toggleProjectFilter,
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
	} from '$lib/data/communications/filters.svelte';
	import type { Communication } from '$lib/types/communication';
	// Remove old sidebar import
	// import FiltersSidebar from '$lib/components/communications/FiltersSidebar.svelte';
	// Import the new universal sidebar and its config type
	import UniversalFiltersSidebar from '$lib/components/filters/UniversalFiltersSidebar.svelte';
	import type {
		UniversalFilterConfig,
		FilterSectionConfig,
		CheckboxFilterOption,
		RangeFilterOption,
		ChipsFilterOption,
		DropdownFilterOption
	} from '$lib/types/filters';
	import CommunicationItem from '$lib/components/communications/CommunicationItem.svelte';
	import UpcomingCommunications from '$lib/components/communications/UpcomingCommunications.svelte';
	import MapVisualization from '$lib/components/visualisations/MapVisualization.svelte';
	import ToggleButton from '$lib/components/common/ToggleButton.svelte';
	import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
	import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import Sorter from '$lib/components/common/Sorter.svelte';
	import { sortItems } from '$lib/utils/sortUtils';
	import Icon from '@iconify/svelte'; // Import Iconify
	import Button from '$lib/components/atoms/Button.svelte'; // Import Button

	let showMap = $state(false);

	// State for mobile filter sidebar expansion
	let mobileFiltersExpanded = $state(false);

	// State for the current sort order
	let activeSort = $state<'date' | 'title'>('date');

	// Define today's date in ISO format for comparison
	const today = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD format

	// Get upcoming communications (only show when no filters are active)
	const upcomingCommunications = $derived(
		sortItems(
			$filteredCommunications.filter((comm) => comm.dateISO && comm.dateISO >= today),
			activeSort
		)
	);

	// Check if we should show upcoming communications
	const shouldShowUpcoming = $derived(
		!areFiltersActive($activeFilters) && upcomingCommunications.length > 0
	);

	// Create reactive values for sorted communications
	// When showing upcoming section, exclude upcoming items from the main list
	const sortedCommunications = $derived(
		sortItems(
			shouldShowUpcoming
				? $filteredCommunications.filter((comm) => !comm.dateISO || comm.dateISO < today)
				: $filteredCommunications,
			activeSort
		)
	);

	// Create a reactive value for map markers based on filtered communications
	const mapMarkers = $derived(
		$filteredCommunications
			?.filter((comm: Communication) => comm.coordinates)
			.map((comm: Communication) => ({
				id: comm.id,
				title: comm.title,
				coordinates: comm.coordinates!,
				year: comm.year,
				activityType: comm.type,
				image: comm.image
			})) || []
	);

	// Helper to check if any filters are active (consistent with communications/+page.svelte)
	function areFiltersActive(filters: typeof $activeFilters): boolean {
		if (!filters) return false;
		return Object.values(filters).some(
			(val) =>
				(Array.isArray(val) && val.length > 0) ||
				(val !== null &&
					val !== undefined &&
					typeof val === 'object' &&
					Object.keys(val).length > 0 &&
					val.constructor === Object) ||
				(!Array.isArray(val) &&
					typeof val !== 'object' &&
					val !== null &&
					val !== undefined &&
					val !== '')
		);
	} // Function to handle filter requests from items (consistent with communications/+page.svelte)
	function handleFilterRequest(event: { type: string; value: string }) {
		const { type, value } = event;
		if (type === 'tag') {
			toggleTagFilter(value);
		} else if (type === 'country') {
			toggleCountryFilter(value);
		} else if (type === 'type') {
			toggleTypeFilter(value);
		} else if (type === 'project') {
			toggleProjectFilter(value);
		} else if (type === 'author') {
			toggleAuthorFilter(value);
		}
	} // Handler for the sortChange event from the Sorter component
	function handleSortChange(data: { sortBy: 'date' | 'title' | 'citations' }) {
		// Only handle date and title sorts for communications
		if (data.sortBy === 'date' || data.sortBy === 'title') {
			activeSort = data.sortBy;
		}
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
	const typeLabels: { [key: string]: string } = {
		conference: 'Conference Papers',
		workshop: 'Workshop Presentations',
		seminar: 'Seminars',
		lecture: 'Lectures',
		panel: 'Panels Organized',
		event: 'Academic Events Organized'
	};

	// Reactive values using $derived
	const communicationFilterConfig = $derived<UniversalFilterConfig>({
		sections: [
			// Sections explicitly cast to their specific type
			{
				type: 'checkbox',
				title: 'Type',
				items: $filterOptions?.types || [],
				itemLabels: typeLabels,
				activeItems: $activeFilters?.types || [],
				toggleItem: toggleTypeFilter,
				counts: undefined
			} as CheckboxFilterOption<string>,
			{
				type: 'range',
				title: 'Years',
				allYears: ($filterOptions?.years || []).slice().sort((a: number, b: number) => a - b),
				activeRange: $activeFilters?.yearRange || null,
				updateRange: updateYearRange,
				resetRange: resetYearRange
			} as RangeFilterOption,
			{
				type: 'chips',
				title: 'Projects',
				items: $filterOptions?.projects || [],
				activeItems: $activeFilters?.projects || [],
				toggleItem: toggleProjectFilter,
				counts: $projectCounts,
				searchThreshold: 5,
				initialDisplayCount: 6,
				showSearch: false
			} as ChipsFilterOption<string>,
			{
				type: 'dropdown',
				title: 'Co-authors',
				items: $filterOptions?.authors || [],
				activeItems: $activeFilters?.authors || [],
				toggleItem: toggleAuthorFilter,
				counts: $authorCounts,
				placeholder: 'Select co-authors...',
				searchThreshold: 6,
				maxHeight: '400px'
			} as DropdownFilterOption<string>,
			{
				type: 'dropdown',
				title: 'Countries',
				items: $filterOptions?.countries || [],
				activeItems: $activeFilters?.countries || [],
				toggleItem: toggleCountryFilter,
				counts: $countryCounts,
				placeholder: 'Select countries...',
				searchThreshold: 6,
				maxHeight: '400px'
			} as DropdownFilterOption<string>,
			{
				type: 'checkbox',
				title: 'Languages',
				items: $filterOptions?.languages || [],
				activeItems: $activeFilters?.languages || [],
				toggleItem: toggleLanguageFilter,
				counts: undefined
			} as CheckboxFilterOption<string>,
			{
				type: 'chips',
				title: 'Tags',
				items: $filterOptions?.tags || [],
				activeItems: $activeFilters?.tags || [],
				toggleItem: toggleTagFilter,
				counts: $tagCounts,
				searchThreshold: 8,
				initialDisplayCount: 10,
				showSearch: false
			} as ChipsFilterOption<string>
		]
			.filter((section) => section.title !== 'Tags')
			.filter((section) => {
				if (section.type === 'range') return section.allYears && section.allYears.length > 0;
				return section.items && section.items.length > 0;
			}) as FilterSectionConfig[], // Cast filtered array
		clearAllFilters: clearAllFilters
	} satisfies UniversalFilterConfig);
</script>

<SEO
	title="Conference Activity | Frédérick Madore"
	description="Academic conference presentations, workshops, and other speaking engagements by Frédérick Madore."
	keywords="conferences, presentations, workshops, panels, lectures, Islam, West Africa, digital humanities, Frédérick Madore"
/>

<div class="page-container" use:urlFilterSync={{ filters: $activeFilters, setters: filterSetters }}>
	<PageHeader title="Conference Activity" />

	<PageIntro>
		Since 2012, I have given talks to audiences in {$filterOptions?.countries?.length || 0} countries
		across Africa, Europe, and North America.
	</PageIntro>

	<!-- Mobile Controls: Two Rows -->
	<div class="mobile-controls">
			<div class="mobile-controls-row">
				<Button
					variant="outline-secondary"
					size="sm"
					onclick={() => (mobileFiltersExpanded = !mobileFiltersExpanded)}
					ariaLabel={mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
					additionalClasses="control-button-rounded"
				>
					{#snippet icon()}
						<Icon icon="lucide:filter" width="18" height="18" />
					{/snippet}
					{mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
				</Button><ToggleButton
					baseText="Map"
					isToggled={showMap}
					onclick={() => (showMap = !showMap)}
				/>
			</div>
			<div class="mobile-controls-row">
				<Sorter {activeSort} onsortchange={handleSortChange} availableSorts={['date', 'title']} />
				{#if areFiltersActive($activeFilters)}
					<Button
						variant="primary"
						size="sm"
						onclick={clearAllFilters}
						additionalClasses="control-button-rounded"
					>
						Clear all filters
					</Button>
				{/if}
			</div>
		</div>
		<EntityListPageLayout containerClass="" gridClass="grid grid-cols-1 md:grid-cols-4 gap-6">
			{#snippet sidebar()}
				<UniversalFiltersSidebar
					config={communicationFilterConfig}
					isExpandedMobile={mobileFiltersExpanded}
					oncollapse={() => (mobileFiltersExpanded = false)}
				/>
			{/snippet}

			{#snippet children()}
				<!-- Upcoming Talks and Events Section (only shown when no filters active) -->
				{#if shouldShowUpcoming}
					<UpcomingCommunications communications={upcomingCommunications} />
				{/if}

				<!-- All Communications Section Header (only when upcoming are shown) -->
				{#if shouldShowUpcoming}
					<div class="all-communications-header">
						<h2 class="section-title">All Conference Activities</h2>
					</div>
				{/if}

				<div class="desktop-controls">
				<div class="list-status text-light">
					Showing {$filteredCommunications.length || 0} conference activities
					{#if areFiltersActive($activeFilters)}
						<span class="text-accent"> (Filters applied)</span>
					{/if}
				</div>
				<div class="actions-group">
					<ToggleButton baseText="Map" isToggled={showMap} onclick={() => (showMap = !showMap)} />
					<Sorter {activeSort} onsortchange={handleSortChange} availableSorts={['date', 'title']} />
					{#if areFiltersActive($activeFilters)}
						<Button
							variant="primary"
							size="sm"
							onclick={clearAllFilters}
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
					onitemrequest={handleFilterRequest}
				/>
			{/snippet}
		</EntityListPageLayout>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-4);
	}

	.mb-6 {
		margin-bottom: var(--spacing-6);
	}

	/* All Communications header */
	.all-communications-header {
		margin-top: var(--spacing-4);
		margin-bottom: var(--spacing-6);
	}

	.section-title {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-light);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
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
