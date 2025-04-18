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
        { label: "Islam West Africa Collection Overview", href: `${base}/digital-humanities/iwac-overview` }
    ];

	// import ItemReference from '$lib/components/molecules/ItemReference.svelte'; // Not needed here yet

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
    title="Islam West Africa Collection Overview | Frédérick Madore" 
    description="Interactive dashboard exploring the Islam West Africa Collection (IWAC) through various visualisations."
/>

<div class="container mx-auto px-4 py-8">
    <Breadcrumb items={breadcrumbItems} />
    
    <PageHeader 
        title="Islam West Africa Collection Overview"
    />

    <div class="rounded-box shadow-md p-6 mb-8">
        <p class="mb-4">
            This interactive data visualisation dashboard allows for dynamic exploration of the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>. Developed with Svelte and D3.js, it presents various visualisations (treemaps, bar charts, pie charts, and timelines) to analyse the distribution of collection items based on attributes such as country, language, item type, date, and word count. Users can interact with filters and explore the data dynamically with features like zooming and tooltips.
        </p>
    </div>

    <section class="visualization-section">
        <div class="iframe-container">
            <iframe 
                src="https://fmadore.github.io/IWAC-overview/index.html?lang=en&tab=countries" 
                scrolling="yes"
                frameborder="0" 
                title="Islam West Africa Collection Overview"
                allowfullscreen>
            </iframe>
        </div>
    </section>

</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-4);
    }

    .rounded-box {
        background-color: var(--color-background-alt); /* Slightly different background for description */
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
    }

    .mb-4 {
        margin-bottom: var(--spacing-4);
    }

    .mb-8 {
        margin-bottom: var(--spacing-8);
    }

    .p-6 {
        padding: var(--spacing-6);
    }

    .visualization-section {
        margin-top: var(--spacing-4);
        padding: var(--spacing-4) var(--spacing-6);
        background-color: var(--color-background); 
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
    }

    /* Link styling within description */
    .rounded-box a {
        color: var(--color-primary);
        text-decoration: underline;
    }
    .rounded-box a:hover {
        color: var(--color-primary-dark);
    }
</style>