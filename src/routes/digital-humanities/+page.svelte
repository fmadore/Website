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
    }

    // Digital Humanities projects data (initial)
    const initialDhProjects: ProjectType[] = [
        {
            id: "iwac-overview",
            title: "Islam West Africa Collection Overview",
            years: "2025",
            shortDescription: "Exploring the Islam West Africa Collection (IWAC) through digital methods and visualizations.",
            imageUrl: `${base}/images/digital-humanities/iwac-overview.jpg`
            // No linkUrl needed, will be generated relative to base
        },
        {
            id: "iwac",
            title: "Islam West Africa Collection",
            years: "2023-",
            shortDescription: "A collection of over 12,500 documents on Islam and Muslims in Burkina Faso, Benin, Niger, Nigeria, Togo and Côte d'Ivoire.",
            imageUrl: `${base}/images/digital-humanities/IWAC.png`,
            linkUrl: "https://islam.zmo.de/s/westafrica/" // External link remains unchanged
        },
        {
            id: "ibfc",
            title: "Islam Burkina Faso Collection",
            years: "2018-2023",
            shortDescription: "An open access digital database containing over 2,900 documents on Islam and Muslims in Burkina Faso.",
            imageUrl: `${base}/images/digital-humanities/islam-burkinafaso-banner.webp`,
            // linkUrl: `${base}/digital-humanities/islam-burkina-faso-collection`, // Old
            linkUrl: "/digital-humanities/islam-burkina-faso-collection", // New: relative to base
            award: "Won a 2023 Emerging Open Scholarship Award.",
            reviews: [
                { text: "Review by Robert Launay", url: "https://doi.org/10.21428/3e88f64f.89e71c81" },
                { text: "Review by Vincent Hiribarren", url: "https://doi.org/10.2979/mnd.2022.a908483" }
            ],
            publication: { text: "Learn more about the project", url: "https://doi.org/10.51185/journals/rhca.2021.e610" }
        },
        {
            id: "remoboko",
            title: "Remoboko: Religion, Morality and Boko in West Africa",
            years: "2024",
            shortDescription: "Research group exploring religion, morality, and student life in West African higher education. Includes interactive visualizations.",
            imageUrl: `${base}/images/digital-humanities/remoboko.png`,
            // linkUrl: `${base}/digital-humanities/remoboko`, // Old
            linkUrl: "/digital-humanities/remoboko" // New: relative to base
        },
        {
            id: "iwac-wordcloud",
            title: "IWAC Newspaper Word Cloud",
            years: "2025",
            shortDescription: "Interactive word cloud visualising the most frequent words in newspaper articles from the Islam West Africa Collection.",
            imageUrl: `${base}/images/digital-humanities/iwac-wordcloud.jpg`,
            // linkUrl: `${base}/digital-humanities/iwac-wordcloud`, // Old
            linkUrl: "/digital-humanities/iwac-wordcloud" // New: relative to base
        },
        {
            id: "muslim-umbrella-organizations",
            title: "Muslim Umbrella Organisations in IWAC",
            years: "2025",
            shortDescription: "Co-occurrence matrix and topic modeling analysis of newspaper articles discussing Muslim umbrella organisations within the Islam West Africa Collection.",
            imageUrl: `${base}/images/digital-humanities/muslim-umbrella.jpg`,
            // linkUrl: `${base}/digital-humanities/muslim-umbrella-organizations`, // Old
            linkUrl: "/digital-humanities/muslim-umbrella-organizations" // New: relative to base
        },
        {
            id: "iwac-keywords",
            title: "IWAC Keywords Dashboard",
            years: "2025",
            shortDescription: "Interactive temporal analysis of keywords from West African newspapers in the Islam West Africa Collection, revealing thematic evolution and media attention patterns.",
            imageUrl: `${base}/images/digital-humanities/iwac-keywords.jpg`,
            // linkUrl: `${base}/digital-humanities/iwac-keywords`, // Old
            linkUrl: "/digital-humanities/iwac-keywords" // New: relative to base
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

    <div class="dh-grid">
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

                <!-- Details slot for award, reviews, etc. -->
                <div slot="details" class="dh-card-extras">
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
    
    .dh-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--spacing-8); 
        margin-top: 2rem; 
    }
        
    /* Responsive grid adjustments */
    @media (min-width: 640px) {
        .dh-grid {
            grid-template-columns: repeat(2, 1fr); /* Or repeat(1, 1fr) if you prefer single column */
        }
    }

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