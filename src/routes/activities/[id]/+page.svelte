<script lang="ts">
    import { page } from '$app/stores';
    import { getActivityById, type Activity } from '$lib/stores/activities';
    import { error } from '@sveltejs/kit';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    
    // Get the activity ID from the URL
    const activityId = $page.params.id;
    
    // Get the activity details
    const activity = getActivityById(activityId);
    
    // If activity not found, throw 404
    if (!activity) {
        throw error(404, 'Activity not found');
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

    // Format the tags for display
    const formattedTags = activity?.tags ? activity.tags : [];
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
        keywords={formattedTags.join(', ')}
        type="article"
        ogImage={activity.heroImage?.src ? `${base}/${activity.heroImage.src}` : `${base}/images/Profile-picture.jpg`}
    />
{/if}

<div class="container mx-auto py-6 px-4">
    {#if activity}
        <PageHeader 
            title={activity.title}
            backLinkHref="activities"
            backLinkLabel="← Back to all activities"
            date={activity.date}
            tags={formattedTags}
        />
    {/if}
    
    {#if activity.heroImage}
        <div class="activity-hero mb-6">
            <figure> <img 
                src="{base}/{activity.heroImage.src}" 
                alt={activity.heroImage.alt} 
                class="activity-image"
            >
            {#if activity.heroImage.caption}
                <figcaption class="activity-image-caption">
                    {activity.heroImage.caption}
                </figcaption>
            {/if} </figure>
        </div>
    {/if}
    
    <div class="activity-content">
        {@html activity.content || ''}
    </div>

    {#if activity.pdfPath}
        <div class="pdf-section mt-8">
            <h2 class="text-xl font-semibold mb-4">
                {activity.pdfTitle || 'Associated PDF Document'}
            </h2>
            <iframe 
                src="{base}/{activity.pdfPath}" 
                title="{activity.title} PDF Document" 
                width="100%" 
                height="800px" 
                style="border: 1px solid var(--color-border);" 
                loading="lazy"
            ></iframe>
            <a href="{base}/{activity.pdfPath}" download="{activity.id}.pdf" class="pdf-download-link mt-4 inline-block">
                Download PDF
            </a>
        </div>
    {/if}
    
    <div class="activity-footer">
        <div class="share-buttons">
            <!-- Share buttons could go here -->
        </div>
        
        <a href="{base}/activities" class="back-button">
            View all activities
        </a>
    </div>
</div>

<style>
    /* Removed styles for .activity-header, .back-link, .activity-meta */
    
    /* Keep .activity-date styling if needed elsewhere, or move to PageHeader/global */
    /* Removed .activity-date */
    
    /* Keep .activity-tags styling if needed elsewhere, or move to PageHeader/global */
    /* Removed .activity-tags */
    
    /* Keep .tag styling if needed elsewhere, or move to PageHeader/global */
    /* Removed .tag */

    /* Removed .activity-title */

    .activity-content {
        margin-top: var(--spacing-6);
    }
    
    .activity-hero figcaption {
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
        text-align: center;
        margin-top: var(--spacing-2);
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

    .pdf-section iframe {
        margin-bottom: var(--spacing-4);
    }

    .pdf-download-link {
        /* Add styling for the download link */
        background-color: var(--color-primary);
        color: white;
        padding: var(--spacing-2) var(--spacing-4);
        border-radius: var(--border-radius);
        text-decoration: none;
        transition: background-color 0.3s;
    }

    .pdf-download-link:hover {
        background-color: var(--color-primary-dark);
    }
</style> 