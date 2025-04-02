<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
    import RelevantCommunications from '$lib/RelevantCommunications.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
</script>

<SEO title="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" />

<div class="content-wrapper">
    <div class="main-content">
		<PageHeader 
			title="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" 
			backLinkHref="research"
			backLinkLabel="Back to Research Projects"
		/>

        <div class="project-image">
            <img src="{base}/images/research/youth-women-activism.webp" alt="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>This research project was a comparative historical study of the role of marginalised Muslims in the transformation of Islam in Burkina Faso and Côte d'Ivoire over the past sixty years. The parallel religious demographics of these two countries – with Islam as the dominant religion (60% in Burkina Faso; 43% in Côte d'Ivoire), but Muslims historically in a subordinate political position – made this comparison particularly compelling. The research drew on a wide range of sources, including twelve months of ethnographic fieldwork in Abidjan and Ouagadougou (2011; 2014-15), as well as extensive archival material, national newspaper articles, and documents produced by Islamic organisations.</p>
            
            <p>The central argument was that intergenerational and gender relations are crucial to the dynamics that have (re)structured the Islamic field in recent decades, and that these relations are inextricably linked to issues of power and religious authority. The study assessed the individual and collective capacity of youth and women to both challenge and conform to social constraints through Islamic activism. It found that the generational and gender differences that strongly favoured male leaders in both countries in the 1970s and 1980s had diminished over time, although tensions remained. This was particularly evident in Burkina Faso, where strong gerontocratic principles still prevailed within Islamic organisations and deference to the older generation often remained an important social norm.</p>
            
            <p>Recent developments in both countries also reflected the diversification of types and sources of religious authority observed elsewhere in the contemporary Muslim world. An increasing number of individuals and groups from different segments of society, including youth and women, had begun to claim the right to speak on behalf of Islam. In particular, French-speaking "Muslim intellectuals" had spearheaded the emergence of a "civil Islam", developing new forms of civic engagement and entrepreneurship for socio-economic development.</p>
        </div>
    </div>
    
    <div class="sidebar">
        <RelevantPublications projectName="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" limit={5} />
        <div class="mt-6">
            <RelevantCommunications projectName="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" limit={5} />
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
    
    .project-content {
        margin-bottom: var(--spacing-10);
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