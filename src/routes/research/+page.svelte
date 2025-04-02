<script>
    import { base } from '$app/paths';
    import Card from '$lib/components/common/Card.svelte'; // Import the Card component
    
    // Research projects data
    const researchProjects = [
        {
            id: "mining-the-islam-west-africa-collection",
            title: "Mining the Islam West Africa Collection",
            years: "2025-",
            shortDescription: "Using AI and machine learning to analyze the Islam West Africa Collection (IWAC) digital database.",
            imageUrl: `${base}/images/research/IWAC.webp`
        },
        {
            id: "religious-activism-campuses-togo-benin",
            title: "Religious Activism on Campuses in Togo and Benin",
            years: "2021-2024",
            shortDescription: "Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
            imageUrl: `${base}/images/research/campus-activism.webp`
        },
        {
            id: "muslim-minorities-southern-cities-benin-togo",
            title: "Muslim Minorities in Southern Cities of Benin and Togo",
            years: "2018-2020",
            shortDescription: "Investigating the experiences and integration of Muslim minority communities in southern urban areas of Benin and Togo.",
            imageUrl: `${base}/images/research/muslim-minorities.webp`
        },
        {
            id: "youth-womens-islamic-activism-cote-divoire-burkina-faso",
            title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso",
            years: "2013-2018",
            shortDescription: "Analyzing the evolving roles of youth and women in Islamic movements and organizations in Côte d'Ivoire and Burkina Faso.",
            imageUrl: `${base}/images/research/youth-women-activism.webp`
        }
    ];
</script>

<div class="container">
    <h1 class="project-section-title">Research</h1>
    
    <p class="text-xl mb-10">My research focuses on the history of Islam and Muslim societies in francophone West Africa from the 1960s to the present. I have conducted extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso, examining various aspects of Islamic activism, media use, and Muslim politics.</p>
    
    <div class="research-grid">
        {#each researchProjects as project}
            <Card 
                title={project.title} 
                imageUrl={project.imageUrl} 
                linkUrl={`${base}/research/${project.id}`} 
                target="_self"
            >
                <span slot="subtitle">{project.years}</span>
                <!-- Default slot for description -->
                {project.shortDescription}
                <a slot="action" href={`${base}/research/${project.id}`}>Read more →</a>
            </Card>
        {/each}
    </div>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }
    
    .project-section-title {
        font-size: 2.5rem; /* Consider var(--font-size-3xl) or similar */
        font-weight: 700;
        margin-bottom: 1.5rem; /* Consider var(--spacing-6) */
        color: var(--color-primary, #333);
    }

    .text-xl {
         /* Already defined in typography.css - maybe remove if not needed */
         font-size: 1.25rem; /* Consider var(--font-size-xl) */
    }
    .mb-10 {
        /* Already defined in spacing.css - maybe remove if not needed */
        margin-bottom: 2.5rem; /* Consider var(--spacing-10) */
    }
    
    .research-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--spacing-8); /* Use variable */
        margin-top: 2rem; /* Consider var(--spacing-8) */
    }
        
    /* Remove old card styles - Handled by Card component */
    /* .project-card, .project-card:hover, .project-card-image, ... etc. */
    
    /* Responsive grid adjustments */
    @media (min-width: 640px) {
        .research-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    /* No need for 1024px breakpoint adjustment if 2 columns is sufficient */

</style> 