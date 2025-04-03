<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';

    const guestLecturesByInstitution = {
        "Universität Bayreuth": [
            { title: "Islam and Muslims in West Africa", course: "Religion in/from Africa", level: "graduate", date: "31 May 2022" }
        ],
        "University of Florida": [
            { title: "Colonial Surveillance in French West Africa in the Interwar Period", course: "Politics, Identity and Violence in Africa", level: "undergraduate", date: "11 September 2020" },
            { title: "Islam and Muslim Societies in Francophone West Africa", course: "Religions of Africa", level: "undergraduate", date: "5 September 2019" }
        ],
        "Université Laval": [
            { title: "Outils technologiques pour la recherche en histoire", course: "Recherche et rédaction [Research and Writing]", level: "undergraduate", date: "16 February 2018" },
            { title: "La recherche historique en Afrique de l'Ouest: enjeux et défis", course: "Les sciences historiques aujourd'hui [Historical Sciences Today]", level: "undergraduate", date: "5 February 2018" },
            { title: "Religions et enjeux de pouvoir", course: "Afrique subsaharienne: diversité culturelle et mondialisation [Sub-Saharan Africa: Cultural Diversity and Globalization]", level: "undergraduate", date: "3 April 2017" },
            { title: "Sociétés, religion et politique", course: "Politique et société en Afrique [Politics and Society in Africa]", level: "graduate", date: "28 February 2017" },
            { title: "Outils technologiques pour la recherche doctorale", course: "Projet de thèse [Dissertation Project]", level: "graduate", date: "13 January 2017; 1 February 2016" }
        ]
    };

</script>

<SEO title="Guest Lectures | Frédérick Madore" description="List of guest lectures delivered by Frédérick Madore." />

<div class="guest-lectures-container">
	<PageHeader title="Guest Lectures" />

    {#each Object.entries(guestLecturesByInstitution) as [institution, lectures] (institution)}
        <section class="institution-section">
            <h2>{institution}</h2>
            <ul class="lectures-list">
                {#each lectures as lecture (lecture.title + lecture.date)} 
                    <li class="lecture-item">
                        <p class="lecture-title"><strong>{lecture.title}</strong></p>
                        <p class="lecture-details">
                            In course: <em>{lecture.course}</em> ({lecture.level})<br>
                            Date: {lecture.date}
                        </p>
                    </li>
                {/each}
            </ul>
        </section>
    {/each}
</div>

<style>
    .guest-lectures-container {
        max-width: 900px; /* Adjust width as needed */
        margin: 0 auto;
        padding: var(--spacing-4) var(--spacing-4) var(--spacing-10); /* Add bottom padding */
    }

    .institution-section {
        margin-bottom: var(--spacing-8);
    }

    h2 {
        font-size: var(--font-size-2xl);
        color: var(--color-primary-dark);
        margin-bottom: var(--spacing-4);
        border-bottom: 1px solid var(--color-gray-300);
        padding-bottom: var(--spacing-1);
    }

    .lectures-list {
        list-style: none;
        padding-left: 0; /* Remove default padding */
    }

    .lecture-item {
        margin-bottom: var(--spacing-6);
        padding-left: var(--spacing-4); /* Indent content slightly */
        border-left: 3px solid var(--color-primary-light);
        background-color: var(--color-background-secondary, #f9f9f9); /* Subtle background */
        padding: var(--spacing-4);
        border-radius: var(--border-radius);
    }

    .lecture-title {
        font-size: var(--font-size-lg);
        margin-bottom: var(--spacing-1);
        color: var(--color-text);
    }

    .lecture-details {
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: 0;
    }

    .lecture-details em {
        font-style: italic;
    }

</style> 