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
        { label: "Muslim Umbrella Organisations in IWAC", href: `${base}/digital-humanities/muslim-umbrella-organizations` }
    ];

	// Data or specific logic for visualizations will go here

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
    title="Muslim Umbrella Organisations in IWAC | Frédérick Madore" 
    description="Analysis of Muslim umbrella organisations in West African newspapers using co-occurrence matrices and topic modeling, based on the Islam West Africa Collection (IWAC)." 
/>

<div class="container">
    <Breadcrumb items={breadcrumbItems} />

	<PageHeader title="Muslim Umbrella Organisations in IWAC" />

    <p class="text-lg mb-8">
        This project examines the representation of Muslim umbrella organisations in West African newspaper archives sourced from the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> (IWAC). 
        Using computational text analysis techniques, we explore patterns and themes associated with these organisations.
    </p>

    <section class="visualization-section mb-12">
        <h2 class="text-2xl font-semibold mb-4">Co-occurrence Matrix</h2>
        <p class="mb-4">Visualising the frequency with which terms related to Muslim umbrella organisations appear together in the corpus.</p>

        <!-- Button for opening in full screen -->
        <div class="button-container">
            <Button 
                href="https://fmadore.github.io/IWAC-co-occurrence-matrix/index.html" 
                variant="primary" 
                target="_blank"
            >
                Open in Full Screen
            </Button>
        </div>

        <!-- Embed Co-occurrence Matrix Visualization -->
        <div class="iframe-container">
            <iframe 
                src="https://fmadore.github.io/IWAC-co-occurrence-matrix/index.html" 
                title="Co-occurrence Matrix Visualization for Muslim Umbrella Organizations in IWAC"
                frameborder="0" 
                allowfullscreen
            ></iframe>
        </div>

        <h2 class="text-2xl font-semibold mb-4">Topic Modeling</h2>
        <p class="mb-4">Identifying latent topics and themes within the articles discussing these organisations.</p>
        
        <!-- Button for opening in full screen -->
        <div class="button-container">
            <Button 
                href="https://fmadore.github.io/IWAC-topic-modelling/" 
                variant="primary" 
                target="_blank"
            >
                Open in Full Screen
            </Button>
        </div>
        
        <!-- Embed Topic Modeling Visualization -->
        <div class="iframe-container">
            <iframe 
                src="https://fmadore.github.io/IWAC-topic-modelling/"
                title="Topic Modeling Visualization for Muslim Umbrella Organizations in IWAC"
                scrolling="yes"
                frameborder="0" 
                allowfullscreen
            ></iframe>
        </div>
    </section>

</div>

<style>
    .container {
        max-width: 960px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .text-lg {
        font-size: 1.125rem; /* Equivalent to text-lg */
        line-height: 1.75rem;
    }

    .mb-8 {
        margin-bottom: 2rem;
    }
    .mb-4 {
        margin-bottom: 1rem;
    }
     .mb-12 {
        margin-bottom: 3rem;
    }

    .text-2xl {
        font-size: 1.5rem; /* Equivalent to text-2xl */
        line-height: 2rem;
    }

    .font-semibold {
        font-weight: 600;
    }

    .visualization-section h2 {
        border-bottom: 2px solid var(--color-primary-light);
        padding-bottom: 0.5rem;
    }
    
    /* Responsive iframe container */
    .iframe-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding-top: 75%; /* Aspect ratio (height/width * 100). Adjust as needed. 4:3 aspect ratio */
        border: 1px solid var(--color-border); /* Optional border */
        border-radius: var(--radius-md); /* Optional border radius */
        margin-top: 1rem; /* Add some space above the iframe */
        background-color: #f0f0f0; /* Light gray background to ensure visibility in dark mode */
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

    /* Button container styling */
    .button-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: var(--spacing-2);
    }

    /* Add other styles as needed */
</style>