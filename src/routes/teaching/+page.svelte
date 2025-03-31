<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths'; // Import base path for images

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
            syllabusUrl: `${base}/files/syllabus-francophone-west-africa.pdf`
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
            topic: "Topics in African History & Islamic Studies", // Placeholder - Update as needed
            period: "Ongoing", // Placeholder - Update as needed
            description: "Invited talks and lectures delivered at various academic institutions.", // Placeholder description
            imageUrl: `${base}/images/teaching/guest-lecture.webp` // Placeholder image
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
                <div class="teaching-card">
                    {#if item.imageUrl}
                        <div class="teaching-card-image">
                            <img src={item.imageUrl} alt={item.title} class="w-full h-auto" />
                        </div>
                    {/if}
                    <div class="teaching-card-body">
                        <h2 class="teaching-card-title">{item.title}</h2>
                        <p class="teaching-card-details">
                            <span class="institution">{item.institution}</span><br>
                            {#if item.type === 'course'}
                                <span class="level">Level: {item.level}</span><br>
                                <span class="period">Period: {item.period}</span>
                            {:else if item.type === 'guest_lecture'}
                                <span class="topic">Topic: {item.topic}</span><br>
                                <span class="period">Period: {item.period}</span>
                            {/if}
                        </p>
                        {#if item.description}
                            <p class="teaching-card-description">{item.description}</p>
                        {/if}
                        <!-- Conditionally display syllabus link -->
                        {#if item.syllabusUrl}
                            <a href={item.syllabusUrl} target="_blank" rel="noopener noreferrer" class="teaching-card-link">
                                View Syllabus →
                            </a>
                        {/if}
                    </div>
                </div>
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
        gap: 2rem;
        margin-top: 2rem;
    }
    
    .teaching-card {
        display: flex;
        flex-direction: column;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        background-color: white;
    }
    
    .teaching-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }
    
    .teaching-card-image {
        overflow: hidden;
        max-height: 200px;
        background-color: var(--color-gray-200);
    }
    
    .teaching-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .teaching-card:hover .teaching-card-image img {
        transform: scale(1.05);
    }
    
    .teaching-card-body {
        padding: 1.5rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    
    .teaching-card-title {
        font-size: var(--font-size-xl);
        margin-top: 0;
        margin-bottom: 0.75rem;
        line-height: 1.3;
        font-weight: 600;
        color: var(--color-primary);
    }
    
    .teaching-card-details {
        font-size: 0.9rem;
        color: var(--color-text-secondary, #555);
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    .teaching-card-details .institution {
        font-weight: 500;
        color: var(--color-text, #333);
    }
    
    .teaching-card-description {
        margin-bottom: 1.5rem;
        flex-grow: 1;
        line-height: 1.6;
        font-size: 0.95rem;
    }

    /* Re-added teaching-card-link styles */
    .teaching-card-link {
        display: inline-block;
        color: var(--color-primary, #0066cc);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
        margin-top: auto; /* Pushes link to bottom */
        align-self: flex-start; /* Align link to the left */
    }

    .teaching-card-link:hover {
        color: var(--color-primary-dark, #004c99);
        text-decoration: underline;
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