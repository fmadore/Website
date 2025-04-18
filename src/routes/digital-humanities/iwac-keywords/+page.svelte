<script lang="ts">
    import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import Button from '$lib/components/atoms/Button.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import { base } from '$app/paths'; // Import base
    import { page } from '$app/stores'; // Import page store
    import { onMount, onDestroy } from 'svelte'; // Import lifecycle functions
    import { browser } from '$app/environment'; // Import browser check

    // Pre-construct breadcrumb items with evaluated paths
    const breadcrumbItems = [
        { label: "Digital Humanities", href: `${base}/digital-humanities` },
        { label: "IWAC Keywords Dashboard", href: `${base}/digital-humanities/iwac-keywords` }
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
    title="IWAC Keywords Dashboard | Frédérick Madore" 
    description="Interactive analysis of keyword evolution in West African newspapers from the Islam West Africa Collection."
/>

<div class="container mx-auto px-4 py-8">
    <Breadcrumb items={breadcrumbItems} />
    
    <PageHeader 
        title="IWAC Keywords Dashboard"
    />

    <div class="rounded-box shadow-md p-6 mb-8">
        <p class="mb-4">
            This interactive visualization analyzes the chronological evolution of themes in West African press through a time series of key keywords identified in the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a>. Developed with Shiny for Python, the interface enables multidimensional data exploration by filtering by country, newspaper, category, and time period.
        </p>
        <p class="mb-4">
            The main chart reveals underlying trends (such as the gradual emergence of discourse on terrorism after 2001) and peaks in media attention related to specific events. Users can compare up to five themes simultaneously to analyze their temporal correlations or divergences. For example, we can observe how mentions of "Arab cooperation" historically preceded those of "terrorism and radicalization," illustrating the evolution of representations of relations between West Africa and the Arab world.
        </p>
    </div>

    <section class="visualization-section">
        <div class="button-container">
            <Button 
                href="https://fmadore.shinyapps.io/iwac_keywords/" 
                variant="primary" 
                target="_blank"
            >
                Open in Full Screen
            </Button>
        </div>
        <div class="visualization-section">
            <div class="iframe-container">
                <iframe 
                    src="https://fmadore.shinyapps.io/iwac_keywords/"
                    title="IWAC Keywords Dashboard"
                    scrolling="yes"
                    frameborder="0"
                    allowfullscreen
                ></iframe>
            </div>
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
        background-color: var(--color-background-alt);
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
    
    .button-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: var(--spacing-2);
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