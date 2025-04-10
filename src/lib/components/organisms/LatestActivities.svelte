<script lang="ts">
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    import { activities } from '../../stores/activities';
    import type { Activity } from '$lib/types';
    import { base } from '$app/paths';
    import RelevantItemsList from '$lib/components/organisms/RelevantItemsList.svelte';
    import type { RelevantItem } from '$lib/components/organisms/RelevantItemsList.svelte';
    
    // Props - limit the number of activities to show
    export let limit = 4;
    export let showYearFilters = true;
    
    // Local activities array, mapped to RelevantItem
    let relevantActivityList: RelevantItem[] = [];
    
    // Subscribe to the activities store
    const unsubscribe = activities.subscribe(value => {
        // Map Activity[] to RelevantItem[]
        relevantActivityList = value.map((activity: Activity) => ({
            id: activity.id,
            title: activity.title,
            date: activity.date,
            dateISO: activity.dateISO,
            abstract: activity.description, // Map description to abstract
            type: 'activity', // Assign a default type or handle differently if needed
            authors: [] // Activities don't have authors
        })).slice(0, limit);
    });
    
    // Clean up subscription on component destroy
    onMount(() => {
        return () => {
            unsubscribe();
        };
    });
    
    // Unique years for the year filter - calculated from the original activity data before mapping/slicing
    $: years = [...new Set(get(activities).map((activity: Activity) => activity.year))].sort((a: number, b: number) => b - a);
    
    // Dummy formatters as Activities don't have types/authors in the same way
    function formatActivityType(type: string): string {
        // Could return a capitalized version or specific text if needed
        return 'Activity'; // Simple placeholder
    }
    function formatActivityAuthors(authors: string[]): string {
        return ''; // Activities don't list authors in this context
    }
</script>

<div class="latest-activities card">
    <RelevantItemsList
        title="Latest Activities"
        items={relevantActivityList}
        itemTypePlural="activities"
        basePath="/activities"
        projectName=""
        showTypeFilters={false}
        formatType={formatActivityType}
        formatAuthors={formatActivityAuthors}
    >
        <h2 class="card-title" slot="title">Latest Activities</h2>
    </RelevantItemsList>
    
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
        background-color: var(--color-background);
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-sm);
        padding: var(--spacing-4);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .card-title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        margin-bottom: var(--spacing-4);
        color: var(--color-primary);
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--spacing-2);
    }
    
    .year-filters {
        margin-top: var(--spacing-4);
    }
    
    .year-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: var(--color-border);
        color: var(--color-text);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-sm);
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .year-tag:hover {
        background-color: var(--color-primary);
        color: var(--color-background);
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
    
    .text-sm {
        font-size: var(--font-size-sm);
    }
    
    .text-gray-600 {
        color: var(--color-text-light);
    }
    
    .mt-4 {
        margin-top: var(--spacing-4);
    }
    
    .mt-2 {
        margin-top: var(--spacing-2);
    }
    
    .gap-2 {
        gap: var(--spacing-2);
    }
    
    .flex {
        display: flex;
    }
    
    .flex-wrap {
        flex-wrap: wrap;
    }
    
    .text-right {
        text-align: right;
    }
</style> 