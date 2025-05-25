<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { activities } from '../../stores/activities';
    import type { Activity } from '$lib/types';
    import { base } from '$app/paths';
    
    // Props - limit the number of activities to show
    export let limit = 4;
    export let showYearFilters = true;
    
    // Local activities array
    let activityList: Activity[] = [];
    
    // Subscribe to the activities store
    const unsubscribe = activities.subscribe(value => {
        activityList = value.slice(0, limit);
    });
    
    // Clean up subscription on component destroy
    onMount(() => {
        return () => {
            unsubscribe();
        };
    });
    
    // Unique years for the year filter
    $: years = [...new Set(get(activities).map((activity: Activity) => activity.year))].sort((a: number, b: number) => b - a);
    
    // Format activity type for display
    function formatActivityType(type: string): string {
        const typeMap: Record<string, string> = {
            'conference': 'Conference',
            'workshop': 'Workshop',
            'publication': 'Publication',
            'lecture': 'Lecture',
            'event': 'Event'
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

<div class="latest-activities-panel">
    <div class="panel-header">
        <h2 class="panel-title">Latest Activities</h2>
    </div>

    {#if activityList.length === 0}
        <div class="panel-content">
            <p class="no-activities">No recent activities found.</p>
        </div>
    {:else}
        <div class="panel-content">
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
                        </div>                        <a href="{base}/activities/{activity.id}" class="activity-title leading-relaxed">
                            {activity.title}
                        </a>
                        {#if activity.description}
                            <div class="activity-abstract leading-relaxed">
                                {activity.description.length > 100 ? activity.description.substring(0, 100) + '...' : activity.description}
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>

            <div class="view-all-container">
                <a href="{base}/activities" class="view-all-link">View all activities</a>
            </div>
        </div>
    {/if}
    
    {#if showYearFilters && years.length > 0}
        <div class="year-filters-section">
            <span class="filter-label">Browse by year:</span>
            <div class="year-filters">
                {#each years as year}
                    <a href="{base}/activities/year/{year}" class="year-tag">
                        {year}
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .latest-activities-panel {
        background: var(--color-surface);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--color-surface-border);
        overflow: hidden;
    }

    .panel-header {
        padding: var(--spacing-6) var(--spacing-6) var(--spacing-4) var(--spacing-6);
        border-bottom: 1px solid var(--color-surface-border);
        background: var(--color-surface-alt);
    }

    .panel-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        margin: 0;
        color: var(--color-primary);
    }

    .panel-content {
        padding: var(--spacing-6);
    }    .no-activities {
        color: var(--color-text-light);
        font-style: italic;
        text-align: center;
        margin: 0;
        padding: var(--spacing-4) 0;
    }

    .activities-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
    }

    .activity-item {
        position: relative;
        padding: var(--spacing-4);
        border-radius: var(--border-radius-md);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        transition: all 0.2s ease;
    }    .activity-item::before {
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
    }    .activity-type {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        font-weight: 600;
        color: var(--color-primary);
        background-color: rgba(var(--color-primary-rgb), var(--opacity-medium));
        padding: var(--spacing-1) var(--spacing-3);
        border-radius: var(--border-radius-full);
        flex-shrink: 0;
        white-space: nowrap;
        line-height: 1.5;
        border: 1px solid rgba(var(--color-primary-rgb), var(--opacity-medium-high));
    }.activity-date {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-light);
        text-align: right;
        line-height: 1.4;
        min-width: 0;
    }    .activity-title {
        display: block;
        font-size: var(--font-size-base);
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        margin-bottom: var(--spacing-2);
        transition: color 0.2s ease;
    }

    .activity-title:hover {
        color: var(--color-primary);
    }    .activity-abstract {
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
        margin-top: var(--spacing-1);
    }

    .view-all-container {
        margin-top: var(--spacing-5);
        padding-top: var(--spacing-4);
        border-top: 1px solid var(--color-border);
        text-align: center;
    }

    .view-all-link {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-4);
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
        font-size: var(--font-size-sm);
        border-radius: var(--border-radius-md);
        transition: all 0.2s ease;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
    }    .view-all-link:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: var(--transform-lift-sm);
        box-shadow: var(--shadow-sm);
    }

    .view-all-link::after {
        content: "→";
        font-size: var(--font-size-sm);
        transition: transform 0.2s ease;
    }

    .view-all-link:hover::after {
        transform: translateX(2px);
    }

    .year-filters-section {
        padding: var(--spacing-4) var(--spacing-6) var(--spacing-6) var(--spacing-6);
        border-top: 1px solid var(--color-surface-border);
        background: var(--color-surface-alt);
    }    .filter-label {
        display: block;
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-light);
        margin-bottom: var(--spacing-3);
    }

    .year-filters {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-2);
    }

    .year-tag {
        display: inline-block;
        padding: var(--spacing-2) var(--spacing-3);
        background-color: var(--color-surface);
        color: var(--color-text);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-sm);
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
    }    .year-tag:hover {
        background-color: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: var(--transform-lift-sm);
        box-shadow: var(--shadow-md);
    }

    /* Dark mode overrides */
    :global(html.dark) .latest-activities-panel {
        background: var(--color-surface);
        border-color: var(--color-surface-border);
        box-shadow: var(--shadow-sm);
    }

    :global(html.dark) .panel-header {
        background: var(--color-surface-alt);
        border-color: var(--color-surface-border);
    }

    :global(html.dark) .activity-item {
        background: var(--color-surface);
        border-color: var(--color-border);
    }

    :global(html.dark) .year-filters-section {
        background: var(--color-surface-alt);
        border-color: var(--color-surface-border);
    }

    :global(html.dark) .year-tag {
        background: var(--color-surface);
        border-color: var(--color-border);
    }

    :global(html.dark) .view-all-link {
        background: var(--color-surface);
        border-color: var(--color-border);
    }

    /* Responsive design */
    @media (max-width: 640px) {
        .panel-content {
            padding: var(--spacing-4);
        }
        
        .panel-header {
            padding: var(--spacing-4);
        }

        .activity-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-1);
        }

        .activity-date {
            text-align: left;
            align-self: flex-end;
        }

        .year-filters-section {
            padding: var(--spacing-4);
        }
    }
</style>