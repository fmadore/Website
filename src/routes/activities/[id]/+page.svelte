<script lang="ts">
    import { page } from '$app/stores';
    import { error } from '@sveltejs/kit';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import ItemReference from '$lib/components/molecules/ItemReference.svelte';
    import type { Activity } from '$lib/types';
    import type { PageData } from './$types';

    // Get data from the load function
    export let data: PageData;
    $: activity = data.activity;
    $: jsonLdString = data.jsonLdString;

    // Format the tags for display
    const formattedTags = activity?.tags ? activity.tags : [];

    // --- Content Parsing Logic (Keep as is, uses activity from data) ---
    interface ContentSegment {
        type: 'html' | 'ItemReference';
        value?: string; // For html type
        id?: string;    // For ItemReference type
    }

    let contentSegments: ContentSegment[] = [];
    $: if (activity?.content) {
        const rawContent = activity.content.replace(/href="\/([^\/])/g, `href="${base}/$1`);
        const regex = /<ItemReference\s+id="([^"]+)"\s*\/>/g;
        const segments: ContentSegment[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(rawContent)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ type: 'html', value: rawContent.substring(lastIndex, match.index) });
            }
            segments.push({ type: 'ItemReference', id: match[1] });
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < rawContent.length) {
            segments.push({ type: 'html', value: rawContent.substring(lastIndex) });
        }
        contentSegments = segments;
    } else {
        contentSegments = [];
    }
    // --- End Content Parsing Logic ---
</script>

<svelte:head>
    {#if jsonLdString}
        <script type="application/ld+json">
            {@html jsonLdString}
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
        <!-- Render parsed content segments -->
        {#each contentSegments as segment}
            {#if segment.type === 'html'}
                {@html segment.value}
            {:else if segment.type === 'ItemReference' && segment.id}
                <ItemReference id={segment.id} />
            {/if}
        {/each}
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

    /* Allow inline display for ItemReference within paragraphs */
    .activity-content :global(.item-reference) {
        display: inline;
        margin: 0 0.1em; /* Add slight spacing around the reference */
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