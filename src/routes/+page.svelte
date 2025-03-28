<script>
    import LatestActivities from '$lib/LatestActivities.svelte';
    import SEO from '$lib/SEO.svelte';
    import { activitiesByYear } from '$lib/data/activities';
    import { base } from '$app/paths';

    // Years with content - dynamically created from activities data
    const years = Object.entries(activitiesByYear).map(([year, activities]) => ({
        year: parseInt(year),
        count: activities.length
    })).sort((a, b) => b.year - a.year);
</script>

<SEO />

<div class="profile-container">
    <div class="profile-header">
        <div class="profile-photo">
            <img src="{base}/images/Profile-picture.jpg" alt="Frédérick Madore" class="rounded-full">
        </div>
        <div class="profile-title">
            <h1>About</h1>
            <div class="subtitle">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</div>
        </div>
    </div>

    <div class="profile-content">
        <div class="main-content">
            <p>I am a Research Fellow at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in the "<a href="https://www.zmo.de/en/research/religion-and-intellectual-culture" target="_blank" rel="noopener noreferrer">Religion and Intellectual Culture</a>" unit. My <a href="{base}/research">research</a> focuses on the history of Islam and Muslim societies in francophone West Africa since the 1960s. I have conducted extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso, examining Islamic activism, secularism, and Muslim politics.</p>
            
            <p>My recent book, <a href="https://doi.org/10.1515/9783111428895" target="_blank" rel="noopener noreferrer"><em>Religious Activism on Campuses in Togo and Benin</em></a>, explores how Christian and Muslim student associations emerged in the 1970s and profoundly reshaped university life in Lomé and Abomey-Calavi, challenging prevailing secular ideologies.</p>
            
            <p>A significant part of my work involves <a href="{base}/digital-humanities">digital humanities</a> (DH). I lead the development of the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, an open-access database featuring over 13,500 items on Islam across the region. Using artificial intelligence and machine learning, I analyse this vast corpus to uncover large-scale trends and patterns in Muslim public life. I use data visualisation techniques to translate these findings into compelling narratives, making the insights accessible and engaging. This holistic approach complements traditional historical analysis and brings new perspectives through computational techniques.</p>
            
            <p>I am also the author of <a href="https://doi.org/10.58144/20241205-000" target="_blank" rel="noopener noreferrer"><em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em></a> (Presses de l'Université Laval/Hermann, 2016) and co-editor of <a href="https://doi.org/10.58144/20241107-000" target="_blank" rel="noopener noreferrer"><em>Religiosity on University Campuses in Africa</em></a> (Lit Verlag, 2023). I have also co-edited two special journal issues: "<a href="https://brill.com/view/journals/iafr/12/2/iafr.12.issue-2.xml" target="_blank" rel="noopener noreferrer">Muslim Minorities in Africa, Part 1</a> & <a href="https://brill.com/view/journals/iafr/13/1/iafr.13.issue-1.xml" target="_blank" rel="noopener noreferrer">Part 2</a>" (<em>Islamic Africa</em>, 2021-22) and "<a href="https://doi.org/10.14428/emulations.024" target="_blank" rel="noopener noreferrer">Les acteurs religieux africains à l'ère du numérique</a>" (<em>Émulations</em>, 2017). My <a href="{base}/publications">research</a> has been published in eleven peer-reviewed journals and six edited volumes.</p>
                        
            <p>Beyond academia, I apply my regional knowledge as a consultant for <a href="https://communitology.co/" target="_blank" rel="noopener noreferrer">Communitology</a>, developing specialized Country of Origin Information (COI) reports for asylum and immigration cases involving Benin, Togo, and Côte d'Ivoire.</p>
            
            <p>I hold a Ph.D. with distinction in History from <a href="https://www.ulaval.ca/" target="_blank" rel="noopener noreferrer">Université Laval</a> and was previously a <a href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html" target="_blank" rel="noopener noreferrer">Banting Postdoctoral Fellow</a> at the <a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer">University of Florida</a>. Through my ongoing <a href="{base}/research">research</a> and <a href="{base}/digital-humanities">DH projects</a>, I continue to explore new approaches to understanding the dynamics of Muslim societies in Francophone West Africa, combining traditional historical methods with innovative computational techniques.</p>
        
            <div class="action-buttons">
                <a href="{base}/files/CV-F.Madore-2025-03-21.pdf" class="btn btn-primary">Download CV</a>
            </div>
        </div>
        
        <div class="sidebar">
            <LatestActivities limit={3} />
        </div>
    </div>
</div>

<style>
    .profile-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }
    
    .profile-header {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-8);
        padding-bottom: var(--spacing-6);
        border-bottom: 1px solid var(--color-border);
    }
    
    .profile-photo {
        margin-right: var(--spacing-6);
        width: 150px;
        height: 150px;
        flex-shrink: 0;
    }
    
    .profile-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        box-shadow: var(--shadow-md);
    }
    
    .profile-title h1 {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        margin: 0;
        color: var(--color-primary);
    }
    
    .subtitle {
        font-size: var(--font-size-lg);
        color: var(--color-text-secondary);
        margin-top: var(--spacing-2);
    }
    
    .profile-content {
        display: flex;
        flex-direction: column;
    }
    
    .main-content {
        flex: 1;
    }
    
    .main-content p {
        margin-bottom: var(--spacing-4);
        line-height: 1.7;
    }
    
    .sidebar {
        margin-top: var(--spacing-8);
    }
    
    .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-4);
        margin-top: var(--spacing-8);
        margin-bottom: var(--spacing-8);
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

    
    .rounded-full {
        border-radius: 9999px;
    }
    
    /* Media queries for responsive layout */
    @media (min-width: 768px) {
        .profile-content {
            flex-direction: row;
            gap: var(--spacing-8);
        }
        
        .main-content {
            flex: 3;
        }
        
        .sidebar {
            flex: 1;
            margin-top: 0;
        }
    }
    
    @media (max-width: 640px) {
        .profile-header {
            flex-direction: column;
            text-align: center;
        }
        
        .profile-photo {
            margin-right: 0;
            margin-bottom: var(--spacing-4);
        }
        
        .action-buttons {
            justify-content: center;
        }
    }
</style>
