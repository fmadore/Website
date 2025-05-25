<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
    import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import { page } from '$app/stores'; // Import page store
    import { onMount, onDestroy } from 'svelte'; // Import lifecycle functions
    import { browser } from '$app/environment'; // Import browser check

    // Pre-construct breadcrumb items with evaluated paths
    const breadcrumbItems = [
        { label: 'Research', href: `${base}/research` },
        { label: 'Religious Activism on Campuses', href: `${base}/research/religious-activism-campuses-togo-benin` }
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

<SEO title="Religious Activism on Campuses in Togo and Benin | Frédérick Madore" />

<div class="container mx-auto px-4 py-8">
    <!-- Apply grid layout to this container on medium screens and up -->
    <div class="grid"> <!-- Added grid wrapper -->
        <div class="main-content">
            <Breadcrumb items={breadcrumbItems} />
            
            <PageHeader 
                title="Religious Activism on Campuses in Togo and Benin"
            />
            
            <div class="project-image">
                <img src="{base}/images/research/campus-activism.webp" alt="Religious Activism on Campuses in Togo and Benin" class="w-full h-auto" />
            </div>

            <div class="project-content">
                <p>This project uncovers the neglected history of Christian and Muslim student associations at the Université de Lomé (Togo) and the Université d'Abomey-Calavi (Benin), and examines their resilience and adaptability over five decades. While much of the literature has focused on the role of student protests in triggering national conferences in Benin and Togo in the early 1990s, this study broadens the lens to include the significant but often overlooked religious dimension of campus life.</p>
                
                <p>Drawing on interviews with several generations of activists and press coverage from both countries, the research analyses the emergence and evolution of these religious associations under challenging political circumstances: a one-party dictatorship in Togo and a Marxist-Leninist regime in Benin. It explores how these groups navigated authoritarian rule, political liberalisation and the principles of laïcité, while shaping campus dynamics in institutions originally known as strongholds of leftist, anti-imperialist and secular ideologies.</p>
                
                <p>The study reveals the university campus as a microcosm reflecting broader national socio-political trends, while also highlighting the importance of translocal factors in shaping the internal dynamics of these groups. Amidst the massification of university enrolments and rising graduate unemployment in recent decades, faith-based associations have expanded their role beyond religious guidance. Increasingly, they offer a "social curriculum", providing a space for socialisation and a set of skills, norms and moral values that complement the secular academic curriculum.</p>
                
                <p>By analysing the interplay between religion, politics and education, this book provides new insights into the evolving role of faith in public universities and broader societal transformations in West Africa. It explores the implications of growing religiosity for these public universities as secular institutions, and contributes to our understanding of how religious organisations have coexisted with, and sometimes challenged, traditional student associations since the 1970s.</p>
            </div>
        </div>
        
        <div class="sidebar">
            <RelevantPublications projectName="Religious Activism on Campuses in Togo and Benin" limit={5} />
            <div class="mt-6">
                <RelevantCommunications projectName="Religious Activism on Campuses in Togo and Benin" limit={5} />
            </div>
        </div>
    </div> <!-- Closed grid wrapper -->
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
        .grid { /* Apply to the .grid container */
            display: grid;
            grid-template-columns: 1fr 300px; /* Main content takes remaining space, sidebar is 300px */
            gap: var(--spacing-8); /* Increased gap */
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