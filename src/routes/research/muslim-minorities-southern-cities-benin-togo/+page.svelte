<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
    import { base } from '$app/paths';
</script>

<SEO title="Muslim Minorities in Southern Cities of Benin and Togo" />

<div class="content-wrapper">
    <div class="main-content">
        <div class="project-header">
            <h1 class="project-title">Muslim Minorities in Southern Cities of Benin and Togo</h1>
            <p class="project-years">2018-2020</p>
            <p class="project-meta">Project funded by a Banting Postdoctoral Fellowship</p>
        </div>
        
        <div class="project-image">
            <img src="{base}/images/research/muslim-minorities.webp" alt="Muslim Minorities in Southern Cities of Benin and Togo" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>This research project examined the understudied Muslim minority communities of southern Benin and Togo since the late colonial era (1950s). While recent reports on the deteriorating security situation in Burkina Faso have raised fears of jihadism spreading to neighbouring states bordering the Gulf of Guinea, including Benin and Togo, Islam in this region remains largely unknown. The project aimed to move beyond a reductive focus on "radicalisation" by interrogating how Muslims' political position as a minority in Christian-majority settings affects their experiences, self-understandings, and political stakes. It also explored the plurality of ways in which Muslim youth and women make their religious identity meaningful in their everyday lives, beyond established analytical categories (Sufi, reformist, Salafi).</p>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Relevant publications</h2>
            <ul class="publications-list">
                <li>2021-2022. <strong>Madore F.</strong> and D. Schulz (eds.), "Muslim Minorities in Africa, Part 1 & Part 2." <em>Islamic Africa</em> 12 (2) / 13 (1). <a href="https://brill.com/view/journals/iafr/12/2/iafr.12.issue-2.xml" target="_blank" rel="noopener noreferrer">https://brill.com/view/journals/iafr/12/2/iafr.12.issue-2.xml</a> / <a href="https://brill.com/view/journals/iafr/13/1/iafr.13.issue-1.xml" target="_blank" rel="noopener noreferrer">https://brill.com/view/journals/iafr/13/1/iafr.13.issue-1.xml</a>.</li>
                <li>2022. "A Beninese Imam's Controversial 2019 Election Campaign: Muslim Leadership and Political Engagement in a Minority Context". <em>Islamic Africa</em> 13 (1): 1–26. <a href="https://doi.org/10.1163/21540993-01202004" target="_blank" rel="noopener noreferrer">https://doi.org/10.1163/21540993-01202004</a>.</li>
                <li>2021. "'Good Muslim, bad Muslim' in Togo: religious minority identity construction amid a sociopolitical crisis (2017–2018)." <em>The Journal of Modern African Studies</em> 59 (2): 197–217.</li>
                <li>2022. "Lutte contre le terrorisme et sécuritisation du salafisme au Bénin et au Togo: instrumentalisations diverses d'une 'menace étrangère'", <em>Bulletin FrancoPaix</em> 7 (8): 2–7. <a href="https://dandurand.uqam.ca/publication/lutte-contre-le-terrorisme-et-securitisation-du-salafisme-au-benin-et-au-togo-instrumentalisations-diverses-dune-menace-etrangere/" target="_blank" rel="noopener noreferrer">https://dandurand.uqam.ca/publication/lutte-contre-le-terrorisme-et-securitisation-du-salafisme-au-benin-et-au-togo-instrumentalisations-diverses-dune-menace-etrangere/</a>.</li>
            </ul>
        </div>
        
        <div class="mt-4 pt-4 border-t">
            <a href="{base}/research" class="project-card-link">← Back to Research Projects</a>
        </div>
    </div>
    
    <div class="sidebar">
        <RelevantPublications projectName="Muslim Minorities in Southern Cities of Benin and Togo" limit={5} />
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