<script lang="ts">
    import { page } from '$app/stores';
    import { getActivityById, type Activity } from '$lib/stores/activities';
    import { error } from '@sveltejs/kit';
    import SEO from '$lib/SEO.svelte';
    
    // Get the activity ID from the URL
    $: id = $page.params.id;
    $: activity = getActivityById(id);
    
    // If activity not found, throw 404 error
    $: if (!activity) {
        throw error(404, {
            message: 'Activity not found'
        });
    }

    // Define the JSON-LD structure interface
    interface JsonLd {
        "@context": string;
        "@type": string;
        name: string;
        description: string;
        datePublished: string;
        author: {
            "@type": string;
            name: string;
            jobTitle: string;
            affiliation: {
                "@type": string;
                name: string;
            };
        };
        image?: string;
        keywords?: string;
    }

    // Function to create JSON-LD structured data
    function getJsonLd(activity: Activity): string {
        const jsonLd: JsonLd = {
            "@context": "https://schema.org",
            "@type": activity.tags?.includes('article') ? "ScholarlyArticle" : 
                      activity.tags?.includes('book') ? "Book" : 
                      activity.tags?.includes('conference') ? "Event" : "CreativeWork",
            "name": activity.title,
            "description": activity.description,
            "datePublished": activity.dateISO,
            "author": {
                "@type": "Person",
                "name": "Frédérick Madore",
                "jobTitle": "Research Fellow",
                "affiliation": {
                    "@type": "Organization",
                    "name": "Leibniz-Zentrum Moderner Orient (ZMO)"
                }
            }
        };

        if (activity.heroImage) {
            jsonLd.image = activity.heroImage.src;
        }

        if (activity.tags) {
            jsonLd.keywords = activity.tags.join(", ");
        }

        return JSON.stringify(jsonLd);
    }
</script>

<svelte:head>
    {#if activity}
        <script type="application/ld+json">
            {getJsonLd(activity)}
        </script>
    {/if}
</svelte:head>

{#if activity}
    <SEO 
        title={`${activity.title} | Frédérick Madore`}
        description={activity.description}
        keywords={activity.tags ? activity.tags.join(', ') + ', Frédérick Madore, research' : 'Frédérick Madore, research'}
        type="article"
        ogImage={activity.heroImage?.src || '/images/Profile-picture.jpg'}
    />
{/if}

<div class="prose activity-detail">
    <div class="activity-meta">
        <div class="activity-date">{activity?.date}</div>
        {#if activity?.tags && activity.tags.length > 0}
            <div class="activity-tags">
                {#each activity.tags as tag}
                    <span class="tag">{tag}</span>
                {/each}
            </div>
        {/if}
    </div>

    <h1>{activity?.title}</h1>
    
    {#if activity?.content}
        <div class="activity-content">
            {@html activity.content}
        </div>
    {:else}
        <p>{activity?.description || 'No content available.'}</p>
    {/if}
    
    <div class="activity-actions">
        <a href="/activities" class="btn btn-secondary">Back to Activities</a>
        
        {#if activity?.tags && activity.tags.includes('book')}
            <a href="/publications" class="btn btn-primary">View Publications</a>
        {/if}
        
        {#if activity?.tags && activity.tags.includes('conference')}
            <a href="/conference-activity" class="btn btn-primary">View Conference Activity</a>
        {/if}
        
        {#if activity?.url}
            <a href={activity.url} class="btn btn-primary">External Link</a>
        {/if}
    </div>
</div>

<style>
    .activity-detail {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .activity-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing-4);
        margin-bottom: var(--spacing-4);
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
    
    .activity-content {
        margin-top: var(--spacing-6);
    }
    
    .activity-content :global(h2) {
        font-size: var(--font-size-2xl);
        margin-top: var(--spacing-8);
        margin-bottom: var(--spacing-4);
        font-weight: 600;
        color: var(--color-text);
    }
    
    .activity-content :global(p) {
        margin-bottom: var(--spacing-4);
        line-height: 1.7;
    }
    
    .activity-actions {
        margin-top: var(--spacing-8);
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-4);
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
    
    .btn-secondary {
        background-color: var(--color-gray-200);
        color: var(--color-text);
    }
    
    .btn-secondary:hover {
        background-color: var(--color-gray-300);
    }
</style> 