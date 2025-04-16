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
            date: formatDateDMY(activity.date),
            dateISO: activity.dateISO,
            abstract: activity.description,
            type: activity.panelType || activity.type || 'activity', // Use panelType if present
            authors: []
        })).slice(0, limit);
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
            'seminar': 'Seminar',
            'publication': 'Publication',
            'lecture': 'Lecture',
            'event': 'Academic Event'
        };
        return typeMap[type] || 'Activity';
    }
    
    // Format authors for display (activities don't have authors in this context)
    function formatActivityAuthors(authors: string[]): string {
        return '';
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

<div class="latest-activities">
    <RelevantItemsList
        title="Latest Activities"
        items={relevantActivityList}
        itemTypePlural="activities"
        basePath="/activities"
        showTypeFilters={false}
        formatType={formatActivityType}
        formatAuthors={formatActivityAuthors}
    >
        <h2 class="card-title" slot="title">Latest Activities</h2>
    </RelevantItemsList>
    
    {#if showYearFilters && years.length > 0}
        <div class="year-filters-row mt-4">
            <span class="text-sm text-gray-600 browse-label">Browse by year:</span>
            <div class="filter-container">
                {#each years as year}
                    <a href="{base}/activities/year/{year}" class="year-tag">
                        {year}
                    </a>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Removed duplicate view-all link -->
</div>

<style>
    .latest-activities {
        margin-bottom: var(--spacing-4);
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
    
    .year-filters-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-4);
        margin-top: var(--spacing-4);
    }
    
    .browse-label {
        flex-shrink: 0;
        margin-right: var(--spacing-2);
    }
    
    .filter-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-2);
    }
    
    .year-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: var(--color-border);
        color: var(--color-text);
        border-radius: 9999px; /* More pill-like */
        font-size: var(--font-size-sm);
        font-weight: 600;
        transition: all 0.2s ease;
        box-shadow: 0 1px 4px 0 rgba(26,54,93,0.06); /* Subtle shadow for depth */
        border: 1px solid var(--color-border);
        cursor: pointer;
    }
    
    .year-tag:hover {
        background-color: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
        box-shadow: 0 2px 8px 0 rgba(26,54,93,0.12);
    }
    
    /* Removed unused .view-all-container, .view-all, .view-all:hover selectors */
    
    /* Utility classes */
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
</style>