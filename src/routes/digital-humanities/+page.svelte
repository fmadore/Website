<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import Card from '$lib/components/common/Card.svelte'; // Import Card component
	import PageHeader from '$lib/components/common/PageHeader.svelte';

    // Digital Humanities projects data
    const dhProjects = [
        {
            id: "iwac",
            title: "Islam West Africa Collection",
            years: "2023-",
            shortDescription: "A collection of over 12,500 documents on Islam and Muslims in Burkina Faso, Benin, Niger, Nigeria, Togo and Côte d'Ivoire.",
            imageUrl: `${base}/images/digital-humanities/IWAC.png`,
            linkUrl: "https://islam.zmo.de/s/westafrica/"
        },
        {
            id: "ibfc",
            title: "Islam Burkina Faso Collection",
            years: "2018-2023",
            shortDescription: "An open access digital database containing over 2,900 documents on Islam and Muslims in Burkina Faso.",
            imageUrl: `${base}/images/digital-humanities/islam-burkinafaso-banner.webp`,
            linkUrl: "https://ufdc.ufl.edu/collections/ibfc",
            award: "Won a 2023 Emerging Open Scholarship Award.",
            reviews: [
                { text: "Review by Robert Launay", url: "https://doi.org/10.21428/3e88f64f.89e71c81" },
                { text: "Review by Vincent Hiribarren", url: "https://doi.org/10.2979/mnd.2022.a908483" }
            ],
            publication: { text: "Learn more about the project", url: "https://doi.org/10.51185/journals/rhca.2021.e610" }
        }
    ];
</script>

<SEO title="Digital Humanities | Frédérick Madore" description="Discover Frédérick Madore's digital humanities projects including the Islam West Africa Collection (IWAC) and Islam Burkina Faso Collection." />

<div class="container">
	<PageHeader title="Digital Humanities" />

    <div class="dh-grid">
        {#each dhProjects as project (project.id)}
            <Card 
                title={project.title} 
                imageUrl={project.imageUrl}
                linkUrl={project.linkUrl}
                target="_blank"
            >
                <span slot="subtitle">{project.years}</span>
                
                <!-- Default slot for description -->
                {project.shortDescription}

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
                <a slot="action" href={project.linkUrl} target="_blank" rel="noopener noreferrer">
                    Visit Collection →
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
        padding: 0 var(--spacing-4); /* Use existing spacing variable */
    }

    .dh-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--spacing-8); /* Use variable */
        margin-top: var(--spacing-8); /* Use variable */
    }

    /* Styles for content within the details slot */
    .dh-card-extras {
        font-size: 0.9rem;
        margin-top: var(--spacing-2);
    }
    .dh-card-extras p,
    .dh-card-extras div {
        margin-bottom: var(--spacing-3);
    }
    .dh-card-extras ul {
        list-style: none;
        padding-left: 0;
        margin-top: var(--spacing-1);
    }
     .dh-card-extras li {
        margin-bottom: var(--spacing-1);
    }
     .dh-card-extras a {
        color: var(--color-primary-dark);
        text-decoration: none;
    }
     .dh-card-extras a:hover {
         text-decoration: underline;
     }

    /* Removed old card styles (.dh-card, .dh-card-body, etc.) */
    
    /* Responsive adjustments */
    @media (min-width: 768px) { /* Tablet and up */
        .dh-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* General link styles (potentially remove if not needed elsewhere) */
     a {
        color: var(--color-primary);
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

</style> 