<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import TagList from '$lib/components/molecules/TagList.svelte';
    import DetailsGrid from '$lib/components/molecules/DetailsGrid.svelte';
    import IframeRenderer from '$lib/components/molecules/IframeRenderer.svelte'; // We'll create this component later

    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    import type { DigitalHumanitiesProject, IframeEmbed, Review, ProjectPublication } from '$lib/types/digitalHumanities';

    export let data;
    $: project = data.project as DigitalHumanitiesProject;

    // Breadcrumbs
    $: breadcrumbItems = [
        { label: "Digital Humanities", href: `${base}/digital-humanities` },
        { label: project.title, href: `${base}/digital-humanities/${project.id}` }
    ];

    // JSON-LD for Breadcrumbs
    let breadcrumbJsonLdString: string | null = null;
    $: if ($page.url && project) { 
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
    
    const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld-dh-project';

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

    // Prepare details for DetailsGrid
    $: projectDetails = [
        { label: 'Years', value: project.years },
        // Add other relevant details here, e.g., project lead, funding, etc. if available in data
    ];

</script>

<SEO 
    title={project.seoTitle || `${project.title} | Digital Humanities | Frédérick Madore`}
    description={project.seoDescription || project.shortDescription}
    keywords={project.seoKeywords?.join(', ') || [project.title, 'Digital Humanities', 'Frédérick Madore', ...(project.skills || [])].join(', ')}
    ogImage={project.heroImageUrl ? `${base}${project.heroImageUrl}` : `${base}${project.imageUrl}`}
/>

<div class="container mx-auto px-4 py-8">
    <Breadcrumb items={breadcrumbItems} />

    <PageHeader title={project.title} />

    <article class="project-detail-article bg-background p-4 md:p-6 rounded-lg shadow-md mb-8">
        
        <section class="prose prose-lg max-w-none mb-6">
            {@html project.description}
        </section>

        {#if projectDetails.filter(d => d.value).length > 0}
            <DetailsGrid details={projectDetails.filter(d => d.value)} />
        {/if}

        {#if project.skills && project.skills.length > 0}
            <section class="mb-6">
                <h2 class="text-xl font-semibold mb-3">Skills & Technologies</h2>
                <TagList tags={project.skills} />
            </section>
        {/if}

        {#if project.iframes && project.iframes.length > 0}
            <section class="mb-6">
                <h2 class="text-2xl font-semibold mb-4">Interactive Content</h2>
                {#each project.iframes as iframe (iframe.id)}
                    <div class="mb-8">
                        {#if iframe.showTitle && iframe.title}
                            <h3 class="text-xl font-semibold mb-2">{iframe.title}</h3>
                        {/if}
                        {#if iframe.description}
                            <p class="text-muted mb-3 prose">{@html iframe.description}</p>
                        {/if}
                        <IframeRenderer {...iframe} />
                    </div>
                {/each}
            </section>
        {/if}

        {#if project.award}
            <section class="mb-6 p-4 bg-background-alt rounded-md shadow-sm">
                <h3 class="text-lg font-semibold text-accent mb-1">Award</h3>
                <p>{project.award}</p>
            </section>
        {/if}

        {#if project.publication}
            <section class="mb-6">
                <h3 class="text-lg font-semibold mb-1">Related Publication</h3>
                <p><a href={project.publication.url} target="_blank" rel="noopener noreferrer" class="link">{project.publication.text}</a></p>
            </section>
        {/if}

        {#if project.reviews && project.reviews.length > 0}
            <section class="mb-6">
                <h3 class="text-lg font-semibold mb-2">Reviews</h3>
                <ul class="list-disc list-inside space-y-1">
                    {#each project.reviews as review}
                        <li><a href={review.url} target="_blank" rel="noopener noreferrer" class="link">{review.text}</a></li>
                    {/each}
                </ul>
            </section>
        {/if}

        <!-- Add other sections as needed: e.g., team, methodology, findings -->

    </article>

    <!-- Optional: Link to related projects or a back button -->
     <div class="mt-8 text-center">
        <a href="{base}/digital-humanities" class="btn btn-primary">Back to Digital Humanities Projects</a>
    </div>

</div>

<style>
    /* Add any specific styles for this page here, if needed. */
    /* 
    .project-detail-article {
        // background-color: var(--color-background-alt); 
    }
    .prose a {
        color: var(--color-primary);
    }
    .prose a:hover {
        text-decoration: underline;
    }
    */
</style> 