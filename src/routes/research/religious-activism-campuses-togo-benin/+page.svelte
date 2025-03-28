<script>
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/RelevantPublications.svelte';
    import { base } from '$app/paths';
</script>

<SEO title="Religious Activism on Campuses in Togo and Benin" />

<div class="content-wrapper">
    <div class="main-content prose">
        <div class="project-header">
            <h1 class="project-title">Religious Activism on Campuses in Togo and Benin</h1>
            <p class="project-years">2021-2024</p>
            <p class="project-meta">Project funded by the "Remoboko" Leibniz Junior Research Group</p>
        </div>
        
        <div class="project-image">
            <img src="{base}/images/research/campus-activism.webp" alt="Religious Activism on Campuses in Togo and Benin" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>This project uncovers the neglected history of Christian and Muslim student associations at the Université de Lomé (Togo) and the Université d'Abomey-Calavi (Benin), and examines their resilience and adaptability over five decades. While much of the literature has focused on the role of student protests in triggering national conferences in Benin and Togo in the early 1990s, this study broadens the lens to include the significant but often overlooked religious dimension of campus life.</p>
            
            <p>Drawing on interviews with several generations of activists and press coverage from both countries, the research analyses the emergence and evolution of these religious associations under challenging political circumstances: a one-party dictatorship in Togo and a Marxist-Leninist regime in Benin. It explores how these groups navigated authoritarian rule, political liberalisation and the principles of laïcité, while shaping campus dynamics in institutions originally known as strongholds of leftist, anti-imperialist and secular ideologies.</p>
            
            <p>The study reveals the university campus as a microcosm reflecting broader national socio-political trends, while also highlighting the importance of translocal factors in shaping the internal dynamics of these groups. Amidst the massification of university enrolments and rising graduate unemployment in recent decades, faith-based associations have expanded their role beyond religious guidance. Increasingly, they offer a "social curriculum", providing a space for socialisation and a set of skills, norms and moral values that complement the secular academic curriculum.</p>
            
            <p>By analysing the interplay between religion, politics and education, this book provides new insights into the evolving role of faith in public universities and broader societal transformations in West Africa. It explores the implications of growing religiosity for these public universities as secular institutions, and contributes to our understanding of how religious organisations have coexisted with, and sometimes challenged, traditional student associations since the 1970s.</p>
        </div>
        
        <div class="mt-4 pt-4 border-t">
            <a href="{base}/research" class="project-card-link">← Back to Research Projects</a>
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
        width: 100%;
    }
    
    .sidebar {
        width: 100%;
        margin-top: var(--spacing-8);
    }
    
    .project-header {
        margin-bottom: var(--spacing-6);
    }
    
    .project-title {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: var(--spacing-2);
    }
    
    .project-years {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: var(--spacing-2);
        border-left: 4px solid var(--color-primary);
        padding-left: var(--spacing-2);
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
    
    .project-content {
        margin-bottom: var(--spacing-10);
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
        
        .main-content {
            width: 80%;
        }
        
        .sidebar {
            width: 20%;
            margin-top: 0;
        }
    }
</style> 