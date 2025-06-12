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
	glassEffect="glass-panel"
	showFooter={true}
	content={panelContent}
	footer={panelFooter}
/>

<style>
	/* Activity-specific styles - harmonized with ProfileBanner and ContentBody */
	.activity-item {
		position: relative;
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		/* Use glass-card utility for consistent glassmorphism */
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 
			0 8px 32px 0 rgba(31, 38, 135, 0.37),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.activity-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0;
		background: linear-gradient(180deg, 
			var(--color-success) 0%, 
			var(--color-highlight) 100%
		);
		border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		transition: width 0.3s ease;
		opacity: var(--opacity-high);
	}

	.activity-item:hover::before {
		width: var(--border-width-thick);
	}

	.activity-item:hover {
		transform: var(--transform-lift-sm);
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow: 
			0 12px 40px 0 rgba(31, 38, 135, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.activity-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-3);
	}

	.activity-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-success);
		background-color: rgba(var(--color-success-rgb), var(--opacity-medium));
		padding: var(--spacing-1) var(--spacing-3);
		border-radius: var(--border-radius-full);
		flex-shrink: 0;
		white-space: nowrap;
		line-height: var(--line-height-normal);
		border: var(--border-width-thin) solid rgba(var(--color-success-rgb), var(--opacity-medium-high));
		transition: all 0.2s ease;
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
		margin-bottom: var(--spacing-2);
		transition: color 0.3s ease;
		line-height: var(--line-height-relaxed);
	}

	.activity-title:hover {
		color: var(--color-success);
	}

	.activity-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text-light);
		margin-top: var(--spacing-2);
		line-height: var(--line-height-relaxed);
	}

	/* Dark mode overrides for activity-specific elements */
	:global(html.dark) .activity-item {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 8px 32px 0 rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .activity-item:hover {
		background: rgba(0, 0, 0, 0.3);
		border-color: rgba(255, 255, 255, 0.15);
		box-shadow: 
			0 12px 40px 0 rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	:global(html.dark) .activity-type {
		background-color: rgba(var(--color-success-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-success-rgb), var(--opacity-medium-high));
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.activity-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-2);
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
		.activity-item,
		.activity-item::before,
		.activity-title,
		.activity-type {
			transition: none;
		}

		.activity-item:hover {
			transform: none;
		}
	}
</style>
