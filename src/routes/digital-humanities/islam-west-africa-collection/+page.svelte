<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
</script>

<SEO title="Islam West Africa Collection" description="Explore the Islam West Africa Collection (IWAC), an open-access digital database of over 12,500 documents on Islam in West Africa." />

<div class="container">
    <h1><em>Islam West Africa Collection</em></h1>

    <div class="project-header">
        <div class="project-image">
            <img src="{base}/images/iwac-screenshot.jpg" alt="Screenshot of the Islam West Africa Collection website" class="rounded">
        </div>
        <div class="project-overview">
            <p class="lead">An open-access digital database containing over 12,500 documents on Islam in West Africa.</p>
            <div class="project-links">
                <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit IWAC</a>
                <a href="{base}/digital-humanities/visualising-the-iwac" class="btn btn-secondary">View Visualizations</a>
            </div>
        </div>
    </div>

    <section class="project-section">
        <h2>Overview</h2>
        <p>With the support of Leibniz-Zentrum Moderner Orient (ZMO) and funding from the Berlin Senate Department for Science, Health and Care, I'm currently working on the <em>Islam West Africa Collection</em> (IWAC), which currently contains over 12,500 archival documents, newspaper articles, Islamic publications of various kinds, audio and video recordings, and photographs on Islam and Muslims in Burkina Faso, Benin, Niger, Nigeria, Togo and Côte d'Ivoire.</p>
        
        <p>Most documents are in French, but some are also in Hausa, Arabic, Dendi, Fon and English. The site also indexes over 850 references to relevant books, book chapters, book reviews, journal articles, dissertations, theses, reports and blog posts.</p>
    </section>

    <section class="project-section">
        <h2>Collection Highlights</h2>
        <ul>
            <li>Over 12,500 primary source documents</li>
            <li>850+ bibliographical references</li>
            <li>Coverage of six West African countries</li>
            <li>Materials in multiple languages (French, Hausa, Arabic, Dendi, Fon, English)</li>
            <li>Full-text search capability</li>
            <li>Detailed metadata and tagging</li>
        </ul>
    </section>

    <section class="project-section">
        <h2>Research Applications</h2>
        <p>The IWAC serves as a valuable resource for researchers studying:</p>
        <ul>
            <li>Islamic movements and organizations in West Africa</li>
            <li>Religious education and scholarship</li>
            <li>Muslim media and public discourse</li>
            <li>Islamic activism among youth and women</li>
            <li>Relations between Muslim communities and state authorities</li>
            <li>Transnational religious networks in the region</li>
        </ul>
    </section>

    <section class="project-section">
        <h2>Digital Humanities Approach</h2>
        <p>Beyond providing access to primary sources, the IWAC project employs digital humanities methodologies to analyze this vast corpus. Using artificial intelligence and machine learning techniques, we can uncover patterns and trends in Francophone West African Muslim societies that traditional research methods might miss.</p>
        
        <p>Visit our <a href="/digital-humanities/visualising-the-iwac">Visualising the IWAC</a> page to explore interactive visualizations and computational analyses of the collection.</p>
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

    .lead {
        font-size: var(--font-size-lg);
        font-weight: 500;
    }

    .project-header {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-6);
        margin-bottom: var(--spacing-8);
    }

    .project-image {
        flex: 1;
    }

    .project-image img {
        width: 100%;
        height: auto;
        box-shadow: var(--shadow-md);
    }

    .project-overview {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .project-links {
        display: flex;
        gap: var(--spacing-4);
        margin-top: var(--spacing-4);
    }

    .project-section {
        margin-bottom: var(--spacing-8);
    }

    ul {
        margin-bottom: var(--spacing-4);
        padding-left: var(--spacing-6);
    }

    li {
        margin-bottom: var(--spacing-2);
        line-height: 1.7;
    }

    .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        text-decoration: none;
        border-radius: var(--border-radius-md);
        transition: all 0.2s ease;
    }
    
    .btn-primary {
        background-color: var(--color-primary);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--color-primary-dark);
    }
    
    .btn-secondary {
        background-color: var(--color-gray-200);
        color: var(--color-text);
    }
    
    .btn-secondary:hover {
        background-color: var(--color-gray-300);
    }

    .rounded {
        border-radius: var(--border-radius-md);
    }

    a {
        color: var(--color-primary);
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    /* Media queries */
    @media (min-width: 768px) {
        .project-header {
            flex-direction: row;
        }
    }
</style> 