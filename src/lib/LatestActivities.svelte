<script lang="ts">
    import { onMount } from 'svelte';
    import { activities } from './stores/activities';
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
    $: years = [...new Set(activityList.map(activity => activity.year))].sort((a, b) => b - a);
</script>

<div class="latest-activities card">
    <h2 class="card-title">Latest Activities</h2>
    
    <ul class="activity-list">
        {#each activityList as activity}
            <li class="activity-item">
                <div class="activity-date">{activity.date}</div>
                <a href="{base}/activities/{activity.id}" class="activity-title">
                    {activity.title}
                </a>
                {#if activity.description}
                    <div class="activity-description">
                        {activity.description}
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
    
    {#if showYearFilters && years.length > 0}
        <div class="year-filters mt-4">
            <span class="text-sm text-gray-600">Browse by year:</span>
            <div class="flex flex-wrap gap-2 mt-2">
                {#each years as year}
                    <a href="{base}/activities/year/{year}" class="year-tag">
                        {year}
                    </a>
                {/each}
            </div>
        </div>
    {/if}
    
    <div class="mt-4 text-right">
        <a href="{base}/activities" class="view-all">View all activities</a>
    </div>
</div>

<style>
    .latest-activities {
        background-color: white;
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-sm);
        padding: var(--spacing-4);
    }
    
    .card-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        margin-bottom: var(--spacing-4);
        color: var(--color-primary);
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--spacing-2);
    }
    
    .activity-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    
    .activity-item {
        margin-bottom: var(--spacing-4);
        padding-bottom: var(--spacing-4);
        border-bottom: 1px solid var(--color-border-light);
    }
    
    .activity-item:last-child {
        border-bottom: none;
    }
    
    .activity-date {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--spacing-1);
    }
    
    .activity-title {
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        display: block;
        line-height: 1.4;
    }
    
    .activity-title:hover {
        color: var(--color-primary);
    }
    
    .activity-description {
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-1);
        color: var(--color-text-secondary);
        line-height: 1.5;
    }
    
    .year-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: var(--color-primary-light);
        color: var(--color-primary-dark);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-sm);
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .year-tag:hover {
        background-color: var(--color-primary);
        color: white;
    }
    
    .view-all {
        color: var(--color-primary);
        font-weight: 600;
        text-decoration: none;
        font-size: var(--font-size-sm);
    }
    
    .view-all:hover {
        text-decoration: underline;
    }
</style> 