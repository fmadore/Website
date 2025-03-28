<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
    import { base } from '$app/paths';
</script>

<SEO title="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" />

<div class="content-wrapper">
    <div class="main-content prose">
        <div class="project-header">
            <h1 class="project-title">Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso​</h1>
            <p class="project-years">2013-2018</p>
            <p class="project-meta">Project funded by the Fonds Québécois de la Recherche sur la Société et la Culture and the Joseph-Armand Bombardier Canada Graduate Scholarships Program</p>
        </div>
        
        <div class="project-image">
            <img src="{base}/images/research/youth-women-activism.webp" alt="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>This research project was a comparative historical study of the role of marginalised Muslims in the transformation of Islam in Burkina Faso and Côte d'Ivoire over the past sixty years. The parallel religious demographics of these two countries – with Islam as the dominant religion (60% in Burkina Faso; 43% in Côte d'Ivoire), but Muslims historically in a subordinate political position – made this comparison particularly compelling. The research drew on a wide range of sources, including twelve months of ethnographic fieldwork in Abidjan and Ouagadougou (2011; 2014-15), as well as extensive archival material, national newspaper articles, and documents produced by Islamic organisations.</p>
            
            <p>The central argument was that intergenerational and gender relations are crucial to the dynamics that have (re)structured the Islamic field in recent decades, and that these relations are inextricably linked to issues of power and religious authority. The study assessed the individual and collective capacity of youth and women to both challenge and conform to social constraints through Islamic activism. It found that the generational and gender differences that strongly favoured male leaders in both countries in the 1970s and 1980s had diminished over time, although tensions remained. This was particularly evident in Burkina Faso, where strong gerontocratic principles still prevailed within Islamic organisations and deference to the older generation often remained an important social norm.</p>
            
            <p>Recent developments in both countries also reflected the diversification of types and sources of religious authority observed elsewhere in the contemporary Muslim world. An increasing number of individuals and groups from different segments of society, including youth and women, had begun to claim the right to speak on behalf of Islam. In particular, French-speaking "Muslim intellectuals" had spearheaded the emergence of a "civil Islam", developing new forms of civic engagement and entrepreneurship for socio-economic development.</p>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Selected publications</h2>
            <ul class="publications-list">
                <li>2020. "Muslim Feminist, Media Sensation, and Religious Entrepreneur: Aminata Kane Koné as a Figure of Success in Côte d'Ivoire." <em>Africa Today</em> 67 (2-3): 17–38. <a href="https://doi.org/10.2979/africatoday.67.2-3.02" target="_blank" rel="noopener noreferrer">https://doi.org/10.2979/africatoday.67.2-3.02</a>.</li>
                <li>2020. ​"Francophone Muslim intellectuals, Islamic associational life and religious authority in Burkina Faso." <em>Africa</em> 90 (3): 625-46.</li>
                <li>2019. <strong>Madore F.</strong> and L. Audet Gosselin. "Le religieux sur Internet et dans les NTIC au Burkina Faso." In <em>Rencontres religieuses et dynamiques sociales au Burkina Faso</em>, edited by A. Degorce, L.O. Kibora and K. Langewiesche, 269–96. Dakar: Amalion.</li>
                <li>2018. <strong>Madore F.</strong> and Y. Traoré. "L'organisation du <em>hadj</em> en Côte d'Ivoire: entre facteur de cohésion et source de rivalités au sein de la communauté musulmane (1993-2010)." <em>Cahiers d'études africaines</em> 229: 179–208.</li>
                <li>2016. <em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em>. Québec/Paris: Presses de l'Université Laval/Hermann.</li>
                <li>2016. "The New Vitality of Salafism in Côte d'Ivoire: Toward a Radicalization of Ivoirian Islam?" <em>Journal of Religion in Africa</em> 46 (4): 417–52. <a href="https://doi.org/10.1163/15700666-12340090" target="_blank" rel="noopener noreferrer">https://doi.org/10.1163/15700666-12340090</a>.</li>
                <li>2016. "L'islam ivoirien et burkinabé à l'ère du numérique 2.0." <em>Journal des anthropologues</em> 146–147: 151–78.</li>
                <li>2016. "Islam, médias, mise en place du Sénat et article 37 de la Constitution: changement de paradigme au Burkina Faso (1991-2014)?" <em>Canadian Journal of African Studies / Revue canadienne des études africaines</em> 50 (1): 7–27.</li>
                <li>2016. <strong>Madore F.</strong> and M. Gomez-Perez. "Muslim Women in Burkina Faso since the 1970s: Toward Recognition as Figures of Religious Authority?" <em>Islamic Africa</em> 7 (2): 185–209. <a href="https://doi.org/10.1163/21540993-00702001" target="_blank" rel="noopener noreferrer">https://doi.org/10.1163/21540993-00702001</a>.</li>
            </ul>
        </div>
        
        <div class="mt-4 pt-4 border-t">
            <a href="{base}/research" class="project-card-link">← Back to Research Projects</a>
        </div>
    </div>
    
    <div class="sidebar">
        <RelevantPublications projectName="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" limit={5} />
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
    
    .project-content {
        margin-bottom: var(--spacing-10);
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
    
    .publications-list {
        list-style-type: none;
        padding-left: 0;
    }
    
    .publications-list li {
        margin-bottom: var(--spacing-4);
        padding-left: var(--spacing-6);
        position: relative;
    }
    
    .publications-list li::before {
        content: "•";
        position: absolute;
        left: 0;
        color: var(--color-primary);
    }
    
    .project-card-link {
        display: inline-block;
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .project-card-link:hover {
        color: var(--color-primary-dark);
        text-decoration: underline;
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
    
    @media (max-width: 640px) {
        .publications-list li {
            padding-left: var(--spacing-4);
        }
    }
</style> 