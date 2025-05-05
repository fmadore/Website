<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/components/organisms/RelevantPublications.svelte';
    import RelevantCommunications from '$lib/components/organisms/RelevantCommunications.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import { page } from '$app/stores'; // Import page store
    import { onMount, onDestroy } from 'svelte'; // Import lifecycle functions
    import { browser } from '$app/environment'; // Import browser check

    // Pre-construct breadcrumb items with evaluated paths
    const breadcrumbItems = [
        { label: 'Research', href: `${base}/research` },
        { label: 'Mining the Islam West Africa Collection', href: `${base}/research/mining-the-islam-west-africa-collection` }
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

    // Update handler for iframe load event with improved reliability
    function handleIframeLoad(event: Event) {
        // Add the iframe-loaded class to the parent container when iframe loads
        if (event.target) {
            const iframe = event.target as HTMLElement;
            const container = iframe.parentNode as HTMLElement;
            if (container) {
                container.classList.add('iframe-loaded');
                console.log('Iframe loaded, animation should hide'); // Debug message
            }
        }
    }

    onMount(() => {
        if (browser && breadcrumbJsonLdString && !document.getElementById(breadcrumbJsonLdScriptId)) {
            const script = document.createElement('script');
            script.id = breadcrumbJsonLdScriptId;
            script.type = 'application/ld+json';
            script.textContent = breadcrumbJsonLdString;
            document.head.appendChild(script);
        }

        // Fallback for loading animation in case onload doesn't fire
        const loadingTimeout = setTimeout(() => {
            const containers = document.querySelectorAll('.iframe-container-loading');
            containers.forEach(container => {
                container.classList.add('iframe-loaded');
                console.log('Forced loading animation hide via timeout');
            });
        }, 5000); // 5 second timeout

        return () => {
            clearTimeout(loadingTimeout);
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

<SEO title="Mining the Islam West Africa Collection | Frédérick Madore" />

<div class="container mx-auto px-4 py-8">
    <!-- Apply grid layout to this container on medium screens and up -->
    <div class="grid">
        <div class="main-content">
            <Breadcrumb items={breadcrumbItems} />
            
            <PageHeader 
                title="Mining the Islam West Africa Collection: Mapping Print Culture and Intellectual Networks in Francophone Regions" 
            />
            
            <div class="project-image">
                <img src="{base}/images/research/IWAC.webp" alt="Mining the Islam West Africa Collection" class="w-full h-auto" />
            </div>
            
            <div class="project-content">
                <p>Scholarship on Islam in West Africa has largely focused on manuscript traditions, leaving the vibrant Muslim periodical press of the 1980s, 90s, and early 2000s comparatively understudied. This project addresses this gap by examining the emergence of modern Islamic print culture and its intellectual networks in Benin, Burkina Faso, Côte d'Ivoire, and Togo.</p>
                
                <p>Building upon the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, I combine digital humanities methods with close, qualitative reading to analyse approximately 1,500 Islamic publications published between 1980 and 2020. "Distant‑reading" techniques — topic modelling, word embeddings, and sentiment analysis — reveal shifting meanings of key religious terms (<em>ummah</em>, Salafism, <em>jihad</em>) alongside political concepts such as democracy and <em>laïcité</em>). The findings reveal dominant themes, semantic reorientations and affective registers that have shaped Muslim public discourse during a period of rapid socio-political change.</p>
                
                <p>The network analysis also maps the actors and organisations that constitute an "Islamic Francophonie". By visualising the links between authors, publishers, NGOs and state institutions, the project shows how French became a strategic medium for Islamic debate among urban elites, and how locally anchored networks interacted with, rather than merely echoed, trans-regional Arab-Islamic currents.</p>
                
                <p>By integrating computational findings with ethnographic fieldwork and close textual readings, a composite portrait of Islamic thought in Francophone West Africa emerges - one that situates religious ideas within their material, linguistic and political ecologies. In doing so, the project advances the intellectual history of the region and offers a new model for studying print publics at the intersection of religion, morality, and civic life.</p>
                
                <div class="iframe-container iframe-with-header iframe-interactive iframe-container-lightweight">
                    <div class="iframe-header">Islam West Africa Collection Overview</div>
                    <iframe 
                        src="https://fmadore.github.io/IWAC-overview/index.html" 
                        title="IWAC Visualization" 
                        frameborder="0" 
                        scrolling="yes" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                    ></iframe>
                </div>
            </div>
        </div>
        
        <div class="sidebar">
            <RelevantPublications projectName="Mining the Islam West Africa Collection" limit={5} />
            <div class="mt-6">
                <RelevantCommunications projectName="Mining the Islam West Africa Collection" limit={5} />
            </div>
        </div>
    </div>
</div>

<style>
    /* Styles for mobile first */
    .main-content {
        width: 100%;
    }
    
    .sidebar {
        width: 100%;
        margin-top: var(--spacing-8);
    }
    
    .project-image {
        margin-bottom: var(--spacing-8);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        box-shadow: var(--shadow-md);
    }
    
    .project-image img {
        width: 100%;
        height: auto;
        display: block;
    }

    /* Grid layout for medium screens and up */
    @media (min-width: 768px) {
        .grid {
            display: grid;
            grid-template-columns: 1fr 300px; /* Main content takes remaining space, sidebar is 300px */
            gap: var(--spacing-8);
        }

        .main-content {
            width: auto; /* Reset width */
        }

        .sidebar {
            width: auto; /* Reset width */
            margin-top: 0; /* Reset margin */
        }
    }
</style>