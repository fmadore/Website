<script lang="ts">
	import { page } from '$app/stores';
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import SEO from '$lib/SEO.svelte';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import { useBreadcrumbJsonLd } from '$lib/utils/breadcrumbJsonLd.svelte';

	// Get the year parameter from the URL - reactive to route changes
	let year = $derived(parseInt($page.params.year || ''));

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
		{ label: 'Activities', href: `${base}/activities` },
		{ label: String(year), href: `${base}/activities/year/${year}` }
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

		<div class="year-filters flex gap-2 overflow-x-auto py-2">
			{#each allYears as y (y)}
				<a href="{base}/activities/year/{y}" class="year-tag {y === year ? 'active' : ''}">
					{y}
				</a>
			{/each}
		</div>

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
	.year-tag {
		display: inline-block;
		padding: var(--space-2) var(--space-4);
		background-color: var(--color-border);
		color: var(--color-text);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		margin-right: var(--space-2);
		margin-bottom: var(--space-2);
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
	}

	.year-tag:hover {
		background-color: var(--color-primary);
		color: var(--color-background);
	}

	.year-tag.active {
		background-color: var(--color-primary);
		color: var(--color-background);
	}

	.activity-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--content-width-xs), 1fr));
		gap: var(--space-6);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8);
		color: var(--color-text-light);
	}
</style>
