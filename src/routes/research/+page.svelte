<script>
    // Research projects data
    const researchProjects = [
        {
            id: "mining-the-islam-west-africa-collection",
            title: "Mining the Islam West Africa Collection",
            years: "2025-",
            shortDescription: "Using AI and machine learning to analyze the Islam West Africa Collection (IWAC) digital database.",
            imageUrl: "/images/research/IWAC.webp"
        },
        {
            id: "religious-activism-campuses-togo-benin",
            title: "Religious Activism on Campuses in Togo and Benin",
            years: "2021-2024",
            shortDescription: "Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
            imageUrl: "/images/research/campus-activism.webp"
        },
        {
            id: "muslim-minorities-southern-cities-benin-togo",
            title: "Muslim Minorities in Southern Cities of Benin and Togo",
            years: "2018-2020",
            shortDescription: "Investigating the experiences and integration of Muslim minority communities in southern urban areas of Benin and Togo.",
            imageUrl: "/images/research/muslim-minorities.webp"
        },
        {
            id: "youth-womens-islamic-activism-cote-divoire-burkina-faso",
            title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso",
            years: "2013-2018",
            shortDescription: "Analyzing the evolving roles of youth and women in Islamic movements and organizations in Côte d'Ivoire and Burkina Faso.",
            imageUrl: "/images/research/youth-women-activism.webp"
        }
    ];
</script>

<div class="container">
    <h1 class="project-section-title">Research</h1>
    
    <p class="text-xl mb-10">My research focuses on the history of Islam and Muslim societies in francophone West Africa from the 1960s to the present. I have conducted extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso, examining various aspects of Islamic activism, media use, and Muslim politics.</p>
    
    <div class="research-grid">
        {#each researchProjects as project}
            <div class="project-card">
                <div class="project-card-image">
                    <img src={project.imageUrl} alt={project.title} class="w-full h-auto" />
                </div>
                <div class="project-card-body">
                    <h2 class="project-card-title">
                        <a href={`/research/${project.id}`} class="text-dark hover:text-primary">
                            {project.title}
                        </a>
                    </h2>
                    <p class="project-card-years">{project.years}</p>
                    <p class="project-card-description">{project.shortDescription}</p>
                    <a href={`/research/${project.id}`} class="project-card-link">
                        Read more →
                    </a>
                </div>
            </div>
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
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: var(--color-primary, #333);
    }
    
    .research-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 2rem;
        margin-top: 2rem;
    }
    
    .project-card {
        display: flex;
        flex-direction: column;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .project-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }
    
    .project-card-image {
        overflow: hidden;
        max-height: 250px;
    }
    
    .project-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .project-card:hover .project-card-image img {
        transform: scale(1.05);
    }
    
    .project-card-body {
        padding: 1.5rem;
        background-color: white;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    
    .project-card-title {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        line-height: 1.3;
    }
    
    .project-card-years {
        font-size: 0.9rem;
        color: var(--color-text-secondary, #666);
        margin-bottom: 1rem;
    }
    
    .project-card-description {
        margin-bottom: 1.5rem;
        flex-grow: 1;
    }
    
    .project-card-link {
        display: inline-block;
        color: var(--color-primary, #0066cc);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
    }
    
    .project-card-link:hover {
        color: var(--color-primary-dark, #004c99);
        text-decoration: underline;
    }
    
    @media (min-width: 640px) {
        .research-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (min-width: 1024px) {
        .research-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style> 