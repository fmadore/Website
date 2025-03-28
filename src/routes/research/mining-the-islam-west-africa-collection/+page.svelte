<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
    import { base } from '$app/paths';
</script>

<SEO title="Mining the Islam West Africa Collection" />

<div class="content-wrapper">
    <div class="main-content">
        <div class="project-header">
            <h1 class="project-title">Mining the Islam West Africa Collection: Mapping Print Culture and Intellectual Networks in Francophone Regions</h1>
            <p class="project-years">2025-</p>
            <p class="project-meta">Project conducted at Leibniz-Zentrum Moderner Orient (ZMO) in the "Religion and Intellectual Culture" research unit</p>
        </div>
        
        <div class="project-image">
            <img src="{base}/images/research/IWAC.webp" alt="Mining the Islam West Africa Collection" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>Building on my previous work with the <em>Islam West Africa Collection</em> (IWAC), this research project uses computational tools and digital humanities (DH) methods to analyse Islamic print culture and networks in Benin, Burkina Faso, Côte d'Ivoire and Togo. Using "distant reading" techniques – the computational analysis of large collections of texts – I uncover patterns in Islamic intellectual discourse and translocal dynamics.</p>
            
            <p>Drawing on 1,500 Islamic publications from the IWAC (1980-2020), this study traces how Muslim elites shaped public discourse in Francophone West Africa. Using natural language processing (NLP) techniques – including topic modelling, word embeddings, and sentiment analysis – I analyse how religious terms (<em>ummah</em>, Salafism, <em>jihad</em>) and sociopolitical concepts (democracy, <em>laïcité</em>) evolve within Islamic discourse, identifying dominant themes, semantic relations, and emotional resonance. This computational analysis will examine how religiosity intersects with morality and intellectual culture in the region.</p>
            
            <p>Network analysis of the IWAC data will map Islamic networks in Francophone West Africa, focusing on understudied local NGOs and "Islamic Francophonie" networks. By analysing connections between individuals, organisations, and institutions, I examine how French has emerged as a vehicle for Islamic discourse among urban elites. This regional focus, which departs from the typical emphasis on global Arab-Islamic connections, reveals how local Islamic networks evolved in response to social and political change.</p>
            
            <p>By combining these computational approaches with ethnographic fieldwork, I aim to provide a comprehensive understanding that neither method could achieve alone. This innovative synthesis promises new insights into the intellectual history and translocal dynamics of Muslims in Francophone West Africa, and contributes significantly to our understanding of how religiosity interacts with morality, intellectual culture and socio-political issues in this context.</p>
        </div>
        
        <div class="mt-4 pt-4 border-t">
            <a href="{base}/research" class="text-primary hover:text-primary-dark">← Back to Research Projects</a>
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
        width: 100%;
    }
    
    .sidebar {
        width: 100%;
        margin-top: var(--spacing-8);
    }
    
    .project-header {
        margin-bottom: var(--spacing-6);
    }
    
    .project-title {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: var(--spacing-2);
    }
    
    .project-years {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: var(--spacing-2);
        border-left: 4px solid var(--color-primary);
        padding-left: var(--spacing-2);
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
    
    /* Media queries for responsive layout */
    @media (min-width: 768px) {
        .content-wrapper {
            flex-direction: row;
            gap: var(--spacing-8);
        }
        
        .main-content {
            width: 80%;
        }
        
        .sidebar {
            width: 20%;
            margin-top: 0;
        }
    }
</style> 