<script lang="ts">
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	import TagCloud from '$lib/components/activities/TagCloud.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	// Get activities reactively
	let activities = $derived(getActivities());

	// Get selected tag from URL using $derived
	let selectedTag = $derived(browser ? $page.url.searchParams.get('tag') : null);

	// Filter activities by selected tag using $derived
	let activityList = $derived(
		selectedTag
			? activities.filter((activity: Activity) =>
					activity.tags?.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
				)
			: activities
	);

	// Years array - derived from filtered activities and sorted in descending order
	let years = $derived(
		[...new Set(activityList.map((activity: Activity) => activity.year))].sort(
			(a: number, b: number) => b - a
		)
	);

	// Get activities count by year for display - pure function approach
	function getCountByYear(year: number): number {
		return activityList.filter((activity: Activity) => activity.year === year).length;
	}

	// Function to clear tag filter
	function clearTagFilter() {
		goto(`${base}/activities`);
	}
</script>

<SEO title="Activities | Frédérick Madore" />

<div class="container py-8 page-enter">
	<PageHeader title="Activities" />
	<PageIntro>
		This section provides an overview of various professional activities, including workshops,
		talks, and other engagements. You can browse by year using the sidebar.
	</PageIntro>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<div class="lg:col-span-1">
			<aside class="year-sidebar scroll-reveal">
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

				<!-- Tag Cloud Component - show tags from filtered activities -->
				<TagCloud activities={activityList} maxTags={25} />
			</aside>
		</div>

		<div class="lg:col-span-3">
			<div class="activity-list-container">
				<div class="activities-header">
					<h2 class="activities-title">
						{#if selectedTag}
							Activities tagged with "{selectedTag}"
						{:else}
							All Activities
						{/if}
					</h2>
					{#if selectedTag}
						<Button variant="primary" size="sm" onclick={clearTagFilter} label="Clear filter" />
					{/if}
				</div>

				<p class="activities-count">
					Showing {activityList.length} {activityList.length === 1 ? 'activity' : 'activities'}
				</p>

				{#if activityList.length > 0}
					<div class="space-y-8 grid-stagger">
						{#each activityList as activity (activity.id)}
							<ActivityItem {activity} />
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<p>No activities found{selectedTag ? ` with the tag "${selectedTag}"` : ''}.</p>
						{#if selectedTag}
							<Button variant="primary" size="sm" onclick={clearTagFilter} additionalClasses="mt-4" label="View all activities" />
						{/if}
					</div>
				{/if}
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
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
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
		border-radius: var(--border-radius-md);
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

	/* Activities header - flex container for title and button */
	.activities-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-4);
		margin-bottom: var(--spacing-4);
		flex-wrap: wrap;
	}

	/* Activities title */
	.activities-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin: 0;
		padding-bottom: var(--spacing-3);
		border-bottom: var(--border-width-medium) solid var(--color-border);
		flex: 1 1 auto;
	}

	/* Activities count */
	.activities-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-6);
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: var(--spacing-12) var(--spacing-4);
		color: var(--color-text-muted);
	}

	.empty-state p {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-4);
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
	@media (--md) {
		.year-sidebar {
			position: sticky;
			top: var(--spacing-4);
		}
	}

	@media (max-width: 767px) {
		.year-sidebar {
			margin-bottom: var(--spacing-6);
		}
	}
</style>
