<script lang="ts">
    import { page } from '$app/stores';
    import { activities, type Activity } from '$lib/stores/activities';
    import { onMount } from 'svelte';
    
    // Get the year parameter from the URL
    $: year = parseInt($page.params.year);
    
    // Filter activities by year
    let filteredActivities: Activity[] = [];
    let allYears: number[] = [];
    
    // Subscribe to the store and update data
    const unsubscribe = activities.subscribe(value => {
        filteredActivities = value.filter(a => a.year === year);
        allYears = [...new Set(value.map(a => a.year))].sort((a, b) => b - a);
    });
    
    // Clean up subscription on component destroy
    onMount(() => {
        return () => {
            unsubscribe();
        };
    });
    
    // Update filtered activities when year changes
    $: if (year) {
        activities.subscribe(value => {
            filteredActivities = value.filter(a => a.year === year);
        })();
    }
</script>

<div class="prose">
    <h1>Activities from {year}</h1>
    
    <div class="year-filters mb-8">
        <h2>Browse Other Years</h2>
        <div class="flex flex-wrap gap-2 mt-2">
            {#each allYears as y}
                <a href={`/activities/year/${y}`} class="year-tag {y === year ? 'active' : ''}">
                    {y}
                </a>
            {/each}
        </div>
    </div>
    
    {#if filteredActivities.length > 0}
        <ul class="activity-list mt-6">
            {#each filteredActivities as activity}
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
        <p>No activities found for {year}.</p>
    {/if}
    
    <div class="mt-8">
        <a href="/activities" class="btn btn-primary">View All Activities</a>
    </div>
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
    
    .year-tag.active {
        background-color: var(--color-primary-dark);
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
    
    .btn {
        display: inline-block;
        padding: 0.5rem 1.5rem;
        text-decoration: none;
        border-radius: var(--border-radius-md);
        font-weight: 600;
        transition: background-color 0.2s;
    }
    
    .btn-primary {
        background-color: var(--color-primary);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--color-primary-dark);
    }
</style> 