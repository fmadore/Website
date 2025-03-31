<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';

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

<SEO title="Digital Humanities" description="Discover Frédérick Madore's digital humanities projects including the Islam West Africa Collection (IWAC) and Islam Burkina Faso Collection." />

<div class="container">
    <h1 class="dh-section-title">Digital Humanities</h1>

    <div class="dh-grid">
        {#each dhProjects as project}
            <div class="dh-card">
                <div class="dh-card-image">
                    <a href={project.linkUrl} target="_blank" rel="noopener noreferrer">
                         <img src={project.imageUrl} alt={project.title} class="w-full h-auto" />
                    </a>
                </div>
                <div class="dh-card-body">
                    <h2 class="dh-card-title">
                        <a href={project.linkUrl} target="_blank" rel="noopener noreferrer" class="text-dark hover:text-primary">
                            {project.title}
                        </a>
                    </h2>
                    <p class="dh-card-years">{project.years}</p>
                    <p class="dh-card-description">{project.shortDescription}</p>
                    {#if project.award}
                        <p class="dh-card-award"><strong>Award:</strong> {project.award}</p>
                    {/if}
                    {#if project.publication}
                         <p class="dh-card-extra-link">
                             <a href={project.publication.url} target="_blank" rel="noopener noreferrer">{project.publication.text}</a>
                         </p>
                    {/if}
                    {#if project.reviews && project.reviews.length > 0}
                        <div class="dh-card-reviews">
                            <strong>Reviews:</strong>
                            <ul>
                                {#each project.reviews as review}
                                    <li><a href={review.url} target="_blank" rel="noopener noreferrer">{review.text}</a></li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                    <a href={project.linkUrl} target="_blank" rel="noopener noreferrer" class="dh-card-link">
                        Visit Collection →
                    </a>
                </div>
            </div>
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

    .dh-section-title {
        font-size: var(--font-size-3xl); /* Use existing font size variable */
        font-weight: 700;
        margin-bottom: var(--spacing-8); /* Use existing spacing variable */
        color: var(--color-primary, #333);
    }

    .dh-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 2rem;
        margin-top: 2rem;
    }

    .dh-card {
        display: flex;
        flex-direction: column;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        background-color: white; /* Ensure card background is white */
    }

    .dh-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }

    .dh-card-image {
        overflow: hidden;
        max-height: 250px; /* Adjust as needed */
        background-color: var(--color-gray-200); /* Placeholder background */
    }

     .dh-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .dh-card:hover .dh-card-image img {
        transform: scale(1.05);
    }

    .dh-card-body {
        padding: 1.5rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .dh-card-title {
        font-size: var(--font-size-2xl); /* Use existing font size */
        margin-top: 0; /* Reset margin */
        margin-bottom: 0.5rem;
        line-height: 1.3;
        color: var(--color-primary); /* Ensure title color matches */
    }
     .dh-card-title a {
        color: inherit; /* Inherit color from h2 */
        text-decoration: none;
    }
    .dh-card-title a:hover {
        text-decoration: underline;
    }


    .dh-card-years {
        font-size: 0.9rem;
        color: var(--color-text-secondary, #666);
        margin-bottom: 1rem;
    }

    .dh-card-description {
        margin-bottom: 1.5rem;
        flex-grow: 1; /* Pushes link to bottom */
        line-height: 1.6; /* Adjust line height */
    }

    .dh-card-award,
    .dh-card-extra-link,
    .dh-card-reviews {
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
        line-height: 1.5;
    }

    .dh-card-reviews ul {
        list-style: none;
        padding-left: 0;
        margin-top: 0.25rem;
    }
    .dh-card-reviews li {
        margin-bottom: 0.25rem;
    }
     .dh-card-reviews a, .dh-card-extra-link a {
        color: var(--color-primary-dark, #004c99);
        text-decoration: none;
    }
     .dh-card-reviews a:hover, .dh-card-extra-link a:hover {
         text-decoration: underline;
     }

    .dh-card-link {
        display: inline-block;
        color: var(--color-primary, #0066cc);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
        margin-top: auto; /* Pushes link to bottom if description doesn't fill space */
        align-self: flex-start; /* Align link to the left */
    }

    .dh-card-link:hover {
        color: var(--color-primary-dark, #004c99);
        text-decoration: underline;
    }

    /* Responsive adjustments */
    @media (min-width: 768px) { /* Tablet and up */
        .dh-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* Remove styles related to the old structure */
    /* h1, h2, h3, .project, p, blockquote, hr, a styles might need adjustment
       if they conflict or are no longer needed in their previous form.
       The new card styles handle most of the formatting within the cards.
       Keeping general 'a' styles for now. */

     a { /* Keep general link style for now */
        color: var(--color-primary);
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    /* Removed old .project, h2, h3, blockquote, hr specific styles */
    /* Keep .container styles */

</style> 