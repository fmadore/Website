<script lang="ts">
	import { getActivities } from '$lib/stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
	import TagCloud from '$lib/components/molecules/TagCloud.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Icon from '@iconify/svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Activities', '/activities');

	// Get activities reactively
	let activities = $derived(getActivities());

	// Get selected tag from URL using $derived
	let selectedTag = $derived(browser ? page.url.searchParams.get('tag') : null);

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

	// Compute tag frequencies from activities for the tag cloud
	let tagFrequencies = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const freq = new Map<string, number>();
		activityList.forEach((activity: Activity) => {
			if (activity.tags) {
				activity.tags.forEach((tag: string) => {
					freq.set(tag, (freq.get(tag) || 0) + 1);
				});
			}
		});
		return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]) as [string, number][];
	});

	// Function to clear tag filter
	function clearTagFilter() {
		goto(resolve('/activities'));
	}
</script>

<SEO
	title="Activities | Frédérick Madore"
	description="Professional activities by Frédérick Madore, including workshops, talks, conferences, and other academic engagements in digital humanities and African studies."
	keywords="activities, workshops, talks, conferences, academic events, Frédérick Madore, digital humanities, Islam, West Africa"
	canonical="https://www.frederickmadore.com/activities"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8 page-enter">
	<div class="max-w-6xl mx-auto">
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
									<a href={resolve(`/activities/year/${year}`)} class="year-link">
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
					<TagCloud
						tags={tagFrequencies}
						maxTags={25}
						itemLabel="activity"
						itemLabelPlural="activities"
						getTagHref={(tag) => `${resolve('/activities')}?tag=${encodeURIComponent(tag)}`}
					/>

					<!-- RSS Subscribe Button -->
					<div class="rss-section">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- static asset -->
						<a href="{base}/rss.xml" class="rss-subscribe-link glass-button">
							<Icon icon="mdi:rss" width="18" height="18" aria-hidden="true" />
							<span>RSS Feed</span>
						</a>
					</div>
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
						Showing {activityList.length}
						{activityList.length === 1 ? 'activity' : 'activities'}
					</p>

					{#if activityList.length > 0}
						<div class="space-y-8 grid-stagger">
							{#each activityList as activity (activity.id)}
								<div
									class="activity-row"
									animate:flip={{ duration: motionDuration(350), easing: cubicOut }}
									in:fade={{ duration: motionDuration(220), easing: cubicOut }}
									out:fade={{ duration: motionDuration(160), easing: cubicOut }}
								>
									<ActivityItem {activity} />
								</div>
							{/each}
						</div>
					{:else}
						<div class="empty-state">
							<p>No activities found{selectedTag ? ` with the tag "${selectedTag}"` : ''}.</p>
							{#if selectedTag}
								<Button
									variant="primary"
									size="sm"
									onclick={clearTagFilter}
									additionalClasses="mt-4"
									label="View all activities"
								/>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Year sidebar — warm paper tile mirroring the filter sidebar treatment.
	 * No glass blur, no primary-tinted shadow; it's a navigation aside, not a
	 * hero element. */
	.year-sidebar {
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-lg);
		padding: var(--space-lg);
		box-shadow: var(--shadow-sm);
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
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0 0 var(--space-sm) 0;
	}

	/* Year list styling */
	.year-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.year-list-item {
		margin: 0;
	}

	/* Year link styling - matching filter buttons */
	.year-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		color: var(--color-text);
		text-decoration: none;
		transition: all var(--duration-fast) var(--ease-in-out);
		background: transparent;
		border: var(--border-width-thin) solid transparent;
	}

	.year-link:hover {
		background: color-mix(in srgb, var(--color-primary) 8%, transparent);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		);
		color: var(--color-primary);
	}

	.year-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-1);
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
		min-width: var(--space-6);
		height: var(--space-6);
		padding: 0 var(--space-2);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-10) * 100%),
			transparent
		);
		border-radius: var(--border-radius-full);
		transition: all var(--duration-fast) var(--ease-in-out);
	}

	.year-link:hover .year-count {
		background: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-20) * 100%),
			transparent
		);
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
		gap: var(--space-4);
		margin-bottom: var(--space-4);
		flex-wrap: wrap;
	}

	/* Activities title */
	.activities-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		margin: 0;
		padding-bottom: var(--space-3);
		border-bottom: var(--border-width-medium) solid var(--color-border);
		flex: 1 1 auto;
	}

	/* Activities count */
	.activities-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-bottom: var(--space-6);
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: var(--space-12) var(--space-4);
		color: var(--color-text-muted);
	}

	.empty-state p {
		font-size: var(--font-size-lg);
		margin-bottom: var(--space-4);
	}

	/* Dark mode — warm dusk surfaces resolve via the --color-surface and
	 * --color-border tokens; only year-link hover needs a stronger tint to
	 * read against the darker surface. */
	:global(html.dark) .year-link:hover {
		background: color-mix(in srgb, var(--color-primary) 12%, transparent);
		border-color: color-mix(
			in srgb,
			var(--color-primary) calc(var(--opacity-30) * 100%),
			transparent
		);
	}

	/* RSS Section in sidebar */
	.rss-section {
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) 30%, transparent);
	}

	/* RSS subscribe button — primary-tinted paper chip, single accent colour.
	 * No dual-colour gradient, no inverse RGB dance in dark mode. */
	.rss-subscribe-link {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: color-mix(in srgb, var(--color-primary) 8%, transparent);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-primary) 25%, transparent);
		border-radius: var(--border-radius);
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-sm);
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.rss-subscribe-link:hover {
		background: color-mix(in srgb, var(--color-primary) 14%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 45%, transparent);
	}

	.rss-subscribe-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--space-0-5);
	}

	/* Responsive adjustments */
	@media (--md) {
		.year-sidebar {
			position: sticky;
			top: var(--space-4);
		}
	}

	@media (--sm-down) {
		.year-sidebar {
			margin-bottom: var(--space-6);
		}
	}
</style>
