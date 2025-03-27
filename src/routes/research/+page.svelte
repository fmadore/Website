<script>
    // Research projects data
    const researchProjects = [
        {
            id: "mining-the-islam-west-africa-collection",
            title: "Mining the Islam West Africa Collection (2025-)",
            years: "2025",
            shortDescription: "Using AI and machine learning to analyze the Islam West Africa Collection digital database.",
            imageUrl: "/images/research/IWAC.webp"
        },
        {
            id: "religious-activism-campuses-togo-benin",
            title: "Religious Activism on Campuses in Togo and Benin (2021-24)",
            years: "2021-2024",
            shortDescription: "Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
            imageUrl: "/images/research/campus-activism.webp"
        },
        {
            id: "muslim-minorities-southern-cities-benin-togo",
            title: "Muslim Minorities in Southern Cities of Benin and Togo (2018-20)",
            years: "2018-2020",
            shortDescription: "Investigating the experiences and integration of Muslim minority communities in southern urban areas of Benin and Togo.",
            imageUrl: "/images/research/muslim-minorities.webp"
        },
        {
            id: "youth-womens-islamic-activism-cote-divoire-burkina-faso",
            title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso​ (2013-18)",
            years: "2013-2018",
            shortDescription: "Analyzing the evolving roles of youth and women in Islamic movements and organizations in Côte d'Ivoire and Burkina Faso.",
            imageUrl: "/images/research/youth-women-activism.webp"
        }
    ];
</script>

<div class="prose">
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