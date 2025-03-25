<script lang="ts">
    import { activities, type Activity } from '$lib/stores/activities';
    import { onMount } from 'svelte';
    
    // Local activities array
    let activityList: Activity[] = [];
    let years: number[] = [];
    
    // Subscribe to the activities store
    const unsubscribe = activities.subscribe(value => {
        activityList = value;
        years = [...new Set(value.map(activity => activity.year))].sort((a, b) => b - a);
    });
    
    // Clean up subscription on component destroy
    onMount(() => {
        return () => {
            unsubscribe();
        };
    });
    
    // Get activities count by year for display
    function getCountByYear(year: number): number {
        return activityList.filter(activity => activity.year === year).length;
    }
</script>

<div class="prose">
    <h1>All Activities</h1>
    
    <div class="year-filters mb-8">
        <h2>Filter by Year</h2>
        <div class="flex flex-wrap gap-2 mt-2">
            {#each years as year}
                <a href={`/activities/year/${year}`} class="year-tag">
                    {year} ({getCountByYear(year)})
                </a>
            {/each}
        </div>
    </div>
    
    {#if activityList.length > 0}
        <ul class="activity-list">
            {#each activityList as activity}
                <li class="activity-item">
                    <div class="activity-meta">
                        <div class="activity-date">{activity.date}</div>
                        {#if activity.tags && activity.tags.length > 0}
                            <div class="activity-tags">
                                {#each activity.tags as tag}
                                    <span class="tag">{tag}</span>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    
                    <a href={`/activities/${activity.id}`} class="activity-title">
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
    {:else}
        <p>No activities found.</p>
    {/if}
</div>

<style>
    .year-tag {
        display: inline-block;
        padding: 0.35rem 1rem;
        background-color: var(--color-primary-light);
        color: var(--color-primary-dark);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-base);
        font-weight: 600;
        margin-right: var(--spacing-2);
        margin-bottom: var(--spacing-2);
        transition: all 0.2s ease;
    }
    
    .year-tag:hover {
        background-color: var(--color-primary);
        color: white;
    }
    
    .activity-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    
    .activity-item {
        margin-bottom: var(--spacing-6);
        padding-bottom: var(--spacing-6);
        border-bottom: 1px solid var(--color-border-light);
    }
    
    .activity-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing-4);
        margin-bottom: var(--spacing-2);
    }
    
    .activity-date {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
    }
    
    .activity-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-2);
    }
    
    .tag {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        font-size: var(--font-size-xs);
        background-color: var(--color-primary-light);
        color: var(--color-primary-dark);
        border-radius: var(--border-radius-full);
        font-weight: 500;
    }
    
    .activity-title {
        font-weight: 600;
        color: var(--color-text);
        text-decoration: none;
        display: block;
        line-height: 1.4;
        font-size: var(--font-size-lg);
    }
    
    .activity-title:hover {
        color: var(--color-primary);
    }
    
    .activity-description {
        margin-top: var(--spacing-2);
        color: var(--color-text-secondary);
    }
</style> 