<script lang="ts">
	import { activities, type Activity } from '$lib/stores/activities';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';

	// Local activities array - using $derived to reactively get the store value
	let activityList = $derived($activities);

	// Years array - derived from activities and sorted
	let years = $derived(
		[...new Set($activities.map((activity: Activity) => activity.year))].sort(
			(a: number, b: number) => b - a
		)
	);

	// Get activities count by year for display
	function getCountByYear(year: number): number {
		return activityList.filter((activity: Activity) => activity.year === year).length;
	}
</script>

<SEO title="Activities | Frédérick Madore" />

<div class="container mx-auto px-4 pb-4">
	<PageHeader title="Activities" />
	<PageIntro>
		This section provides an overview of various professional activities, including workshops,
		talks, and other engagements. You can browse by year using the sidebar.
	</PageIntro>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<div class="md:col-span-1">
			<div class="year-sidebar rounded-lg p-6">
				<h2 class="text-xl font-semibold mb-4">Browse by Year</h2>

				<ul class="space-y-3">
					{#each years as year}
						<li>
							<a
								href="{base}/activities/year/{year}"
								class="year-link flex justify-between items-center p-2 rounded transition-colors"
							>
								<span>{year}</span>
								<span class="year-count-badge px-2 py-1 rounded-full text-xs font-medium">
									{getCountByYear(year)}
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="md:col-span-2">
			<div class="activity-list-container rounded-lg p-6">
				<h2 class="text-xl font-semibold mb-6 border-b pb-2">All Activities</h2>

				<div class="space-y-8">
					{#each activityList as activity (activity.id)}
						<ActivityItem {activity} />
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Apply theme variables to the main containers */
	.year-sidebar,
	.activity-list-container {
		background-color: var(--color-background);
		box-shadow: var(--shadow-md);
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	/* Adjust title border color */
	.activity-list-container h2 {
		border-color: var(--color-border);
	}

	/* Adjust year link hover background and badge colors */
	.year-link:hover {
		background-color: var(--color-border);
	}
	.year-count-badge {
		background-color: var(--color-border);
		color: var(--color-primary);
	}
</style>
