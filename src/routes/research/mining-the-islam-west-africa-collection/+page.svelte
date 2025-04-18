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
                <p>Building on my previous work with the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, this research project uses computational tools and digital humanities (DH) methods to analyse Islamic print culture and networks in Benin, Burkina Faso, Côte d'Ivoire and Togo. Using "distant reading" techniques – the computational analysis of large collections of texts – I uncover patterns in Islamic intellectual discourse and translocal dynamics.</p>
                
                <p>Drawing on 1,500 Islamic publications from the IWAC (1980-2020), this study traces how Muslim elites shaped public discourse in Francophone West Africa. Using natural language processing (NLP) techniques – including topic modelling, word embeddings, and sentiment analysis – I analyse how religious terms (<em>ummah</em>, Salafism, <em>jihad</em>) and sociopolitical concepts (democracy, <em>laïcité</em>) evolve within Islamic discourse, identifying dominant themes, semantic relations, and emotional resonance. This computational analysis will examine how religiosity intersects with morality and intellectual culture in the region.</p>
                
                <p>Network analysis of the IWAC data will map Islamic networks in Francophone West Africa, focusing on understudied local NGOs and "Islamic Francophonie" networks. By analysing connections between individuals, organisations, and institutions, I examine how French has emerged as a vehicle for Islamic discourse among urban elites. This regional focus, which departs from the typical emphasis on global Arab-Islamic connections, reveals how local Islamic networks evolved in response to social and political change.</p>
                
                <p>By combining these computational approaches with ethnographic fieldwork, I aim to provide a comprehensive understanding that neither method could achieve alone. This innovative synthesis promises new insights into the intellectual history and translocal dynamics of Muslims in Francophone West Africa, and contributes significantly to our understanding of how religiosity interacts with morality, intellectual culture and socio-political issues in this context.</p>
                
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