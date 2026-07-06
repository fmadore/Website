<script lang="ts">
	import { page } from '$app/state';
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { resolve } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import SEO from '$lib/SEO.svelte';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	// Activity-list styles relocated from the global app.css.
	import '$styles/components/activity-list.css';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';

	// Get the year parameter from the URL - reactive to route changes
	let year = $derived(parseInt(page.params.year || ''));

	// Get activities reactively
	let activities = $derived(getActivities());

	// Filter activities by year - using $derived for reactive filtering
	let filteredActivities = $derived(
		activities.filter((activity: Activity) => activity.year === year)
	);

	// All years for display - using $derived for consistent sorting
	let allYears = $derived(
		[...new Set(activities.map((activity: Activity) => activity.year))].sort(
			(a: number, b: number) => b - a
		)
	);

	// Define breadcrumb items - reactive to year changes
	let breadcrumbItems = $derived([
		{ label: 'Activities', href: resolve('/activities') },
		{
			label: String(year),
			href: resolve(`/activities/year/${year}` as `/activities/year/${string}`)
		}
	]);

	// Inject breadcrumb JSON-LD structured data (with unique ID for this page type)
	useBreadcrumbJsonLd(() => breadcrumbItems, 'breadcrumb-json-ld-activities-year');
</script>

<SEO title={`Activities (${year}) | Frédérick Madore`} />

<div class="container py-8 page-enter">
	<div class="flex flex-col">
		<Breadcrumb items={breadcrumbItems} />
		<div class="year-page-header-wrapper">
			<PageHeader title={`Activities in ${year}`} additionalClasses="mb-2" />
		</div>

		<nav class="year-filters pager" aria-label="Browse activities by year">
			{#each allYears as y (y)}
				<a
					href={resolve(`/activities/year/${y}` as `/activities/year/${string}`)}
					class="pager-item {y === year ? 'pager-item--current' : ''}"
					aria-current={y === year ? 'page' : undefined}
				>
					{y}
				</a>
			{/each}
		</nav>

		{#if filteredActivities.length > 0}
			<div class="activity-grid grid-stagger">
				{#each filteredActivities as activity (activity.id)}
					<ActivityItem {activity} />
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>No activities found for {year}.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Year navigation reads as pagination — mono square items, ink-fill on the
	 * current year (the .pager idiom). Scrolls horizontally on narrow viewports. */
	.year-filters {
		flex-wrap: nowrap;
		overflow-x: auto;
		padding: var(--space-2) 0 var(--space-4);
		margin-bottom: var(--space-lg);
	}

	.year-filters .pager-item {
		flex: 0 0 auto;
	}

	/* Entries in this year sit as a flush ledger column — each ActivityItem
	 * draws its own hairline rule above, forming one continuous dated column. */
	.activity-grid {
		display: block;
	}

	.empty-state {
		padding: var(--space-8) 0;
		color: var(--color-text-light);
		border-top: var(--rule-hairline) solid var(--color-border);
		font-family: var(--font-family-serif);
	}
</style>
