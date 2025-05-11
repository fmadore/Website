<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    const projectId = "burkina-faso-digital-exhibits";
    const projectTitle = "Digital Exhibits on Islam in Burkina Faso";

    // Pre-construct breadcrumb items
    const breadcrumbItems = [
        { label: "Digital Humanities", href: `${base}/digital-humanities` },
        { label: projectTitle, href: `${base}/digital-humanities/${projectId}` }
    ];

    // Generate Breadcrumb JSON-LD
    let breadcrumbJsonLdString: string | null = null;
    $: if ($page.url) { // Ensure $page.url is available
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

    const projectDescription = "These two digital exhibits on Burkina Faso, which bring together a selection of materials from the database by theme, are entry points to the collection. In addition to providing contextual information for interpreting the material presented in an interactive timeline, a selective bibliography completes the exhibit.";
    const exhibit1 = {
        title: "Hajj in Burkina Faso",
        url: "https://islam.zmo.de/s/afrique_ouest/page/hadj-bf"
    };
    const exhibit2 = {
        title: "Student activism in Burkina Faso",
        url: "https://islam.zmo.de/s/afrique_ouest/page/militantisme-islamique-etudiant"
    };

</script>

<SEO 
    title="{projectTitle} | Frédérick Madore" 
    description="Digital exhibits on 'Hadjj in Burkina Faso' and 'Student activism in Burkina Faso', showcasing materials from the Islam West Africa Collection using Timeline JS."
/>

<div class="container mx-auto px-4 py-8">
    <Breadcrumb items={breadcrumbItems} />
    
    <PageHeader title={projectTitle} />

    <div class="rounded-box shadow-md p-6 mb-8">
        <p class="mb-4">{projectDescription}</p>

        <h2 class="text-2xl font-semibold mb-4">Exhibits</h2>
        <p class="mb-4">This project encompasses the following two digital exhibits, which utilize Timeline JS to present information interactively:</p>
        <ul class="list-disc list-inside mb-4 space-y-2">
            <li>
                <a href={exhibit1.url} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                    {exhibit1.title}
                </a>
            </li>
            <li>
                <a href={exhibit2.url} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                    {exhibit2.title}
                </a>
            </li>
        </ul>
        
        <p><strong>Key Technology:</strong> Timeline JS</p>
    </div>

    <section class="visualization-section">
        <h2 class="text-2xl font-semibold mb-4">View Exhibits</h2>

        <h3 class="text-xl font-semibold mb-3 mt-6">{exhibit1.title}</h3>
        <div class="iframe-container" style="height: 650px;">
            <iframe
                src="https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1StFgUqQxqOMlo6GqiKGQWP2GC92W1YG51vHvoNijDdQ&font=Default&lang=en&initial_zoom=2&height=650"
                title="{exhibit1.title}"
                frameborder="0"
                allowfullscreen
            ></iframe>
        </div>

        <h3 class="text-xl font-semibold mb-3 mt-6">{exhibit2.title}</h3>
        <div class="iframe-container" style="height: 650px;">
            <iframe
                src="https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1AmCWiL1QbMztXxJ48TXNUgaoodYc8aBFG-7dFsiz3jc&font=Default&lang=en&initial_zoom=2&height=650"
                title="{exhibit2.title}"
                frameborder="0"
                allowfullscreen
            ></iframe>
        </div>
    </section>

</div>

<style>
    /* Styles for new structural elements, mirroring iwac-overview */
    .rounded-box {
        background-color: var(--color-background-alt);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
        /* p-6 and mb-8 are applied via classes */
    }

    .visualization-section {
        margin-top: var(--spacing-4);
        padding: var(--spacing-4) var(--spacing-6);
        background-color: var(--color-background); 
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
    }

    /* Retained utility styles from before, if still needed or for general use */
    .mb-4 {
        margin-bottom: var(--spacing-4);
    }

    .mb-6 { /* This might be unused now if all major sections use mb-4 or mb-8 via classes */
        margin-bottom: var(--spacing-6);
    }
    
    .text-2xl {
        font-size: 1.5rem; /* var(--font-size-xl or xxl depending on your scale) */
    }

    .font-semibold {
        font-weight: 600; /* var(--font-weight-semibold) */
    }

    .list-disc {
        list-style-type: disc;
    }

    .list-inside {
        list-style-position: inside;
    }
    
    .space-y-2 > :not([hidden]) ~ :not([hidden]) {
        --tw-space-y-reverse: 0;
        margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse))); /* Corresponds to var(--spacing-2) */
        margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
    }

    .text-primary {
        color: var(--color-primary);
    }
    .text-primary:hover {
        color: var(--color-primary-dark);
    }
    .hover\:underline:hover {
        text-decoration-line: underline;
    }

    /* mt-8 class utility, if needed elsewhere, or can be removed if specific to old structure */
    .mt-8 {
        margin-top: var(--spacing-8); /* 2rem if spacing unit is 0.25rem */
    }
     .mt-6 {
        margin-top: var(--spacing-6);
    }
    .mb-3 {
        margin-bottom: var(--spacing-3);
    }
    .text-xl {
        font-size: 1.25rem; /* var(--font-size-lg) */
    }

</style> 