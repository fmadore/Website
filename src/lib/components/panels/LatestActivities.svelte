<script lang="ts">
	import { activities } from '../../stores/activities';
	import type { Activity } from '$lib/types';
	import { base } from '$app/paths';
	import PanelBase from './PanelBase.svelte';
	import Button from '../atoms/Button.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';

	// Props - limit the number of activities to show
	let {
		limit = 4,
		showYearFilters = true,
		animationDelay = 750
	}: {
		limit?: number;
		showYearFilters?: boolean;
		animationDelay?: number;
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
			event: 'Event',
			grant: 'Grant'
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
			<Button
				href="{base}/activities"
				variant="outline-primary"
				size="base"
				additionalClasses="glass-button"
			>
				{#snippet children()}
					View all activities →
				{/snippet}
			</Button>
		</div>
	{/if}
{/snippet}

{#snippet panelFooter()}
	{#if showYearFilters && years.length > 0}
		<span class="filter-label">Browse by year:</span>
		<div class="year-filters">
			{#each years as year}
				<Button
					href="{base}/activities/year/{year}"
					variant="outline-secondary"
					size="sm"
					additionalClasses="glass-button year-filter-button"
				>
					{#snippet children()}
						{year}
					{/snippet}
				</Button>
			{/each}
		</div>
	{/if}
{/snippet}

<div use:scrollAnimate={{ delay: animationDelay, animationClass: 'fade-in-left' }}>
	<PanelBase
		title="Latest Activities"
		variant="activities"
		glassEffect="glass-panel"
		showFooter={true}
		content={panelContent}
		footer={panelFooter}
	/>
</div>

<style>
	/* Activity-specific styles - harmonized with ProfileBanner and ContentBody */
	.activity-item {
		position: relative;
		padding: var(--space-4);
		border-radius: var(--border-radius-md);
		transition: all var(--anim-duration-base) var(--anim-ease-base);
		overflow: hidden;
		/* Use glass-card utility for consistent glassmorphism */
		background: rgba(var(--color-white-rgb), var(--glass-surface-opacity));
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			rgba(var(--color-white-rgb), var(--glass-border-opacity));
		box-shadow:
			0 8px 32px 0 rgba(var(--glass-shadow-color), var(--glass-shadow-strength)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--glass-inset-opacity));
	}

	.activity-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 0;
		background: linear-gradient(180deg, var(--color-positive) 0%, var(--color-highlight) 100%);
		border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
		transition: width var(--anim-duration-base) var(--anim-ease-out);
		opacity: var(--opacity-high);
	}

	.activity-item:hover::before {
		width: var(--border-width-thick);
	}

	.activity-item:hover {
		transform: var(--transform-lift-sm);
		background: rgba(var(--color-white-rgb), var(--glass-surface-opacity-hover));
		border-color: rgba(var(--color-white-rgb), var(--glass-border-opacity-hover));
		box-shadow:
			0 12px 40px 0 rgba(var(--glass-shadow-color), var(--glass-shadow-strength-hover)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--glass-inset-opacity-hover));
	}

	.activity-meta {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.activity-type {
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		font-weight: var(--font-weight-semibold);
		color: var(--color-positive);
		background-color: rgba(var(--color-positive-rgb), var(--opacity-medium));
		padding: var(--space-1) var(--space-3);
		border-radius: var(--border-radius-full);
		flex-shrink: 0;
		white-space: nowrap;
		line-height: var(--line-height-normal);
		border: var(--border-width-thin) solid
			rgba(var(--color-positive-rgb), var(--opacity-medium-high));
		transition: all var(--anim-duration-fast) var(--anim-ease-out);
	}

	.activity-date {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-subtle);
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
		margin-bottom: var(--space-2);
		transition: color var(--anim-duration-base) var(--anim-ease-out);
		line-height: var(--line-height-relaxed);
	}

	.activity-title:hover {
		color: var(--color-positive);
	}

	.activity-abstract {
		font-size: var(--font-size-sm);
		color: var(--color-text-subtle);
		margin-top: var(--space-2);
		line-height: var(--line-height-relaxed);
	}

	/* Dark mode overrides for activity-specific elements */
	:global(html.dark) .activity-item {
		background: rgba(var(--color-black-rgb), var(--glass-surface-opacity-inverse));
		border: var(--border-width-thin) solid
			rgba(var(--color-white-rgb), var(--glass-border-opacity-inverse));
		box-shadow:
			0 8px 32px 0 rgba(var(--glass-shadow-color), var(--glass-shadow-strength)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--glass-inset-opacity-inverse));
	}

	:global(html.dark) .activity-item:hover {
		background: rgba(var(--color-black-rgb), var(--glass-surface-opacity-inverse-hover));
		border-color: rgba(var(--color-white-rgb), var(--glass-border-opacity-inverse-hover));
		box-shadow:
			0 12px 40px 0 rgba(var(--glass-shadow-color), var(--glass-shadow-strength-hover)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--glass-inset-opacity-inverse-hover));
	}

	:global(html.dark) .activity-type {
		background-color: rgba(var(--color-positive-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-positive-rgb), var(--opacity-medium-high));
	}

	/* Responsive design */
	@media (max-width: var(--breakpoint-sm)) {
		.activity-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
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
