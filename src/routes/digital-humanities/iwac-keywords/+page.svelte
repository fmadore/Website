<script lang="ts">
    import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
    import Button from '$lib/components/atoms/Button.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';</script>

<SEO 
    title="IWAC Keywords Dashboard | Frédérick Madore" 
    description="Interactive analysis of keyword evolution in West African newspapers from the Islam West Africa Collection."
/>

<div class="container mx-auto px-4 py-8">
    <Breadcrumb items={[
        { label: "Digital Humanities", href: "/digital-humanities" },
        { label: "IWAC Keywords Dashboard", href: "/digital-humanities/iwac-keywords" }
    ]} />
    
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
        <div class="visualization-embed">
            <iframe 
                src="https://fmadore.shinyapps.io/iwac_keywords/" 
                width="100%" 
                frameborder="0" 
                title="IWAC Keywords Dashboard"
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

    /* Styles for embedded content */
    .visualization-embed {
        margin-top: var(--spacing-4);
        margin-bottom: var(--spacing-6);
        position: relative; 
        overflow: hidden; 
    }
    
    .button-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: var(--spacing-2);
    }
    
    .visualization-embed iframe {
        display: block; 
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
        max-width: 100%;
        width: 100%; 
        height: 90vh; 
        min-height: 600px;
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