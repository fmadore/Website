<script>
    // Research projects data
    const researchProjects = [
        {
            id: "mining-the-islam-west-africa-collection",
            title: "Mining the Islam West Africa Collection (2025)",
            years: "2025",
            shortDescription: "Using AI and machine learning to analyze the Islam West Africa Collection digital database.",
            imageUrl: "/images/iwac-project.jpg"
        },
        {
            id: "religious-activism-campuses-togo-benin",
            title: "Religious Activism on Campuses in Togo and Benin (2021-24)",
            years: "2021-2024",
            shortDescription: "Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
            imageUrl: "/images/campus-activism.jpg"
        },
        {
            id: "muslim-minorities-southern-cities-benin-togo",
            title: "Muslim Minorities in Southern Cities of Benin and Togo (2018-20)",
            years: "2018-2020",
            shortDescription: "Investigating the experiences and integration of Muslim minority communities in southern urban areas of Benin and Togo.",
            imageUrl: "/images/muslim-minorities.jpg"
        },
        {
            id: "youth-womens-islamic-activism-cote-divoire-burkina-faso",
            title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso​ (2013-18)",
            years: "2013-2018",
            shortDescription: "Analyzing the evolving roles of youth and women in Islamic movements and organizations in Côte d'Ivoire and Burkina Faso.",
            imageUrl: "/images/youth-women-activism.jpg"
        }
    ];
</script>

<div class="prose prose-lg max-w-none">
    <h1 class="text-4xl font-bold mb-8">Research</h1>
    
    <p class="text-xl mb-10">My research focuses on the history of Islam and Muslim societies in francophone West Africa from the 1960s to the present. I have conducted extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso, examining various aspects of Islamic activism, media use, and Muslim politics.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {#each researchProjects as project}
            <div class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="h-48 bg-gray-200 flex items-center justify-center">
                    <div class="text-gray-400 text-center p-4">
                        {project.title}
                        <br>
                        <span class="text-sm">[Image placeholder]</span>
                    </div>
                </div>
                <div class="p-6">
                    <h2 class="text-xl font-semibold mb-2">
                        <a href={`/research/${project.id}`} class="text-gray-900 hover:text-gray-700">
                            {project.title}
                        </a>
                    </h2>
                    <p class="text-sm text-gray-500 mb-3">{project.years}</p>
                    <p class="text-gray-700">{project.shortDescription}</p>
                    <a href={`/research/${project.id}`} class="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                        Read more →
                    </a>
                </div>
            </div>
        {/each}
    </div>
</div> 