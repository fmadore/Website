<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import Card from '$lib/components/common/Card.svelte'; // Import Card component
	import PageHeader from '$lib/components/common/PageHeader.svelte';

    // Define the structure for a project
    interface ProjectType {
        id: string;
        title: string;
        years: string;
        shortDescription: string;
        imageUrl: string;
        linkUrl?: string; // Optional: Some projects might not have an external/internal link yet
        award?: string; // Optional
        reviews?: { text: string; url: string }[]; // Optional array of review objects
        publication?: { text: string; url: string }; // Optional publication object
        skills?: string[]; // Optional: Array of skills/technologies used
    }

    // Digital Humanities projects data (initial)
    const initialDhProjects: ProjectType[] = [
        {
            id: "iwac",
            title: "Islam West Africa Collection",
            years: "2023-",
            shortDescription: "A collection of over 13,000 documents on Islam and Muslims in Burkina Faso, Benin, Niger, Nigeria, Togo and Côte d'Ivoire.",
            imageUrl: `${base}/images/digital-humanities/IWAC.webp`,
            linkUrl: "https://islam.zmo.de/s/westafrica/", // External link remains unchanged
            skills: ["Omeka S", "OpenRefine", "Metadata Standards", "Docker", "Linux System Administration", "Nginx", "Python", "Tesseract", "IIIF", "Apache Solr", "Linked Data", "Rclone", "spaCy", "pandas", "Web scraping"]
        },
        {
            id: "iwac-overview",
            title: "Islam West Africa Collection Overview",
            years: "2025",
            shortDescription: "Exploring the Islam West Africa Collection (IWAC) through digital methods and visualizations.",
            imageUrl: `${base}/images/digital-humanities/iwac-overview.webp`,
            skills: ["Svelte", "D3.js", "TypeScript", "Vite", "Data visualisation"]
            // No linkUrl needed, will be generated relative to base
        },
        {
            id: "iwac-wordcloud",
            title: "IWAC Newspaper Word Cloud",
            years: "2025",
            shortDescription: "Interactive word cloud visualising the most frequent words in newspaper articles from the Islam West Africa Collection.",
            imageUrl: `${base}/images/digital-humanities/iwac-wordcloud.webp`,
            skills: ["D3.js", "Python", "NLTK", "spaCy"]
        },
        {
            id: "muslim-umbrella-organizations",
            title: "Muslim Umbrella Organisations in IWAC",
            years: "2025",
            shortDescription: "Co-occurrence matrix and topic modeling analysis of newspaper articles discussing Muslim umbrella organisations within the Islam West Africa Collection.",
            imageUrl: `${base}/images/digital-humanities/muslim-umbrella.webp`,
            skills: ["D3.js", "Python", "NLTK", "spaCy", "scikit-learn"]
        },
        {
            id: "iwac-keywords",
            title: "IWAC Keywords Dashboard",
            years: "2024",
            shortDescription: "Interactive temporal analysis of keywords from West African newspapers in the Islam West Africa Collection, revealing thematic evolution and media attention patterns.",
            imageUrl: `${base}/images/digital-humanities/iwac-keywords.webp`,
            skills: ["Shiny for Python", "Plotly"]
        },
        {
            id: "remoboko",
            title: "Remoboko: Religion, Morality and Boko in West Africa",
            years: "2024",
            shortDescription: "Research group exploring religion, morality, and student life in West African higher education. Includes interactive visualizations.",
            imageUrl: `${base}/images/digital-humanities/remoboko.webp`,
            skills: ["Data Visualization", "pandas", "Plotly", "Python", "Folium", "NLTK"]
        },
        {
            id: "iwac-bibliographic-data-wikidata",
            title: "IWAC Bibliographic Data on Wikidata",
            years: "2023",
            shortDescription: "Inspired by the WikiCite initiative, which aims \"to develop open citations and linked bibliographic data to serve free knowledge\", the metadata of all the bibliographical references of the Islam West Africa Collection has been uploaded to Wikidata to make them to be more openly citable and accessible.",
            imageUrl: `${base}/images/digital-humanities/iwac-bibliographic-data-wikidata.svg`,
            skills: ["Wikidata", "OpenRefine", "Scholia", "SPARQL", "Linked Data", "Metadata Management"]
        },
        {
            id: "islam-burkina-faso-collection",
            title: "Islam Burkina Faso Collection",
            years: "2018-2023",
            shortDescription: "An open access digital database containing over 2,900 documents on Islam and Muslims in Burkina Faso.",
            imageUrl: `${base}/images/digital-humanities/islam-burkinafaso-banner.webp`,
            award: "Won a 2023 Emerging Open Scholarship Award.",
            reviews: [
                { text: "Review by Robert Launay", url: "https://doi.org/10.21428/3e88f64f.89e71c81" },
                { text: "Review by Vincent Hiribarren", url: "https://doi.org/10.2979/mnd.2022.a908483" }
            ],
            publication: { text: "Learn more about the project", url: "https://doi.org/10.51185/journals/rhca.2021.e610" },
            skills: ["Omeka S", "Tesseract", "Metadata Standards", "OpenRefine", "Zotero", "Linked Data"]
        }
    ];

    // Extend the interface to include the calculated properties
    interface ProcessedProjectType extends ProjectType {
        finalLinkUrl: string | undefined;
        linkTarget: string;
        actionText: string;
    }

    // Pre-calculate final URLs and targets into a new array
    const processedDhProjects: ProcessedProjectType[] = initialDhProjects.map(project => {
        const isExternal = project.linkUrl && project.linkUrl.startsWith('http');
        const internalPath = isExternal ? null : (project.linkUrl || `/digital-humanities/${project.id}`);
        const finalLinkUrl = isExternal ? project.linkUrl : `${base}${internalPath}`;
        const linkTarget = isExternal ? '_blank' : '_self';
        const actionText = isExternal ? 'Visit Site →' : 'Explore project →';
        
        return {
            ...project,
            finalLinkUrl, // Add calculated URL to the object
            linkTarget,   // Add calculated target
            actionText    // Add calculated action text
        };
    });

