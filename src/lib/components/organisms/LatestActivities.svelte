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

<div class="latest-activities-container">
    <RelevantItemsList
        title="Latest Activities"
        items={relevantActivityList}
        itemTypePlural="activities"
        basePath="/activities"
        viewAllPath="/activities"
        formatType={formatActivityType}
        formatAuthors={formatActivityAuthors}
    >
        <h2 class="item-panel-title" slot="title">Latest Activities</h2>
    </RelevantItemsList>
    
    {#if showYearFilters && years.length > 0}
        <div class="item-panel-filter-row mt-4">
            <span class="item-panel-filter-label">Browse by year:</span>
            <div class="item-panel-filter-container">
                {#each years as year}
                    <a href="{base}/activities/year/{year}" class="item-panel-tag">
                        {year}
                    </a>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Removed duplicate view-all link -->
</div>

<style>
    /* .latest-activities-container ruleset removed as it was empty */
    
    /* Styles for .card-title, .year-filters-row, .browse-label, .filter-container, .year-tag are now in item-panel.css */
    /* Utility classes .text-sm, .text-gray-600, .mt-4 are assumed to be global or defined elsewhere */

    /* Minimal styles specific to LatestActivities if any, otherwise this block can be emptied or removed */
    /* For example, if mt-4 on item-panel-filter-row is always desired for this component specifically */
    .item-panel-filter-row.mt-4 { /* Making it more specific if mt-4 is kept */
        margin-top: var(--spacing-4);
    }

</style>