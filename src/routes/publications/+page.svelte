<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import {
		filteredPublications,
		activeFilters,
		filterOptions,
		tagCounts,
		authorCounts,
		typeCounts,
		languageCounts,
		countryCounts,
		projectCounts,
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
	} from '$lib/data/publications/filters.svelte';
	import UniversalFiltersSidebar from '$lib/components/filters/UniversalFiltersSidebar.svelte';
	import type {
		UniversalFilterConfig,
		FilterSectionConfig,
		CheckboxFilterOption,
		RangeFilterOption,
		ChipsFilterOption,
		DropdownFilterOption
	} from '$lib/types/filters';
	import PublicationItem from '$lib/components/publications/PublicationItem.svelte';
	import FeaturedPublications from '$lib/components/publications/FeaturedPublications.svelte';
	import EntityListPageLayout from '$lib/components/common/EntityListPageLayout.svelte';
	import FilteredListDisplay from '$lib/components/common/FilteredListDisplay.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import { urlFilterSync } from '$lib/actions/urlFilterSync.svelte';
	import Sorter from '$lib/components/common/Sorter.svelte';
	import { sortItems } from '$lib/utils/sortUtils';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Publications', '/publications');

	// State for the current sort order
	let activeSort = $state<'date' | 'title' | 'citations'>('date');

	// State for mobile filter sidebar expansion
	let mobileFiltersExpanded = $state(false);

	// Use $derived to create sorted publications - this is the proper Svelte 5 pattern
	const sortedPublications = $derived(sortItems($filteredPublications, activeSort));

	// Get featured publications (only show when no filters are active)
	// Featured publications are also sorted by the active sort order
	const featuredPublications = $derived(
		sortItems($filteredPublications.filter((pub) => pub.featured), activeSort).slice(0, 3)
	);

	// Check if we should show featured publications
	const shouldShowFeatured = $derived(
		!areFiltersActive($activeFilters) && featuredPublications.length > 0
	);

	function handleFilterRequest(event: { type: string; value: string }) {
		const { type, value } = event;
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
	} // Handler for the sortChange event from the Sorter component
	function handleSortChange(data: { sortBy: 'date' | 'title' | 'citations' }) {
		activeSort = data.sortBy;
	}

	// Helper to check if any filters are active
	function areFiltersActive(filters: typeof $activeFilters): boolean {
		if (!filters) return false;
		return Object.values(filters).some(
			(val) =>
				(Array.isArray(val) && val.length > 0) ||
				(val !== null &&
					val !== undefined &&
					typeof val === 'object' &&
					Object.keys(val).length > 0 &&
					val.constructor === Object) || // Check for non-null, non-array objects like yearRange
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
		setProjects,
		setYearRange
	};

	// Define labels locally or move to a central config if used elsewhere
	const typeLabels: { [key: string]: string } = {
		blogpost: 'Blog post',
		book: 'Book',
		'bulletin-article': 'Bulletin article',
		chapter: 'Book chapter',
		'conference-proceedings': 'Conference proceedings',
		encyclopedia: 'Encyclopedia entry',
		article: 'Journal article',
		'masters-thesis': "Master's thesis",
		'phd-dissertation': 'Ph.D. dissertation',
		report: 'Report',
		'special-issue': 'Special issue'
	};

	// Ensure years are sorted ascending for the slider - using $derived for Svelte 5
	const sortedYearsAsc = $derived(
		($filterOptions?.years || []).slice().sort((a: number, b: number) => a - b)
	);

	// Construct the configuration object for the UniversalFiltersSidebar - using $derived for Svelte 5
	const publicationFilterConfig = $derived({
		sections: [
			// Sections explicitly cast to their specific type
			{
				type: 'checkbox',
				title: 'Publication Types',
				items: $filterOptions.types,
				itemLabels: typeLabels,
				activeItems: $activeFilters.types,
				toggleItem: toggleTypeFilter,
				counts: $typeCounts
			} as CheckboxFilterOption<string>,
			{
				type: 'range',
				title: 'Years',
				allYears: sortedYearsAsc,
				activeRange: $activeFilters.yearRange,
				updateRange: updateYearRange,
				resetRange: resetYearRange
			} as RangeFilterOption,
			{
				type: 'chips',
				title: 'Projects',
				items: $filterOptions.projects,
				activeItems: $activeFilters.projects,
				toggleItem: toggleProjectFilter,
				counts: undefined,
				searchThreshold: 5,
				initialDisplayCount: 6,
				showSearch: false
			} as ChipsFilterOption<string>,
			{
				type: 'dropdown',
				title: 'Co-Authors',
				items: $filterOptions.authors,
				activeItems: $activeFilters.authors,
				toggleItem: toggleAuthorFilter,
				counts: $authorCounts,
				placeholder: 'Select co-authors...',
				searchThreshold: 6,
				maxHeight: '400px'
			} as DropdownFilterOption<string>,
			{
				type: 'checkbox',
				title: 'Languages',
				items: $filterOptions.languages,
				activeItems: $activeFilters.languages,
				toggleItem: toggleLanguageFilter,
				counts: $languageCounts
			} as CheckboxFilterOption<string>,
			{
				type: 'dropdown',
				title: 'Countries',
				items: $filterOptions.countries,
				activeItems: $activeFilters.countries,
				toggleItem: toggleCountryFilter,
				counts: undefined,
				placeholder: 'Select countries...',
				searchThreshold: 6,
				maxHeight: '400px'
			} as DropdownFilterOption<string>,
			{
				type: 'chips',
				title: 'Tags',
				items: $filterOptions.tags,
				activeItems: $activeFilters.tags,
				toggleItem: toggleTagFilter,
				counts: $tagCounts,
				searchThreshold: 8,
				initialDisplayCount: 10,
				showSearch: false
			} as ChipsFilterOption<string>
		]
			.filter((section) => section.title !== 'Tags')
			.filter((section) => {
				// Dynamically hide sections if they have no items/options
				if (section.type === 'range') return section.allYears && section.allYears.length > 0;
				return section.items && section.items.length > 0;
			}) as FilterSectionConfig[], // Cast filtered array
		clearAllFilters: clearAllFilters
	} satisfies UniversalFilterConfig);
</script>

<SEO
	title="Publications | Frédérick Madore"
	description="Academic publications by Frédérick Madore, including books, journal articles, edited volumes, book chapters, and special issues."
	keywords="publications, books, journal articles, research, Islam, West Africa, Frédérick Madore"
	canonical="https://www.frederickmadore.com/publications"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="page-container page-enter" use:urlFilterSync={{ filters: $activeFilters, setters: filterSetters }}>
	<PageHeader title="Publications" />

	<PageIntro>
		This page lists my academic publications, including books, journal articles, book chapters,
		reports, and more.
	</PageIntro>

	<!-- Mobile Controls: Two Rows -->
	<div class="mobile-controls">
			<div class="mobile-controls-row">
				<Button
					variant="outline-secondary"
					size="sm"
					onclick={() => (mobileFiltersExpanded = !mobileFiltersExpanded)}
					ariaLabel={mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
					additionalClasses="control-button-rounded filter-toggle-button"
				>
					{#snippet icon()}
						<Icon icon="lucide:filter" width="18" height="18" />
					{/snippet}
					{mobileFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
				</Button>
				<!-- Intentionally empty for the first row, right side -->
			</div>
			<div
				class="mobile-controls-row sorter-clear-group"
				class:single-item-row={!areFiltersActive($activeFilters)}
			>
				<Sorter {activeSort} onsortchange={handleSortChange} />
				{#if areFiltersActive($activeFilters)}
					<Button
						variant="primary"
						size="sm"
						onclick={clearAllFilters}
						additionalClasses="control-button-rounded clear-filters-button-page"
					>
						Clear all filters
					</Button>
				{/if}
			</div>
		</div>
		<EntityListPageLayout containerClass="" gridClass="grid grid-cols-1 lg:grid-cols-4 gap-6">
			{#snippet sidebar()}
				<UniversalFiltersSidebar
					config={publicationFilterConfig}
					isExpandedMobile={mobileFiltersExpanded}
				/>
			{/snippet}

			{#snippet children()}
				<!-- Featured Publications Section (only shown when no filters active) -->
				{#if shouldShowFeatured}
					<FeaturedPublications publications={featuredPublications} onfilterrequest={handleFilterRequest} />
				{/if}

				<!-- All Publications Section Header (only when featured are shown) -->
				{#if shouldShowFeatured}
					<div class="all-publications-header">
						<h2 class="section-title">All Publications</h2>
					</div>
				{/if}

				<!-- Desktop Controls: Sorter + Clear Button -->
				<div class="desktop-controls">
					<div class="list-status text-light">
						Showing {$filteredPublications.length || 0} publications
						{#if areFiltersActive($activeFilters)}
							<span class="text-accent"> (Filters applied)</span>
						{/if}
					</div>
					<div class="buttons-group">
						<Sorter {activeSort} onsortchange={handleSortChange} />
						{#if areFiltersActive($activeFilters)}
							<Button
								variant="primary"
								size="sm"
								onclick={clearAllFilters}
								additionalClasses="control-button-rounded clear-filters-button-page"
							>
								Clear all filters
							</Button>
						{/if}
					</div>
				</div>
				<FilteredListDisplay
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

<style>
	.page-container {
		max-width: var(--content-width-6xl);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}

	/* Mobile controls styling */
	.mobile-controls {
		display: none; /* Hidden by default, shown in media query */
		flex-direction: column; /* Stack rows vertically */
		gap: var(--space-3); /* Space between rows */
		margin-bottom: var(--space-4);
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
		gap: var(--space-2); /* Explicitly set gap for items in this row */
	}

	/* Styles for .control-button-rounded and its hover effect are now globally handled by Sorter.svelte */

	/* All Publications header */
	.all-publications-header {
		margin-top: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.section-title {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-light);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
	}

	/* Desktop controls styling */
	.desktop-controls {
		display: flex; /* Shown by default */
		justify-content: space-between; /* Pushes status to left, buttons to right */
		align-items: center; /* Align items vertically */
		margin-bottom: var(--space-4);
	}

	.desktop-controls .buttons-group {
		display: flex;
		align-items: center;
		gap: var(--space-2); /* Add gap between sorter and clear button */
	}

	/* .list-status { */
	/* Styles for the "Showing X publications" text if needed */
	/* For example, font size, color, etc. Handled by text-light for now */
	/* } */

	/* Media query for mobile/tablet - show mobile controls up to 1024px */
	@media (max-width: 1024px) {
		.mobile-controls {
			display: flex; /* Enable flex for column layout */
		}
		.desktop-controls {
			display: none; /* Hide desktop controls on tablet and mobile */
		}
	}
</style>
