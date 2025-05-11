<script lang="ts">
    import { page } from '$app/stores';
    import { activities, type Activity } from '$lib/stores/activities';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import SEO from '$lib/SEO.svelte';
    import ActivityItem from '$lib/components/activities/ActivityItem.svelte';
    import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import { onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    
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
    
    // Update filtered activities when year changes
    $: if (year) {
        activities.subscribe((value: Activity[]) => {
            filteredActivities = value.filter((a: Activity) => a.year === year);
        })();
    }

    // Define breadcrumb items
    $: breadcrumbItems = [
        // { label: 'Home', href: base || '/' }, // Removed: Breadcrumb component handles the Home link by default
        { label: 'Activities', href: `${base}/activities` },
        { label: String(year), href: `${base}/activities/year/${year}` }
    ];

    // Generate Breadcrumb JSON-LD
    $: breadcrumbJsonLdString = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `${$page.url.origin}${item.href}`
        }))
    });

    const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld-activities-year';

    onMount(() => {
        if (browser && breadcrumbJsonLdString && !document.getElementById(breadcrumbJsonLdScriptId)) {
            const script = document.createElement('script');
            script.id = breadcrumbJsonLdScriptId;
            script.type = 'application/ld+json';
            script.textContent = breadcrumbJsonLdString;
            document.head.appendChild(script);
        }
        // Clean up subscription on component destroy
        return () => {
            unsubscribe();
            if (browser) {
                const script = document.getElementById(breadcrumbJsonLdScriptId);
                if (script) {
                    document.head.removeChild(script);
                }
            }
        };
    });
</script>

<SEO title={`Activities (${year}) | Frédérick Madore`} />

<div class="container mx-auto py-6">
    <div class="flex flex-col">
        <Breadcrumb items={breadcrumbItems} />
        <div class="year-page-header-wrapper">
            <PageHeader 
                title={`Activities in ${year}`} 
            />
        </div>
        
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

    /* Reduce PageHeader bottom margin specifically for this page */
    .year-page-header-wrapper :global(header.page-header) {
        margin-bottom: var(--spacing-2) !important; /* Corresponds to mb-2, reduces from mb-6 (1.5rem) to 0.5rem */
    }
</style> 