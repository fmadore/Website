<script lang="ts">
    import { activities, type Activity } from '$lib/stores/activities';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import SEO from '$lib/SEO.svelte';
    import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
    
    // Local activities array
    let activityList: Activity[] = [];
    let years: number[] = [];
    
    // Subscribe to the activities store
    const unsubscribe = activities.subscribe((value: Activity[]) => {
        activityList = value;
        years = [
            ...new Set(value.map((activity: Activity) => activity.year))
        ].sort((a: number, b: number) => b - a);
    });
    
    // Clean up subscription on component destroy
    onMount(() => {
        return () => {
            unsubscribe();
        };
    });
    
    // Get activities count by year for display
    function getCountByYear(year: number): number {
        return activityList.filter((activity: Activity) => activity.year === year).length;
    }
</script>

<SEO title="Activities | Frédérick Madore" />

<div class="container mx-auto py-8">
	<PageHeader title="Activities" />
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-1">
            <div class="year-sidebar rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">Browse by Year</h2>
                
                <ul class="space-y-3">
                    {#each years as year}
                        <li>
                            <a href="{base}/activities/year/{year}" class="year-link flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-colors">
                                <span>{year}</span>
                                <span class="year-count-badge bg-primary-50 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                    {getCountByYear(year)}
                                </span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
        
        <div class="md:col-span-2">
            <div class="activity-list-container rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-6 border-b pb-2">All Activities</h2>
                
                <div class="space-y-8">
                    {#each activityList as activity (activity.id)}
                        <ActivityItem {activity} />
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Apply theme variables to the main containers */
    .year-sidebar,
    .activity-list-container {
        background-color: var(--color-background);
        box-shadow: var(--shadow-md);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    /* Adjust title border color */
    .activity-list-container h2 {
        border-color: var(--color-border);
    }

    /* Adjust year link hover background and badge colors */
    .year-link:hover {
        background-color: var(--color-border) !important; /* Override Tailwind */
    }
    .year-count-badge {
        background-color: var(--color-border) !important; /* Override Tailwind */
        color: var(--color-primary) !important; /* Override Tailwind */
    }

    /* Styles for elements within ActivityItem might be needed here 
       if overriding Tailwind or base styles specifically for this page */
    /* Example: Keep these if they are necessary overrides */
    /* 
    :global(.activity-meta) {
        color: var(--color-text-light) !important;
    }
    :global(.tag) {
        background-color: var(--color-border) !important; 
        color: var(--color-text) !important; 
    }
    :global(.activity-description) {
       color: var(--color-text-light) !important; 
    }
    */
    /* Let's remove them for now and see if they are needed */
</style> 