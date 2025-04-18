<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import { base } from '$app/paths'; // Import base
    import { page } from '$app/stores'; // Import page store
    import { onMount, onDestroy } from 'svelte'; // Import lifecycle functions
    import { browser } from '$app/environment'; // Import browser check

    // Pre-construct breadcrumb items with evaluated paths
    const breadcrumbItems = [
        { label: "Digital Humanities", href: `${base}/digital-humanities` },
        { label: "IWAC Newspaper Word Cloud", href: `${base}/digital-humanities/iwac-wordcloud` }
    ];

    // Generate Breadcrumb JSON-LD
    const breadcrumbJsonLdString = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `${$page.url.origin}${item.href}`
        }))
    });

    // Manage JSON-LD script injection
    const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

    onMount(() => {
        if (browser && breadcrumbJsonLdString && !document.getElementById(breadcrumbJsonLdScriptId)) {
            const script = document.createElement('script');
            script.id = breadcrumbJsonLdScriptId;
            script.type = 'application/ld+json';
            script.textContent = breadcrumbJsonLdString;
            document.head.appendChild(script);
        }
    });

    onDestroy(() => {
        if (browser) {
            const script = document.getElementById(breadcrumbJsonLdScriptId);
            if (script) {
                document.head.removeChild(script);
            }
        }
    });
</script>

<SEO
    title="IWAC Newspaper Word Cloud | Frédérick Madore"
    description="Interactive word cloud visualising the most frequent words in newspaper articles from the Islam West Africa Collection."
/>

<div class="container">
    <Breadcrumb items={breadcrumbItems} />

    <PageHeader title="IWAC Newspaper Word Cloud" />

    <p class="mb-8">
        This interactive word cloud visualises the most frequently used words in newspaper articles from the <a href="https://islam.zmo.de/s/westafrica/page/home" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> (IWAC), excluding Islamic publications. It provides an insight into the dominant themes in Benin, Burkina Faso, Côte d'Ivoire, and Togo. Users can toggle between countries to explore national differences, with word sizes reflecting their frequency in the articles. Hover over words to see exact frequency counts.
    </p>

    <div class="iframe-container">
        <iframe
            src="https://fmadore.github.io/IWAC-wordcloud/"
            title="IWAC Wordcloud Visualization"
            scrolling="yes"
            frameborder="0"
            allowfullscreen
        ></iframe>
    </div>
</div>

<style>
    .container {
        max-width: 1200px; /* Allow wider container for the embed */
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .iframe-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding-top: 75%; /* Aspect ratio (height/width) - adjust as needed, e.g., 75% for 4:3 */
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        margin-bottom: var(--spacing-8);
    }

    .iframe-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
    }

    p {
        line-height: var(--line-height-relaxed);
    }

    .mb-8 {
        margin-bottom: var(--spacing-8);
    }
</style>