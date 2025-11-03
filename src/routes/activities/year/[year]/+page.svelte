<script lang="ts">
	import { page } from '$app/stores';
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import SEO from '$lib/SEO.svelte';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
	import { browser } from '$app/environment';

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

	// Generate Breadcrumb JSON-LD - reactive to breadcrumb changes
	let breadcrumbJsonLdString = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbItems.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				item: `${$page.url.origin}${item.href}`
			}))
		})
	);

	const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld-activities-year';

	// Handle JSON-LD script injection with $effect
	$effect(() => {
		if (browser && breadcrumbJsonLdString) {
			let script = document.getElementById(breadcrumbJsonLdScriptId) as HTMLScriptElement | null;

			if (script) {
				// Update existing script
				script.textContent = breadcrumbJsonLdString;
			} else {
				// Create new script
				script = document.createElement('script');
				script.id = breadcrumbJsonLdScriptId;
				script.type = 'application/ld+json';
				script.textContent = breadcrumbJsonLdString;
				document.head.appendChild(script);
			}
		}

		// Cleanup when component is destroyed
		return () => {
			if (browser) {
				const script = document.getElementById(breadcrumbJsonLdScriptId);
				if (script && script.parentElement === document.head) {
					document.head.removeChild(script);
				}
			}
		};
	});
</script>

<SEO title={`Activities (${year}) | Frédérick Madore`} />

<div class="container mx-auto py-6">
	<div class="flex flex-col">
		<Breadcrumb items={breadcrumbItems} />
		<div class="year-page-header-wrapper">
			<PageHeader title={`Activities in ${year}`} />
		</div>

		<div class="year-filters flex gap-2 overflow-x-auto py-2">
			{#each allYears as y (y)}
				<a href="{base}/activities/year/{y}" class="year-tag {y === year ? 'active' : ''}">
					{y}
				</a>
			{/each}
		</div>

		{#if filteredActivities.length > 0}
			<div class="activity-grid">
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
		padding: var(--spacing-2) var(--spacing-4);
		background-color: var(--color-border);
		color: var(--color-text);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		margin-right: var(--spacing-2);
		margin-bottom: var(--spacing-2);
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
		gap: var(--spacing-6);
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-8);
		color: var(--color-text-light);
	}

	/* Reduce PageHeader bottom margin specifically for this page */
	.year-page-header-wrapper :global(header.page-header) {
		margin-bottom: var(
			--spacing-2
		) !important; /* Corresponds to mb-2, reduces from mb-6 (1.5rem) to 0.5rem */
	}
</style>
