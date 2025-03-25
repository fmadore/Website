<script>
    import LatestActivities from '$lib/LatestActivities.svelte';

    // Data for latest activities
    const latestActivities = [
        {
            title: "Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023",
            date: "21 March 2025",
            url: "/research/religious-activism-campuses-togo-benin"
        },
        {
            title: "Établir une faîtière islamique à l'échelle nationale: le cas de 4 pays d'Afrique de l'Ouest francophone",
            date: "4 March 2025",
            url: "/research/etablir-une-faitiere-islamique"
        },
        {
            title: "Author Meets Critic. Faith-based Student Activism in Togo and Benin: Muslims and Christians on University Campuses",
            date: "9 December 2024",
            url: "/conference-activity/author-meets-critic-faith-based-student-activism"
        }
    ];

    // Years with content
    const years = [
        { year: 2025, count: 2 },
        { year: 2024, count: 13 },
        { year: 2023, count: 10 },
        { year: 2022, count: 13 },
        { year: 2020, count: 1 },
        { year: 2016, count: 1 }
    ];
</script>

<div class="profile-container">
    <div class="profile-header">
        <div class="profile-photo">
            <img src="/images/Profile-picture.jpg" alt="Frédérick Madore" class="rounded-full">
        </div>
        <div class="profile-title">
            <h1>About</h1>
            <div class="subtitle">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</div>
        </div>
    </div>

    <div class="profile-content">
        <div class="main-content">
            <p>I am a Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO), where I work in the research unit "Religion and Intellectual Culture". My research focuses on the history of Islam and Muslim societies in francophone West Africa from the 1960s to the present. I have conducted extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso, examining Islamic activism among youth and women, their appropriation of (new) media, and Muslim politics.</p>
            
            <p>My recent book, <em>Religious Activism on Campuses in Togo and Benin</em>, examines how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi. Drawing on extensive archival research and interviews with several generations of activists, I show how these faith-based organisations emerged in the 1970s within institutions dominated by leftist and secular ideologies, and ultimately reshaped campus culture by offering students both spiritual guidance and practical support.</p>
            
            <p>A significant part of my work involves digital humanities (DH), with a focus on the <em>Islam West Africa Collection</em> (IWAC). This open-access digital database contains over 12,500 documents and 850 bibliographical references on Islam in six West African countries, comprising over 22 million words. To analyse this vast corpus, I use artificial intelligence and machine learning techniques to uncover patterns and trends in Francophone West African Muslim societies that traditional research methods might miss. This innovative approach brings fresh perspectives to the field, combining historical expertise with cutting-edge computational analysis.</p>
            
            <p>I am the author of <em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em> (Presses de l'Université Laval/Hermann, 2016) and co-editor of <em>Religiosity on University Campuses in Africa: Trends and Experiences</em> (Lit Verlag, 2023). I have also co-edited two special journal issues: "Muslim Minorities in Africa, Part 1 & Part 2" (<em>Islamic Africa</em>, 2021-22) and "​Les acteurs religieux africains à l'ère du numérique" (<em>Émulations</em>, 2017). My research has been published in eleven peer-reviewed journals and six edited volumes.</p>
            
            <p>Prior to my current position, I was a Banting Postdoctoral Fellow at the Center for African Studies at the University of Florida, and a Part-Time Professor at the University of Ottawa. I received my Ph.D. in History from the Université Laval (Canada) in 2018 with distinction.</p>
            
            <p>Since 2025, I have been working as a consultant for Communitology, a US-based company that integrates social science expertise into asylum and immigration processes. In this role, I prepare specialised Country of Origin Information (COI) reports for cases focusing on Benin, Togo, and Côte d'Ivoire.</p>
            
            <p>Through my ongoing research and DH projects, I continue to explore new approaches to understanding the dynamics of Muslim societies in Francophone West Africa, combining traditional historical methods with innovative computational techniques.</p>
        
            <div class="action-buttons">
                <a href="/files/cv.pdf" class="btn btn-primary">Download CV</a>
                <a href="/contact" class="btn btn-secondary">Contact Me</a>
            </div>
        </div>
        
        <div class="sidebar">
            <LatestActivities limit={3} />
        </div>
    </div>
</div>

<style>
    .profile-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }
    
    .profile-header {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-8);
        padding-bottom: var(--spacing-6);
        border-bottom: 1px solid var(--color-border);
    }
    
    .profile-photo {
        margin-right: var(--spacing-6);
        width: 150px;
        height: 150px;
        flex-shrink: 0;
    }
    
    .profile-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        box-shadow: var(--shadow-md);
    }
    
    .profile-title h1 {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        margin: 0;
        color: var(--color-primary);
    }
    
    .subtitle {
        font-size: var(--font-size-lg);
        color: var(--color-text-secondary);
        margin-top: var(--spacing-2);
    }
    
    .profile-content {
        display: flex;
        flex-direction: column;
    }
    
    .main-content {
        flex: 1;
    }
    
    .main-content p {
        margin-bottom: var(--spacing-4);
        line-height: 1.7;
    }
    
    .sidebar {
        margin-top: var(--spacing-8);
    }
    
    .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-4);
        margin-top: var(--spacing-8);
        margin-bottom: var(--spacing-8);
    }
    
    .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        text-decoration: none;
        border-radius: var(--border-radius-md);
        transition: all 0.2s ease;
    }
    
    .btn-primary {
        background-color: var(--color-primary);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--color-primary-dark);
    }
    
    .btn-secondary {
        background-color: var(--color-gray-200);
        color: var(--color-text);
    }
    
    .btn-secondary:hover {
        background-color: var(--color-gray-300);
    }
    
    .rounded-full {
        border-radius: 9999px;
    }
    
    /* Media queries for responsive layout */
    @media (min-width: 768px) {
        .profile-content {
            flex-direction: row;
            gap: var(--spacing-8);
        }
        
        .main-content {
            flex: 3;
        }
        
        .sidebar {
            flex: 1;
            margin-top: 0;
        }
    }
    
    @media (max-width: 640px) {
        .profile-header {
            flex-direction: column;
            text-align: center;
        }
        
        .profile-photo {
            margin-right: 0;
            margin-bottom: var(--spacing-4);
        }
        
        .action-buttons {
            justify-content: center;
        }
    }
</style>
