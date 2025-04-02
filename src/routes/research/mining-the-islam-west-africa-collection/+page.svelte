<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
    import RelevantCommunications from '$lib/RelevantCommunications.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
</script>

<SEO title="Mining the Islam West Africa Collection" />

<div class="content-wrapper">
    <div class="main-content">
		<PageHeader 
			title="Mining the Islam West Africa Collection: Mapping Print Culture and Intellectual Networks in Francophone Regions" 
			backLinkHref="research"
			backLinkLabel="Back to Research Projects"
		/>
        
        <div class="project-image">
            <img src="{base}/images/research/IWAC.webp" alt="Mining the Islam West Africa Collection" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>Building on my previous work with the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, this research project uses computational tools and digital humanities (DH) methods to analyse Islamic print culture and networks in Benin, Burkina Faso, Côte d'Ivoire and Togo. Using "distant reading" techniques – the computational analysis of large collections of texts – I uncover patterns in Islamic intellectual discourse and translocal dynamics.</p>
            
            <p>Drawing on 1,500 Islamic publications from the IWAC (1980-2020), this study traces how Muslim elites shaped public discourse in Francophone West Africa. Using natural language processing (NLP) techniques – including topic modelling, word embeddings, and sentiment analysis – I analyse how religious terms (<em>ummah</em>, Salafism, <em>jihad</em>) and sociopolitical concepts (democracy, <em>laïcité</em>) evolve within Islamic discourse, identifying dominant themes, semantic relations, and emotional resonance. This computational analysis will examine how religiosity intersects with morality and intellectual culture in the region.</p>
            
            <p>Network analysis of the IWAC data will map Islamic networks in Francophone West Africa, focusing on understudied local NGOs and "Islamic Francophonie" networks. By analysing connections between individuals, organisations, and institutions, I examine how French has emerged as a vehicle for Islamic discourse among urban elites. This regional focus, which departs from the typical emphasis on global Arab-Islamic connections, reveals how local Islamic networks evolved in response to social and political change.</p>
            
            <p>By combining these computational approaches with ethnographic fieldwork, I aim to provide a comprehensive understanding that neither method could achieve alone. This innovative synthesis promises new insights into the intellectual history and translocal dynamics of Muslims in Francophone West Africa, and contributes significantly to our understanding of how religiosity interacts with morality, intellectual culture and socio-political issues in this context.</p>
            
            <div class="visualization-container">
                <div class="iframe-wrapper">
                    <iframe src="https://fmadore.github.io/IWAC-overview/" title="IWAC Visualization" frameborder="0" scrolling="no" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    </div>
    
    <div class="sidebar">
        <RelevantPublications projectName="Mining the Islam West Africa Collection" limit={5} />
        <div class="mt-6">
            <RelevantCommunications projectName="Mining the Islam West Africa Collection" limit={5} />
        </div>
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
    
    /* Visualization styles */
    .visualization-container {
        margin-top: var(--spacing-8);
        margin-bottom: var(--spacing-8);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        background-color: var(--color-background-light);
        padding: var(--spacing-4);
        box-shadow: var(--shadow-md);
    }
    
    .iframe-wrapper {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 100%;
        overflow: hidden;
        border-radius: var(--border-radius-md);
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    }
    
    .iframe-wrapper::-webkit-scrollbar {
        display: none;
    }
    
    .iframe-wrapper iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 1px solid var(--color-border);
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    }
    
    /* Hide scrollbar for Chrome, Safari and Opera */
    .iframe-wrapper iframe::-webkit-scrollbar {
        display: none;
    }
    
    /* Add this CSS to handle scrollbars in the iframe content */
    .visualization-container iframe {
        overflow: hidden !important;
    }
</style> 