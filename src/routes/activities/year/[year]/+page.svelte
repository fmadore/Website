<script lang="ts">
    import { page } from '$app/stores';
    import { activities, type Activity } from '$lib/stores/activities';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import SEO from '$lib/SEO.svelte';
    
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
                {#each filteredActivities as activity}
                    <div class="activity-card">
                        {#if activity.heroImage}
                            <div class="activity-image">
                                <img 
                                    src="{base}/{activity.heroImage.src}" 
                                    alt={activity.heroImage.alt} 
                                    class="w-full h-48 object-cover"
                                >
                            </div>
                        {/if}
                        
                        <div class="activity-content">
                            <div class="activity-date">{activity.date}</div>
                            
                            <h3 class="activity-title">
                                <a href="{base}/activities/{activity.id}">
                                    {activity.title}
                                </a>
                            </h3>
                            
                            <p class="activity-description">{activity.description}</p>
                            
                            {#if activity.tags && activity.tags.length > 0}
                                <div class="activity-tags">
                                    {#each activity.tags as tag}
                                        <span class="tag">{tag}</span>
                                    {/each}
                                </div>
                            {/if}
                            
                            <a href="{base}/activities/{activity.id}" class="read-more">
                                Read more →
                            </a>
                        </div>
                    </div>
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