<script lang="ts">
	import { getActivities } from '../../stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { resolve } from '$app/paths';
	import PanelBase from './PanelBase.svelte';
	import Button from '../atoms/Button.svelte';
	// Activity-list styles (relocated from the global app.css); loaded wherever
	// the activities list markup appears — this panel and the /activities routes.
	import '$styles/components/activity-list.css';

	// Props - limit the number of activities to show
	let {
		limit = 4,
		showYearFilters = true
	}: {
		limit?: number;
		showYearFilters?: boolean;
	} = $props();

	// Get activities reactively
	let activities = $derived(getActivities());

	// Local activities array - derived from store and limited
	let activityList = $derived(activities.slice(0, limit));

	// Unique years for the year filter
	let years = $derived(
		[...new Set(activities.map((activity: Activity) => activity.year))].sort(
			(a: number, b: number) => b - a
		)
	);

	// Format activity type for display
	function formatActivityType(type: string): string {
		const typeMap: Record<string, string> = {
			conference: 'Conference',
			workshop: 'Workshop',
			publication: 'Publication',
			lecture: 'Lecture',
			event: 'Event',
			grant: 'Grant'
		};
		return typeMap[type.toLowerCase()] || type;
	}

	// Add a date formatting helper for '12 December 2024'
	function formatDateDMY(dateString: string): string {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;
		const day = date.getDate();
		const month = date.toLocaleString('en-GB', { month: 'long' });
		const year = date.getFullYear();
		return `${day} ${month} ${year}`;
	}
</script>

{#snippet panelContent()}
	{#if activityList.length === 0}
		<p class="no-activities">No recent activities found.</p>
	{:else}
		<ul class="activities-list grid-stagger">
			{#each activityList as activity (activity.id)}
				<li class="activity-item card-accent-border">
					<div class="activity-meta">
						{#if activity.type}
							<span class="activity-type" data-type={activity.type}>
								{formatActivityType(activity.type)}
							</span>
						{/if}
						<span class="activity-date">{formatDateDMY(activity.date)}</span>
					</div>
					<a
						href={resolve(`/activities/${activity.id}` as `/activities/${string}`)}
						class="activity-title leading-relaxed"
					>
						{activity.title}
					</a>
					{#if activity.description}
						<div class="activity-abstract leading-relaxed">
							{activity.description.length > 100
								? activity.description.substring(0, 100) + '...'
								: activity.description}
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		<div class="view-all-container">
			<Button href={resolve('/activities')} variant="outline-secondary" size="base">
				View all activities →
			</Button>
		</div>
	{/if}
{/snippet}

{#snippet panelFooter()}
	{#if showYearFilters && years.length > 0}
		<span class="filter-label">Browse by year:</span>
		<div class="year-filters">
			{#each years as year (year)}
				<Button
					href={resolve(`/activities/year/${year}` as `/activities/year/${string}`)}
					variant="outline-secondary"
					size="sm"
					additionalClasses="year-filter-button"
				>
					{year}
				</Button>
			{/each}
		</div>
	{/if}
{/snippet}

<PanelBase
	title="Latest Activities"
	variant="activities"
	showFooter={true}
	content={panelContent}
	footer={panelFooter}
/>

<style>
	/* Meta line — the DATA voice: a mono "kind" marker and a mono dateline,
	 * hairline-ruled beneath, like a finding-aid entry header. */
	.activity-meta {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-xs);
		margin-bottom: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: var(--rule-hairline) solid var(--color-border-light);
	}

	/* Type — a mono "kind" marker, no pill. Neutral by default. */
	.activity-type {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.1em;
		color: var(--color-text-light);
		flex-shrink: 0;
		white-space: nowrap;
		line-height: var(--line-height-snug);
	}

	/* Publications — the headline output — carry the lone pine accent so
	 * the panel reads with one confident accent (.impeccable.md, principle 2). */
	.activity-type[data-type='publication'] {
		color: var(--color-accent);
	}

	.activity-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-light);
		text-align: right;
		line-height: var(--line-height-snug);
		min-width: 0;
	}

	/* Title — the DOCUMENT voice: Newsreader serif. */
	.activity-title {
		display: block;
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-emphasis);
		text-decoration: none;
		margin-bottom: var(--space-xs);
		transition: color var(--duration-fast) var(--ease-out);
		line-height: var(--line-height-snug);
	}

	.activity-title:hover {
		color: var(--color-accent);
	}

	.activity-abstract {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-sm);
		color: var(--color-text-soft);
		margin-top: var(--space-xs);
		line-height: var(--line-height-relaxed);
	}

	/* Responsive design */
	@media (--sm-down) {
		.activity-title {
			font-size: var(--font-size-base);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.activity-title,
		.activity-type {
			transition: none !important;
		}
	}
</style>
