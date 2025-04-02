<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths'; // Import base path for images
    import Card from '$lib/components/common/Card.svelte'; // Import Card component

    // Unified teaching items data for cards
    const teachingItems = [
        {
            id: "african-past",
            type: 'course',
            title: "The African Past",
            institution: "University of Ottawa (Canada)",
            level: "undergraduate",
            period: "fall 2020",
            description: "An introduction to the major themes and debates in the history of Africa before the colonial era.",
            imageUrl: `${base}/images/teaching/uottawa.png`,
            syllabusUrl: `${base}/files/syllabus_the_african_past__fall_2020.pdf`
        },
        {
            id: "francophone-west-africa",
            type: 'course',
            title: "Francophone West Africa",
            institution: "University of Florida (United States)",
            level: "undergraduate",
            period: "spring 2020",
            description: "Exploring the history, politics, and societies of French-speaking West African nations.",
            imageUrl: `${base}/images/teaching/university-of-florida-logo.png`,
            syllabusUrl: `${base}/syllabi/francophone-west-africa.pdf`
        },
        {
            id: "dissertation-historique",
            type: 'course',
            title: "Dissertation historique [Historical writing]",
            institution: "Université Laval (Canada)",
            level: "undergraduate",
            period: "8 sections; fall 2013–winter 2018",
            description: "Guidance and workshops on research methodologies and the craft of historical writing.",
            imageUrl: `${base}/images/teaching/universite-Laval-logo.svg`
        },
        {
            id: "guest-lecturer",
            type: 'guest_lecture', // Differentiate this type
            title: "Guest Lecturer",
            institution: "Various Institutions",
            description: "A list of invited talks and lectures delivered at various academic institutions.", // Updated description
            imageUrl: `${base}/images/teaching/guest-lecture.webp`, // Placeholder image
            linkUrl: `${base}/teaching/guest-lectures` // <-- Link to new page
        }
    ];
</script>

<SEO title="Teaching" />

<div class="teaching-container">
    <div class="main-content">
        <h1>Teaching</h1>
        
        <p class="text-xl mb-10">Teaching interests: African History (pre-modern and modern periods), Islam in sub-Saharan Africa, West African history.</p>
        
        <!-- Card Grid Layout -->
        <div class="teaching-grid">
            {#each teachingItems as item (item.id)}
                <Card
                    title={item.title}
                    imageUrl={item.imageUrl}
                    linkUrl={item.linkUrl}
                    target={item.type === 'guest_lecture' ? '_self' : '_blank'}
                >
                    <span slot="subtitle">{item.institution}</span>

                    <div slot="details" class="teaching-card-specific-details">
                        {#if item.type === 'course'}
                            <p><span class="label">Level:</span> {item.level}</p>
                            <p><span class="label">Period:</span> {item.period}</p>
                        {:else if item.type === 'guest_lecture'}
                            <!-- Specific details not shown on card, link provided -->
                        {/if}
                    </div>

                    {item.description}

                    <div slot="action">
                        {#if item.syllabusUrl}
                            <a href={item.syllabusUrl} target="_blank" rel="noopener noreferrer">
                                View Syllabus →
                            </a>
                        {:else if item.linkUrl && item.type === 'guest_lecture'}
                            <a href={item.linkUrl}>
                                View List →
                            </a>
                        {/if}
                    </div>
                </Card>
            {/each}
        </div>
    </div>
</div>

<style>
    .teaching-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }
    
    .main-content {
        width: 100%;
    }
    
    h1 {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        margin-bottom: var(--spacing-4);
        color: var(--color-primary, #333);
    }
    
    .text-xl {
        font-size: var(--font-size-xl);
    }
    
    .mb-10 {
        margin-bottom: var(--spacing-10);
    }
    
    .teaching-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--spacing-8);
        margin-top: var(--spacing-8);
    }
    
    .teaching-card-specific-details p {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-1);
    }
    .teaching-card-specific-details .label {
        font-weight: 500;
        color: var(--color-text);
    }

    @media (min-width: 640px) {
        .teaching-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (min-width: 1024px) {
        .teaching-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }
</style> 