<script>
    import SEO from '$lib/SEO.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    // Removed UnitNetworkGraph import as path is unknown
    // You might not need PublicationReference here unless you cite publications
    // import PublicationReference from '$lib/components/common/PublicationReference.svelte';
    // You might not need ItemReference here unless you cite publications
    // import ItemReference from '$lib/components/common/ItemReference.svelte';

</script>

<SEO
    title="ZMO Research Units Word Cloud | Frédérick Madore"
    description="Word cloud generated from the ZMO research projects' titles and abstracts. Explore the visualization."
/>

<div class="container">
    <PageHeader title="ZMO Research Units Word Cloud" />

    <section class="visualization-section">
        <h2>Research Units Word Cloud</h2>
        <p>
            This word cloud was generated from the research projects' titles and abstracts (2025-2029 programme) 
            at the Leibniz-Zentrum Moderner Orient (ZMO).
            You can learn more about the <a href="https://www.zmo.de/en/research/overview-of-main-research-programme-2025" target="_blank" rel="noopener noreferrer">ZMO Research Programme here</a>.
        </p>
        <div class="visualization-embed">
            <iframe src="https://fmadore.github.io/ZMO/units_wordcloud/en/index.html" width="100%" height="600" frameborder="0" title="ZMO Research Units Word Cloud"></iframe>
        </div>
    </section>

    <!-- Add more sections if needed -->

</div>

<style>
    /* Copy styles from remoboko/+page.svelte or create new ones */
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-4);
    }

    .visualization-section {
        margin-top: var(--spacing-8);
        padding: var(--spacing-8) var(--spacing-6);
        background-color: var(--color-background-alt, #f9fafb);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
    }

    .visualization-section h2 {
        margin-bottom: var(--spacing-4);
        color: var(--color-heading);
    }
     .visualization-section p {
        margin-bottom: var(--spacing-3);
        line-height: 1.6;
    }
     .visualization-section p a {
        color: var(--color-primary-dark); /* Or your link color */
        text-decoration: underline;
    }
     .visualization-section p a:hover {
        color: var(--color-primary); /* Or your hover color */
    }


    .visualization-embed {
        margin-top: var(--spacing-4);
        margin-bottom: var(--spacing-6);
        position: relative;
        overflow: hidden;
    }
    .visualization-embed iframe {
        display: block;
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
        max-width: 100%;
    }
    /* If you add images later */
</style> 