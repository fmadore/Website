<script lang="ts">
    import { page } from '$app/stores';
    import { error } from '@sveltejs/kit';
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import ItemReference from '$lib/components/molecules/ItemReference.svelte';
    import type { Activity } from '$lib/types';
    import type { PageData } from './$types';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    // Added imports for consistency
    import HeroImageDisplay from '$lib/components/molecules/HeroImageDisplay.svelte';
    import TagList from '$lib/components/molecules/TagList.svelte';
    import ActionLinks from '$lib/components/molecules/ActionLinks.svelte';
    import AbstractSection from '$lib/components/molecules/AbstractSection.svelte';

    // Get data from the load function
    export let data: PageData;
    $: activity = data.activity;
    $: jsonLdString = data.jsonLdString;

    // Helper function to truncate title at the first colon (copied from publications page)
    function truncateTitle(title: string): string {
        const colonIndex = title.indexOf(':');
        return colonIndex > -1 ? title.substring(0, colonIndex) + '...' : title;
    }

    // Define breadcrumb items
    $: breadcrumbItems = [
        { label: 'Activities', href: `${base}/activities` },
        { label: truncateTitle(activity.title), href: `${base}/activities/${activity.id}` } // Use truncated title
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

    // Helper function to format panelType for display
    function formatPanelType(panelType: string | undefined): string {
        if (!panelType) return '';
        return panelType.charAt(0).toUpperCase() + panelType.slice(1);
    }

    const activityJsonLdScriptId = 'activity-json-ld';
    const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

    onMount(() => {
        if (browser) {
            // Add activity JSON-LD (existing logic)
            if (jsonLdString && !document.getElementById(activityJsonLdScriptId)) {
                const script = document.createElement('script');
                script.id = activityJsonLdScriptId;
                script.type = 'application/ld+json';
                script.textContent = jsonLdString;
                document.head.appendChild(script);
            }
            // Add breadcrumb JSON-LD
            if (breadcrumbJsonLdString && !document.getElementById(breadcrumbJsonLdScriptId)) {
                const script = document.createElement('script');
                script.id = breadcrumbJsonLdScriptId;
                script.type = 'application/ld+json';
                script.textContent = breadcrumbJsonLdString;
                document.head.appendChild(script);
            }
        }
    });

    onDestroy(() => {
        if (browser) {
            // Remove activity JSON-LD (existing logic)
            const activityScript = document.getElementById(activityJsonLdScriptId);
            if (activityScript) {
                document.head.removeChild(activityScript);
            }
            // Remove breadcrumb JSON-LD
            const breadcrumbScript = document.getElementById(breadcrumbJsonLdScriptId);
            if (breadcrumbScript) {
                document.head.removeChild(breadcrumbScript);
            }
        }
    });

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
    <!-- Remove the JsonLdScript component from here -->
    <!-- {#if jsonLdString}
        <JsonLdScript jsonString={jsonLdString} />
    {/if} -->
</svelte:head>

{#if activity}
    <SEO 
        title={`${truncateTitle(activity.title)} | Frédérick Madore`}
        description={activity.description}
        keywords={formattedTags.join(', ')}
        type="article"
        ogImage={activity.heroImage?.src ? `${base}/${activity.heroImage.src}` : `${base}/images/Profile-picture.webp`}
    />
{/if}

<div class="container mx-auto py-8 px-4">
    {#if activity}
        <article class="activity-article rounded-lg p-6 mb-8">
            <Breadcrumb items={breadcrumbItems} />
            <PageHeader 
                title={activity.title}
                date={activity.date}
                typeBadgeText={formatPanelType(activity.panelType)}
            />
            
            {#if activity.heroImage && activity.heroImage.src}
                <HeroImageDisplay 
                    heroImage={{ src: `${base}/${activity.heroImage.src}`, alt: activity.heroImage.alt ?? activity.title, caption: activity.heroImage.caption }}
                    imageClass="w-full max-w-md h-auto rounded-md mx-auto"
                    figcaptionClass="text-text-muted text-sm mt-2 italic text-center"
                />
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
                    <h2 class="text-xl font-semibold mb-4 text-text-headings">
                        {activity.pdfTitle || 'Associated Document'}
                    </h2>
                    <iframe 
                        src="{base}/{activity.pdfPath}" 
                        title="{activity.title} PDF Document" 
                        width="100%" 
                        height="800px" 
                        style="border: 1px solid var(--color-border);" 
                        loading="lazy"
                    ></iframe>
                </div>
            {/if}

            {#if formattedTags && formattedTags.length > 0}
                <TagList tags={formattedTags} baseUrl="/activities?tag=" sectionClass="mt-6 mb-6" />
            {/if}
        </article>
    {/if}
</div>

<style>
    /* Theme styles for main article container */
    .activity-article {
        background-color: var(--color-background);
        box-shadow: var(--shadow-md);
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    /* Removed styles for .activity-header, .back-link, .activity-meta, .activity-date, .activity-tags, .tag, .activity-title */
    /* Removed .activity-hero figcaption (handled by HeroImageDisplay or its classes) */
    /* Removed .pdf-download-link (handled by ActionLinks) */
    
    .activity-content {
        margin-top: var(--spacing-6);
    }
    
    /* This style for HeroImageDisplay's caption might be redundant if figcaptionClass on component works as expected */
    /* Keeping it just in case HeroImageDisplay doesn't fully style its caption or needs this as a global override */
    /* However, ideally this would be handled by the component's own styling or props like figcaptionClass */
    /* .activity-hero figcaption { 
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
        text-align: center;
        margin-top: var(--spacing-2);
    } */
    
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

    /* Styles for pdf-download-link are removed as ActionLinks should handle button/link styling */
</style> 