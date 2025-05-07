<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import { base } from '$app/paths'; // Import base
    import { page } from '$app/stores'; // Import page store
    import { onMount, onDestroy } from 'svelte'; // Import lifecycle functions
    import { browser } from '$app/environment'; // Import browser check

    const projectId = "iwac-bibliographic-data-wikidata";
    const projectTitle = "IWAC Bibliographic Data on Wikidata";

    // Pre-construct breadcrumb items
    const breadcrumbItems = [
        { label: "Digital Humanities", href: `${base}/digital-humanities` },
        { label: projectTitle, href: `${base}/digital-humanities/${projectId}` }
    ];

    // Generate Breadcrumb JSON-LD
    let breadcrumbJsonLdString = '';
    $: { // Reactive block to update breadcrumbJsonLdString when page.url.origin is available
        if ($page.url.origin) {
            breadcrumbJsonLdString = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbItems.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.label,
                    "item": `${$page.url.origin}${item.href}`
                }))
            });
        }
    }

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

    const projectDescription = "Inspired by the WikiCite initiative, which aims 'to develop open citations and linked bibliographic data to serve free knowledge', the metadata of all the bibliographical references of the Islam West Africa Collection has been uploaded to Wikidata to make them to be more openly citable and accessible.";
</script>

<SEO
    title="{projectTitle} | Digital Humanities | Frédérick Madore"
    description="Integration of Islam West Africa Collection's bibliographic metadata into Wikidata for enhanced open access and citability."
/>

<div class="container">
    <Breadcrumb items={breadcrumbItems} />

    <PageHeader title={projectTitle} />

    <p class="text-lg mb-8">
        {projectDescription}
    </p>

    <section class="project-content mb-12">
        <h2 class="text-2xl font-semibold mb-4">Project Overview</h2>
        <p class="mb-4">
            The Islam West Africa Collection (IWAC) boasts a significant number of bibliographical references. 
            To align with the principles of open science and the <a href="https://wikicite.org/" target="_blank" rel="noopener noreferrer">WikiCite initiative</a>, 
            the metadata for these references has been uploaded to Wikidata. This effort makes the bibliographic data more discoverable, 
            interoperable, and reusable by the global research community.
        </p>
        <p class="mb-4">
            By integrating with Wikidata, the IWAC bibliographic data benefits from a structured, linked data environment. This not only enhances its visibility 
            but also allows for complex queries and connections with other datasets, fostering new research possibilities. The skills involved in this project include
            data modeling for Wikidata, use of tools like OpenRefine for data cleaning and reconciliation, and understanding of linked data principles and metadata standards.
            The project also leverages platforms like <a href="https://scholia.toolforge.org/" target="_blank" rel="noopener noreferrer">Scholia</a> to visualize and explore the scholarly contributions.
        </p>
        
        <!-- Optional: Add a section for how to access or query the data on Wikidata -->
        <!-- 
        <h3 class="text-xl font-semibold mb-3">Accessing the Data</h3>
        <p class="mb-4">
            The bibliographic data can be explored directly on Wikidata using specific queries or by browsing items related to the Islam West Africa Collection.
            (Consider adding a link to a sample query or a relevant Wikidata page if available).
        </p>
        -->
    </section>

    <!-- You can add more sections here, for example, methodology, outcomes, etc. -->

</div>

<style>
    .container {
        max-width: var(--max-width-container, 960px); /* Standard width for content pages, fallback if var not defined */
        margin: var(--spacing-8) auto;
        padding: 0 var(--spacing-4);
    }

    .text-lg {
        font-size: var(--font-size-lg, 1.125rem); 
        line-height: var(--line-height-lg, 1.75rem);
    }

    .mb-8 {
        margin-bottom: var(--spacing-8);
    }
    .mb-4 {
        margin-bottom: var(--spacing-4);
    }
    /* .mb-3 was unused and has been removed */
    .mb-12 {
        margin-bottom: var(--spacing-12);
    }

    .text-2xl {
        font-size: var(--font-size-2xl, 1.5rem); 
        line-height: var(--line-height-2xl, 2rem);
    }
    /* .text-xl was unused and has been removed */

    .font-semibold {
        font-weight: var(--font-weight-semibold, 600);
    }

    .project-content h2 {
        border-bottom: var(--border-width-md, 2px) solid var(--color-primary-light);
        padding-bottom: var(--spacing-2);
        margin-top: var(--spacing-6);
    }
    /* .project-content h3 was unused and has been removed */

    p {
        line-height: var(--line-height-relaxed, 1.6); /* Ensure good readability */
    }

    a {
        color: var(--color-primary-dark);
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
</style>
