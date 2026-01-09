<script lang="ts">
	import { getActivities } from '../../stores/activities.svelte';
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';
	import PanelBase from './PanelBase.svelte';
	import Button from '../atoms/Button.svelte';

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
			<Button
				href="{base}/activities"
				variant="outline-primary"
				size="base"
				additionalClasses="glass-button"
			>
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
					href="{base}/activities/year/{year}"
					variant="outline-secondary"
					size="sm"
					additionalClasses="glass-button year-filter-button"
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
	glassEffect="glass-panel"
	showFooter={true}
	content={panelContent}
	footer={panelFooter}
/>

<style>
	/* Activity-specific styles - harmonized with ProfileBanner and ContentBody */
	.activity-item {
		--card-accent-gradient: linear-gradient(180deg, var(--color-success) 0%, var(--color-highlight) 100%);
	}

	.activity-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
	}

	.activity-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-light);
		background-color: var(--color-surface-alt);
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--border-radius-full);
		flex-shrink: 0;
		white-space: nowrap;
		line-height: var(--line-height-normal);
		border: var(--border-width-thin) solid var(--color-border);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.activity-type[data-type='publication'] {
		color: var(--color-primary);
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
	}

	.activity-type[data-type='conference'] {
		color: var(--color-accent);
		background-color: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.activity-type[data-type='workshop'] {
		color: var(--color-highlight);
		background-color: color-mix(in srgb, var(--color-highlight) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-highlight) 20%, transparent);
	}

	.activity-type[data-type='grant'] {
		color: var(--color-success);
		background-color: color-mix(in srgb, var(--color-success) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-success) 20%, transparent);
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
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		text-decoration: none;
		margin-bottom: var(--space-xs);
		transition: color var(--duration-normal) var(--ease-out);
		line-height: var(--line-height-relaxed);
	}

	.activity-title:hover {
		color: var(--color-success);
	}

	.activity-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-top: var(--space-xs);
		line-height: var(--line-height-relaxed);
	}

	/* Dark mode overrides for activity-specific elements */

	:global(html.dark) .activity-type {
		background-color: color-mix(
			in srgb,
			var(--color-success) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-success) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
	}

	/* Responsive design */
	@media (--sm-down) {
		.activity-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-xs);
		}

		.activity-date {
			text-align: left;
			align-self: flex-end;
		}

		.activity-title {
			font-size: var(--font-size-base);
		}
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.activity-title,
		.activity-type {
			transition: none !important;
			will-change: auto !important;
		}
	}
</style>
