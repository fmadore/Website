<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
</script>

<SEO title="Mining the Islam West Africa Collection" />

<div class="content-wrapper">
    <div class="main-content prose">
        <h1 class="project-title">Mining the Islam West Africa Collection: Mapping Print Culture and Intellectual Networks in Francophone Regions</h1>
        <p class="project-meta">Project conducted at Leibniz-Zentrum Moderner Orient (ZMO) in the "Religion and Intellectual Culture" research unit (2025)</p>
        
        <div class="project-image">
            <img src="/images/research/IWAC.webp" alt="Mining the Islam West Africa Collection" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>Building on my previous work with the <em>Islam West Africa Collection</em> (IWAC), this research project uses computational tools and digital humanities (DH) methods to analyse Islamic print culture and networks in Benin, Burkina Faso, Côte d'Ivoire and Togo. Using "distant reading" techniques – the computational analysis of large collections of texts – I uncover patterns in Islamic intellectual discourse and translocal dynamics.</p>
            
            <p>Drawing on 1,500 Islamic publications from the IWAC (1980-2020), this study traces how Muslim elites shaped public discourse in Francophone West Africa. Using natural language processing (NLP) techniques – including topic modelling, word embeddings, and sentiment analysis – I analyse how religious terms (<em>ummah</em>, Salafism, <em>jihad</em>) and sociopolitical concepts (democracy, <em>laïcité</em>) evolve within Islamic discourse, identifying dominant themes, semantic relations, and emotional resonance. This computational analysis will examine how religiosity intersects with morality and intellectual culture in the region.</p>
            
            <p>Network analysis of the IWAC data will map Islamic networks in Francophone West Africa, focusing on understudied local NGOs and "Islamic Francophonie" networks. By analysing connections between individuals, organisations, and institutions, I examine how French has emerged as a vehicle for Islamic discourse among urban elites. This regional focus, which departs from the typical emphasis on global Arab-Islamic connections, reveals how local Islamic networks evolved in response to social and political change.</p>
            
            <p>By combining these computational approaches with ethnographic fieldwork, I aim to provide a comprehensive understanding that neither method could achieve alone. This innovative synthesis promises new insights into the intellectual history and translocal dynamics of Muslims in Francophone West Africa, and contributes significantly to our understanding of how religiosity interacts with morality, intellectual culture and socio-political issues in this context.</p>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Research Methods</h2>
            <div class="project-method-cards">
                <div class="method-card">
                    <h3 class="method-title">Computational Analysis</h3>
                    <ul class="method-list">
                        <li>Topic modeling to identify key themes in Islamic publications</li>
                        <li>Word embeddings to analyze semantic relationships</li>
                        <li>Sentiment analysis to examine emotional resonance</li>
                        <li>Temporal analysis to track changes in discourse over time</li>
                    </ul>
                </div>
                <div class="method-card">
                    <h3 class="method-title">Network Analysis</h3>
                    <ul class="method-list">
                        <li>Mapping connections between individuals and organizations</li>
                        <li>Visualizing "Islamic Francophonie" networks</li>
                        <li>Analyzing regional vs. global connections</li>
                        <li>Tracing evolution of networks over time</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Data Sources</h2>
            <p>This research draws primarily on the <em>Islam West Africa Collection</em> (IWAC), which includes:</p>
            <ul class="method-list">
                <li>1,500+ Islamic publications from Benin, Burkina Faso, Côte d'Ivoire and Togo (1980-2020)</li>
                <li>Organizational records and publications from Islamic NGOs</li>
                <li>Periodicals, books, and pamphlets produced by Muslim organizations</li>
                <li>Documentation of Islamic conferences and events</li>
            </ul>
            <p class="mt-4">This corpus is complemented by ethnographic fieldwork and interviews with key figures in Islamic networks across the region.</p>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Expected Outcomes</h2>
            <ul class="method-list">
                <li>A comprehensive map of Islamic intellectual networks in Francophone West Africa</li>
                <li>New insights into how religious terminology evolves in response to socio-political contexts</li>
                <li>Better understanding of the role of French language in shaping Islamic discourse</li>
                <li>Publications, visualizations, and open-access datasets for future research</li>
                <li>Methodological innovations in combining computational and ethnographic approaches</li>
            </ul>
        </div>
        
        <div class="mt-4 pt-4 border-t">
            <a href="/research" class="text-primary hover:text-primary-dark">← Back to Research Projects</a>
        </div>
    </div>
    
    <div class="sidebar">
        <RelevantPublications projectName="Mining the Islam West Africa Collection" limit={5} />
    </div>
</div>

<style>
    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
        display: flex;
        flex-direction: column;
    }
    
    .main-content {
        flex: 3;
    }
    
    .sidebar {
        flex: 1;
        margin-top: var(--spacing-8);
    }
    
    .project-title {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: var(--spacing-2);
    }
    
    .project-meta {
        font-size: var(--font-size-lg);
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-6);
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
    
    .project-section {
        margin-bottom: var(--spacing-10);
    }
    
    .project-section-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: var(--spacing-4);
    }
    
    .project-method-cards {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
    }
    
    .method-card {
        background-color: var(--color-bg-subtle);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-4);
    }
    
    .method-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: var(--spacing-3);
    }
    
    /* Media queries for responsive layout */
    @media (min-width: 768px) {
        .content-wrapper {
            flex-direction: row;
            gap: var(--spacing-8);
        }
        
        .sidebar {
            margin-top: 0;
        }
        
        .project-method-cards {
            grid-template-columns: 1fr 1fr;
        }
    }
</style> 