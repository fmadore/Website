<script lang="ts">
    import { activities, type Activity } from '$lib/stores/activities';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    
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

<div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-8 text-primary">Activities</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4">Browse by Year</h2>
                
                <ul class="space-y-3">
                    {#each years as year}
                        <li>
                            <a href="{base}/activities/year/{year}" class="flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-colors">
                                <span>{year}</span>
                                <span class="bg-primary-50 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                    {getCountByYear(year)}
                                </span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
        
        <div class="md:col-span-2">
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-6 border-b pb-2">All Activities</h2>
                
                <div class="space-y-8">
                    {#each activityList as activity}
                        <div class="activity-card">
                            <div class="flex flex-col md:flex-row gap-4">
                                {#if activity.heroImage}
                                    <div class="activity-image-container md:w-1/3 flex-shrink-0">
                                        <img 
                                            src="{base}/{activity.heroImage.src}" 
                                            alt={activity.heroImage.alt} 
                                            class="w-full h-auto rounded-md"
                                        >
                                    </div>
                                {/if}
                                
                                <div class={activity.heroImage ? "md:w-2/3" : "w-full"}>
                                    <div class="mb-2 flex items-center text-sm text-gray-500">
                                        <span class="mr-3">{activity.date}</span>
                                        {#if activity.tags && activity.tags.length > 0}
                                            <div class="flex gap-2 flex-wrap">
                                                {#each activity.tags as tag}
                                                    <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                                        {tag}
                                                    </span>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <h3 class="text-xl font-medium mb-2">
                                        <a href="{base}/activities/{activity.id}" class="text-primary hover:underline">
                                            {activity.title}
                                        </a>
                                    </h3>
                                    
                                    <p class="text-gray-600">{activity.description}</p>
                                    
                                    <div class="mt-4">
                                        <a href="{base}/activities/{activity.id}" class="text-primary hover:underline font-medium text-sm">
                                            Read more →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Remove all styles from here */
</style> 