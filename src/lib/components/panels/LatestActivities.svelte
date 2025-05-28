<script lang="ts">
	import { activities } from '../../stores/activities';
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';
	import PanelBase from './PanelBase.svelte';

	// Props - limit the number of activities to show
	let {
		limit = 4,
		showYearFilters = true
	}: {
		limit?: number;
		showYearFilters?: boolean;
	} = $props();

	// Local activities array - derived from store and limited
	let activityList = $derived($activities.slice(0, limit));

	// Unique years for the year filter
	let years = $derived(
		[...new Set($activities.map((activity: Activity) => activity.year))].sort(
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
			event: 'Event'
		};
		return typeMap[type] || 'Activity';
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
		<ul class="activities-list">
			{#each activityList as activity (activity.id)}
				<li class="activity-item">
					<div class="activity-meta">
						{#if activity.type}
							<span class="activity-type" data-type={activity.type}>
								{formatActivityType(activity.type)}
							</span>
						{/if}
						<span class="activity-date">{formatDateDMY(activity.date)}</span>
					</div>
					<a href="{base}/activities/{activity.id}" class="activity-title leading-relaxed">
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
			<a href="{base}/activities" class="view-all-link">View all activities</a>
		</div>
	{/if}
{/snippet}

{#snippet panelFooter()}
	{#if showYearFilters && years.length > 0}
		<span class="filter-label">Browse by year:</span>
		<div class="year-filters">
			{#each years as year}
				<a href="{base}/activities/year/{year}" class="year-tag">
					{year}
				</a>
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
	/* Activity-specific styles */
	.activity-item {
		position: relative;
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.activity-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0;
		background-color: var(--color-primary);
		border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		transition: width 0.2s ease;
		opacity: var(--opacity-high);
	}

	.activity-item:hover::before {
		width: var(--border-width-thick);
	}

	.activity-item:hover {
		transform: var(--transform-lift-sm);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.activity-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-2);
	}

	.activity-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
		background-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
		padding: var(--spacing-1) var(--spacing-3);
		border-radius: var(--border-radius-full);
		flex-shrink: 0;
		white-space: nowrap;
		line-height: var(--line-height-normal);
		border: var(--border-width-thin) solid rgba(var(--color-primary-rgb), var(--opacity-medium-high));
	}

	.activity-date {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-light);
		text-align: right;
		line-height: var(--line-height-snug);
		min-width: 0;
	}

	.activity-title {
		display: block;
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		text-decoration: none;
		margin-bottom: var(--spacing-2);
		transition: color 0.2s ease;
	}

	.activity-title:hover {
		color: var(--color-primary);
	}

	.activity-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-top: var(--spacing-1);
	}

	/* Dark mode overrides for activity-specific elements */
	:global(html.dark) .activity-item {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.activity-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-1);
		}

		.activity-date {
			text-align: left;
			align-self: flex-end;
		}
	}
</style>
