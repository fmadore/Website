<script>
    import SEO from '$lib/SEO.svelte';
    import LatestActivities from '$lib/LatestActivities.svelte';

    // Teaching experience data
    const teachingExperience = [
        {
            institution: "University of Ottawa (Canada)",
            courses: [
                {
                    title: "The African Past",
                    level: "undergraduate",
                    period: "fall 2020"
                }
            ]
        },
        {
            institution: "University of Florida (United States)",
            courses: [
                {
                    title: "Francophone West Africa",
                    level: "undergraduate",
                    period: "spring 2020"
                }
            ]
        },
        {
            institution: "Université Laval (Canada)",
            courses: [
                {
                    title: "Dissertation historique [Historical writing]",
                    level: "undergraduate",
                    period: "8 sections; fall 2013–winter 2018"
                }
            ]
        }
    ];
</script>

<SEO title="Teaching" />

<div class="teaching-container">
    <div class="content-wrapper">
        <div class="main-content">
            <h1>Teaching</h1>
            
            <p class="text-xl mb-10">Teaching interests: African History (pre-modern and modern periods), Islam in sub-Saharan Africa, West African history</p>
            
            <section class="teaching-section">
                <h2>Teaching experience</h2>
                
                {#each teachingExperience as experience}
                    <div class="institution-section">
                        <h3 class="institution-name">{experience.institution}</h3>
                        
                        <div class="courses-list">
                            {#each experience.courses as course}
                                <div class="course-item">
                                    <p class="course-title">
                                        <span class="course-name">{course.title}</span>, 
                                        <span class="course-level">{course.level}</span>
                                        <span class="course-period">({course.period})</span>
                                    </p>
                                </div>
                            {/each}
                        </div>
                    </div>
                    
                    {#if experience !== teachingExperience[teachingExperience.length - 1]}
                        <hr class="section-divider">
                    {/if}
                {/each}
            </section>
        </div>
        
        <div class="sidebar">
            <LatestActivities limit={3} />
        </div>
    </div>
</div>

<style>
    .teaching-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }
    
    .content-wrapper {
        display: flex;
        flex-direction: column;
    }
    
    .main-content {
        flex: 3;
    }
    
    .sidebar {
        flex: 1;
        margin-top: var(--spacing-8);
    }
    
    .teaching-section {
        margin-top: var(--spacing-10);
    }
    
    .institution-section {
        margin-bottom: var(--spacing-6);
    }
    
    .institution-name {
        color: var(--color-primary);
        font-weight: 600;
        margin-bottom: var(--spacing-4);
    }
    
    .courses-list {
        margin-left: var(--spacing-6);
    }
    
    .course-item {
        margin-bottom: var(--spacing-3);
    }
    
    .course-title {
        margin: 0;
    }
    
    .course-name {
        font-style: italic;
    }
    
    .course-level {
        font-weight: normal;
    }
    
    .section-divider {
        margin: var(--spacing-8) 0;
        border: none;
        border-top: 1px solid var(--color-border);
    }
    
    /* Media queries for responsive layout */
    @media (min-width: 768px) {
        .content-wrapper {
            flex-direction: row;
            gap: var(--spacing-8);
        }
        
        .sidebar {
            margin-top: 0;
        }
    }
</style> 