</script>

<SEO title="Digital Humanities | Frédérick Madore" description="Discover Frédérick Madore's digital humanities projects including the Islam West Africa Collection (IWAC)." />

<div class="container">
	<PageHeader title="Digital Humanities" />

    <p class="text-xl mb-10">This section presents some of my work in digital humanities (DH), applying computational methods to historical research on Islam and Muslim societies in West Africa. DH has taken an increasingly important place in my research in recent years, leading me to develop my skills through both specialised training and continuous self-learning. I use data visualisation techniques to translate research findings into compelling narratives, making historical findings accessible and engaging.</p>

    <div class="content-grid">
        {#each processedDhProjects as project (project.id)}
            <Card
                title={project.title}
                imageUrl={project.imageUrl}
                linkUrl={project.finalLinkUrl}
                target={project.linkTarget}
            >
                <span slot="subtitle">{project.years}</span>

                <!-- Default slot for description - Render HTML -->
                {@html project.shortDescription}

                <!-- Details slot for award, reviews, skills, etc. -->
                <div slot="details" class="dh-card-extras">
                    <!-- Skills section -->
                    {#if project.skills && project.skills.length > 0}
                        <div class="project-skills-container">
                            <strong>Skills:</strong>
                            <div class="skills-list">
                                {#each project.skills as skill}
                                    <span class="project-skill-tag">{skill}</span>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    {#if project.award}
                        <p class="award"><strong>Award:</strong> {project.award}</p>
                    {/if}
                    {#if project.publication}
                         <p class="publication-link">
                             <a href={project.publication.url} target="_blank" rel="noopener noreferrer">{project.publication.text}</a>
                         </p>
                    {/if}
                    {#if project.reviews && project.reviews.length > 0}
                        <div class="reviews">
                            <strong>Reviews:</strong>
                            <ul>
                                {#each project.reviews as review}
                                    <li><a href={review.url} target="_blank" rel="noopener noreferrer">{review.text}</a></li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>

                <!-- Action slot for the main link -->
                <a slot="action" href={project.finalLinkUrl} target={project.linkTarget} rel={project.linkTarget === '_blank' ? 'noopener noreferrer' : null}>
                    {project.actionText}
                </a>
            </Card>
        {/each}
    </div>

    <!-- Optional: Add back detailed descriptions or other content here if needed -->
    <!--
    <section class="project-details">
        <h2>Project Details & Publications</h2>
        // Add more content here if the cards aren't enough
    </section>
    -->

</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }
    
    .text-xl {
         font-size: 1.25rem; 
    }
    .mb-10 {
        margin-bottom: 2.5rem;
    }
    
    /* .dh-grid styles are now handled by .content-grid */
    /* Ensure any unique styles for this page that were part of .dh-grid are preserved or moved if necessary. */
    /* .content-grid includes gap: var(--spacing-8) and margin-top: var(--spacing-8) (which was 2rem for .dh-grid) */
        
    /* Responsive grid adjustments */
    /* These are now handled by the global .content-grid class */
    /* @media (min-width: 640px) {
        .dh-grid {
            grid-template-columns: repeat(2, 1fr); 
        }
    } */

    /* Styles for content within the details slot */
    .dh-card-extras {
        font-size: 0.9rem; /* Consider var(--font-size-sm) */
        margin-top: var(--spacing-2);
        line-height: 1.4;
    }
    .dh-card-extras p,
    .dh-card-extras div {
        margin-bottom: var(--spacing-2);
    }
     .dh-card-extras strong {
        color: var(--color-text-secondary); /* Or adjust as needed */
     }
    .dh-card-extras ul {
        list-style: none;
        padding-left: 0;
        margin-top: var(--spacing-1);
        margin-bottom: 0; /* Reset bottom margin for the list itself */
    }
     .dh-card-extras li {
        margin-bottom: var(--spacing-1);
    }
     .dh-card-extras a {
        color: var(--color-primary-dark); /* Or var(--color-link) */
        text-decoration: none;
    }
     .dh-card-extras a:hover {
         text-decoration: underline;
     }

</style> 