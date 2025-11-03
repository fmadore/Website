<script lang="ts">
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';

	// Get activities reactively
	let activities = $derived(getActivities());

	// Reactive activities array - using $derived to reactively get the store value
	let activityList = $derived(activities);

	// Years array - derived from activities and sorted in descending order
	let years = $derived(
		[...new Set(activities.map((activity: Activity) => activity.year))].sort(
			(a: number, b: number) => b - a
		)
	);

	// Get activities count by year for display - pure function approach
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

	<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
		<div class="md:col-span-1">
			<aside class="year-sidebar">
				<div class="filter-section">
					<h2 class="filter-section-title">Browse by Year</h2>

					<ul class="year-list">
						{#each years as year (year)}
							<li class="year-list-item">
								<a
									href="{base}/activities/year/{year}"
									class="year-link"
								>
									<span class="year-label">{year}</span>
									<span class="year-count">
										{getCountByYear(year)}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</aside>
		</div>

		<div class="md:col-span-3">
			<div class="activity-list-container">
				<h2 class="activities-title">All Activities</h2>

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
	/* Year sidebar - matching filter sidebar design */
	.year-sidebar {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.03) 0%,
			rgba(var(--color-highlight-rgb), 0.02) 50%,
			rgba(var(--color-accent-rgb), 0.01) 100%
		);
		backdrop-filter: blur(var(--space-xl));
		-webkit-backdrop-filter: blur(var(--space-xl));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-20));
		border-radius: var(--border-radius-md);
		padding: var(--spacing-4);
		box-shadow: var(--shadow-primary), var(--shadow-inner);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.year-sidebar:hover {
		transform: var(--transform-lift-md);
		box-shadow: var(--shadow-lg), var(--shadow-inner);
	}

	/* Filter section styling */
	.filter-section {
		background: transparent;
		border: none;
		padding: 0;
		margin-bottom: 0;
	}

	/* Section title styling - matching filter section titles */
	.filter-section-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin-top: 0; /* Override global h2 margin */
		margin-bottom: var(--spacing-4);
		padding-bottom: var(--spacing-2);
		border-bottom: var(--border-width-thin) solid var(--color-border);
	}

	/* Year list styling */
	.year-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.year-list-item {
		margin: 0;
	}

	/* Year link styling - matching filter buttons */
	.year-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--border-radius-sm);
		color: var(--color-text);
		text-decoration: none;
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
		background: transparent;
		border: var(--border-width-thin) solid transparent;
	}

	.year-link:hover {
		background: rgba(var(--color-primary-rgb), 0.08);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-20));
		color: var(--color-primary);
	}

	.year-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--spacing-1);
	}

	.year-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
	}

	/* Year count badge */
	.year-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--spacing-6);
		height: var(--spacing-6);
		padding: 0 var(--spacing-2);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		background: rgba(var(--color-primary-rgb), var(--opacity-10));
		border-radius: var(--border-radius-full);
		transition: all var(--anim-duration-fast) var(--anim-ease-base);
	}

	.year-link:hover .year-count {
		background: rgba(var(--color-primary-rgb), var(--opacity-20));
		color: var(--color-primary);
	}

	/* Activity list container */
	.activity-list-container {
		background: transparent;
		padding: 0;
	}

	/* Activities title */
	.activities-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin-bottom: var(--spacing-6);
		padding-bottom: var(--spacing-3);
		border-bottom: var(--border-width-medium) solid var(--color-border);
	}

	/* Dark mode support */
	:global(html.dark) .year-sidebar {
		background: linear-gradient(
			135deg,
			rgba(var(--color-primary-rgb), 0.06) 0%,
			rgba(var(--color-highlight-rgb), 0.04) 50%,
			rgba(var(--color-accent-rgb), 0.02) 100%
		);
		border-color: rgba(var(--color-white-rgb), var(--opacity-10));
		box-shadow:
			0 8px 32px 0 rgba(var(--color-black-rgb), var(--opacity-30)),
			var(--shadow-inner);
	}

	:global(html.dark) .year-sidebar:hover {
		box-shadow:
			0 12px 40px 0 rgba(var(--color-black-rgb), var(--opacity-40)),
			var(--shadow-inner);
	}

	:global(html.dark) .year-link:hover {
		background: rgba(var(--color-primary-rgb), 0.12);
		border-color: rgba(var(--color-primary-rgb), var(--opacity-30));
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.year-sidebar {
			margin-bottom: var(--spacing-6);
		}
	}

	/* Sticky positioning on desktop */
	@media (min-width: 769px) {
		.year-sidebar {
			position: sticky;
			top: var(--spacing-4);
		}
	}
</style>
