<script lang="ts">
    import { page } from '$app/stores';
    import { activities, type Activity } from '$lib/stores/activities';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import SEO from '$lib/SEO.svelte';
    import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
    
    // Get the year parameter from the URL
    $: year = parseInt($page.params.year);
    
    // Filter activities by year
    let filteredActivities: Activity[] = [];
    let allYears: number[] = [];
    
    // Subscribe to the store and update data
    const unsubscribe = activities.subscribe((value: Activity[]) => {
        filteredActivities = value.filter((a: Activity) => a.year === year);
        allYears = [
            ...new Set(value.map((a: Activity) => a.year))
        ].sort((a: number, b: number) => b - a);
    });
    
    // Clean up subscription on component destroy
    onMount(() => {
        return () => {
            unsubscribe();
        };
    });
    
    // Update filtered activities when year changes
    $: if (year) {
        activities.subscribe((value: Activity[]) => {
            filteredActivities = value.filter((a: Activity) => a.year === year);
        })();
    }
</script>

<SEO title={`Activities (${year}) | Frédérick Madore`} />

<div class="container mx-auto py-6">
    <div class="flex flex-col gap-4">
		<PageHeader 
			title={`Activities in ${year}`} 
			backLinkHref="activities" 
			backLinkLabel="Back to all activities"
		/>
        
        <div class="year-filters flex gap-2 overflow-x-auto py-2">
            {#each allYears as y}
                <a 
                    href="{base}/activities/year/{y}" 
                    class="year-tag {y === year ? 'active' : ''}"
                >
                    {y}
                </a>
            {/each}
        </div>
        
        {#if filteredActivities.length > 0}
            <div class="activity-grid">
                {#each filteredActivities as activity (activity.id)}
                    <ActivityItem {activity} />
                {/each}
            </div>
        {:else}
            <div class="empty-state">
                <p>No activities found for {year}.</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .year-tag {
        display: inline-block;
        padding: 0.35rem 1rem;
        background-color: var(--color-border);
        color: var(--color-text);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-base);
        font-weight: 600;
        margin-right: var(--spacing-2);
        margin-bottom: var(--spacing-2);
        transition: all 0.2s ease;
    }
    
    .year-tag:hover {
        background-color: var(--color-primary);
        color: var(--color-background);
    }
    
    .year-tag.active {
        background-color: var(--color-primary);
        color: var(--color-background);
    }
    
    .activity-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-6);
    }
    
    .empty-state {
        text-align: center;
        padding: var(--spacing-8);
        color: var(--color-text-light);
    }
</style> 