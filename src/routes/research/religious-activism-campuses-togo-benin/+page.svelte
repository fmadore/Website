<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
</script>

<SEO title="Religious Activism on Campuses in Togo and Benin" />

<div class="content-wrapper">
    <div class="main-content prose">
        <h1 class="project-title">Religious Activism on Campuses in Togo and Benin (2021-24)</h1>
        <p class="project-meta">Research project | 2021-2024</p>
        
        <div class="project-image">
            <img src="/images/research/campus-activism.webp" alt="Religious Activism on Campuses in Togo and Benin" class="w-full h-auto" />
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Project Overview</h2>
            <p>My book <em>Religious Activism on Campuses in Togo and Benin</em> examines how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi. Drawing on extensive archival research and interviews with several generations of activists, I show how these faith-based organisations emerged in the 1970s within institutions dominated by leftist and secular ideologies, and ultimately reshaped campus culture by offering students both spiritual guidance and practical support.</p>
            
            <p>This research project analyzes the transformation of university life through the lens of religious student organizations. I trace the evolution of these groups from their origins in the 1970s through periods of political upheaval and democratization in the 1990s, to their contemporary manifestations.</p>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Research Questions</h2>
            <ul class="method-list">
                <li>How did religious student associations navigate authoritarian political contexts and the principle of laïcité in public universities?</li>
                <li>What strategies did these organizations use to increase their influence on campus?</li>
                <li>How did interfaith dynamics shape campus life and student politics?</li>
                <li>What roles do these organizations play in providing material and spiritual support for students?</li>
            </ul>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Methodology</h2>
            <p>This research combines historical and ethnographic approaches:</p>
            <ul class="method-list">
                <li>Archival research in university and organizational archives in Togo and Benin</li>
                <li>In-depth interviews with current and former student activists</li>
                <li>Analysis of organizational publications and media</li>
                <li>Participant observation in religious student activities and events</li>
            </ul>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Publications</h2>
            <ul class="method-list">
                <li><strong>Book:</strong> <em>Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023</em>, Oxford University Press, 2024.</li>
                <li><strong>Edited Volume:</strong> <em>Religiosity on University Campuses in Africa: Trends and Experiences</em>, Lit Verlag, 2023.</li>
                <li><strong>Journal Article:</strong> "Faith-Based Organizing in West African Universities: Muslim Student Associations in Benin and Togo, 1980-2020," <em>Journal of Religion in Africa</em>, vol. 53, no. 1-2, 2023, pp. 67-93.</li>
            </ul>
        </div>
        
        <div class="project-section">
            <h2 class="project-section-title">Related Activities</h2>
            <ul class="method-list">
                <li>
                    <strong>Conference:</strong> "Author Meets Critic. Faith-based Student Activism in Togo and Benin: Muslims and Christians on University Campuses" (December 9, 2024)
                </li>
                <li>
                    <strong>Workshop:</strong> "Religious Organizations on University Campuses in West Africa" (Lomé, Togo, March 15-17, 2023)
                </li>
                <li>
                    <strong>Public Lecture:</strong> "Student Religious Movements and the Transformation of Higher Education in West Africa" (University of Florida, October 5, 2022)
                </li>
            </ul>
        </div>
        
        <div class="mt-4 pt-4 border-t">
            <a href="/research" class="project-card-link">← Back to Research Projects</a>
        </div>
    </div>
    
    <div class="sidebar">
        <RelevantPublications projectName="Religious Activism on Campuses in Togo and Benin" limit={5} />
    </div>
</div>

<style>
    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
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
    
    .project-title {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: var(--spacing-2);
    }
    
    .project-meta {
        font-size: var(--font-size-lg);
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-6);
    }
    
    .project-image {
        margin-bottom: var(--spacing-8);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        box-shadow: var(--shadow-md);
    }
    
    .project-image img {
        width: 100%;
        height: auto;
        display: block;
    }
    
    .project-section {
        margin-bottom: var(--spacing-10);
    }
    
    .project-section-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: var(--spacing-4);
    }
    
    .project-card-link {
        display: inline-block;
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .project-card-link:hover {
        color: var(--color-primary-dark);
        text-decoration: underline;
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