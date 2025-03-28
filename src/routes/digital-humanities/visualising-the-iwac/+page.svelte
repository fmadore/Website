<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
</script>

<SEO title="Visualising the IWAC" description="Explore visualizations of the Islam West Africa Collection using AI and machine learning techniques." />

<div class="container">
    <h1>Visualising the <em>Islam West Africa Collection</em></h1>

    <p>This page features various visualizations and computational analyses of the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a>. Using artificial intelligence and machine learning techniques, I explore patterns and trends in the vast corpus of documents related to Islam in West Africa.</p>

    <section class="visualization-section">
        <h2>Topic Modeling</h2>
        <p>Coming soon: Interactive visualizations of topic models generated from the IWAC corpus, showing the evolution of key themes and topics in Islamic discourse across West Africa from the 1960s to present.</p>
        
        <div class="placeholder">
            <div class="placeholder-text">Visualizations coming soon</div>
        </div>
    </section>

    <section class="visualization-section">
        <h2>Network Analysis</h2>
        <p>Coming soon: Network visualizations showing connections between Islamic organizations, scholars, and publications across francophone West Africa.</p>
        
        <div class="placeholder">
            <div class="placeholder-text">Visualizations coming soon</div>
        </div>
    </section>

    <section class="visualization-section">
        <h2>Text Analysis</h2>
        <p>Coming soon: Word frequency analysis, sentiment analysis, and other computational text analysis techniques applied to the IWAC corpus.</p>
        
        <div class="placeholder">
            <div class="placeholder-text">Visualizations coming soon</div>
        </div>
    </section>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }

    h1 {
        font-size: var(--font-size-3xl);
        color: var(--color-primary);
        margin-bottom: var(--spacing-8);
    }

    h2 {
        font-size: var(--font-size-2xl);
        margin-top: var(--spacing-8);
        margin-bottom: var(--spacing-4);
        color: var(--color-primary);
    }

    p {
        margin-bottom: var(--spacing-4);
        line-height: 1.7;
    }

    .visualization-section {
        margin-bottom: var(--spacing-12);
    }

    .placeholder {
        width: 100%;
        height: 300px;
        background-color: var(--color-gray-100);
        border: 2px dashed var(--color-gray-300);
        border-radius: var(--border-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: var(--spacing-6);
    }

    .placeholder-text {
        color: var(--color-gray-500);
        font-style: italic;
    }

    a {
        color: var(--color-primary);
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
</style> 