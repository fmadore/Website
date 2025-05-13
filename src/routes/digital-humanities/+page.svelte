<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
    import Card from '$lib/components/common/Card.svelte';
    import PageHeader from '$lib/components/common/PageHeader.svelte';
    import { allDhProjects } from '$lib/data/digital-humanities'; // Import the new data source
    import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities'; // Import the type

    // Prepare projects for display, calculating link properties
    const processedDhProjects = allDhProjects.map(project => {
        const isExternal = project.linkUrl && (project.linkUrl.startsWith('http://') || project.linkUrl.startsWith('https://'));
        const internalPath = `/digital-humanities/${project.id}`;
        // Ensure project.linkUrl is used directly if it's external, otherwise construct internal path with base
        const finalLinkUrl = isExternal ? project.linkUrl! : `${base}${internalPath}`;
        const linkTarget = isExternal ? '_blank' : '_self';
        const actionText = isExternal ? 'Visit Site →' : 'Explore project →';
        
        return {
            ...project,
            // Prepend base to imageUrl for the Card component, as project.imageUrl is a root-relative path like /images/...
            // Ensure project.imageUrl has a leading slash if it doesn't already, for consistency with base path.
            imageUrl: `${base}${project.imageUrl.startsWith('/') ? project.imageUrl : '/' + project.imageUrl}`,
            finalLinkUrl,
            linkTarget,
            actionText
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

                <!-- Default slot for description - Use shortDescription (plain text) -->
                {project.shortDescription}

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