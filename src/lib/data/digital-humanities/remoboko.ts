import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const remoboko: DigitalHumanitiesProject = {
    id: "remoboko",
    title: "Remoboko: Religion, Morality and Boko in West Africa",
    years: "2024",
    shortDescription: "Research group exploring religion, morality, and student life in West African higher education. Includes interactive visualizations.",
    description: "<p><em>Remoboko</em> is a research group focused on exploring the intersections of religion, morality, and student life (particularly the concept of \"boko\" - Western education) in the context of West African higher education. This page presents interactive visualizations I generated based on the research group\'s work, aiming to make its findings more accessible and engaging for a wider audience.</p>",
    imageUrl: `/images/digital-humanities/remoboko.webp`,
    order: 8,
    skills: ["Data Visualization", "pandas", "Plotly", "Python", "Folium", "NLTK"],
    embeddableContent: [
        {
            type: 'iframe',
            id: "remoboko-poi-map",
            src: "https://fmadore.github.io/Remoboko/Book_DeGruyter/Maps/points_of_interest.html",
            title: "Points of Interest Map",
            description: "<p>Interactive map showing the main locations mentioned in my recent book <a href='/publications/religious-activism-campuses' target='_blank' rel='noopener noreferrer'>Religious Activism on University Campuses in West Africa</a>.</p>",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        },
        {
            type: 'image',
            id: "remoboko-collaborators-gender-chart",
            src: "https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/collaborators_gender.png",
            alt: "Chart showing gender distribution of Remoboko collaborators",
            title: "Collaborators by Gender",
            showTitle: true,
            containerClass: "image-embed-container"
        },
        {
            type: 'iframe',
            id: "remoboko-collaborators-country",
            src: "https://fmadore.github.io/Remoboko/Final%20report/collaborators_by_country.html",
            title: "Collaborators by Country",
            description: "<p>Geographical distribution of the 93 Remoboko research group collaborators across 24 different countries.</p>",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        },
        {
            type: 'iframe',
            id: "remoboko-collaborators-map",
            src: "https://fmadore.github.io/Remoboko/Final%20report/collaborators_map.html",
            title: "Collaborators Affiliations Map",
            description: "<p>Map displaying the institutional affiliations of Remoboko research group collaborators.</p>",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        },
        {
            type: 'iframe',
            id: "remoboko-activities-time",
            src: "https://fmadore.github.io/Remoboko/Final%20report/activities_type_over_time.html",
            title: "Remoboko Publications and Activities Over Time",
            description: "<p>This stacked bar chart illustrates the evolution of Remoboko's scientific publications and activities from 2018 to 2024. It categorises publications and activities by type, showing the diverse contributions of members and collaborators across different formats each year.</p>",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        },
        {
            type: 'image',
            id: "remoboko-wordcloud-en",
            src: "https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/WordClouds/english_wordcloud.png",
            alt: "Word cloud of English terms related to Remoboko research",
            title: "Word Clouds",
            description: "<p>These word clouds provide an insight into the work of the Remoboko research group, derived from the available abstracts of all publications and activities of members and collaborators. Presented in French and English, they highlight the most common terms and provide a visual summary of the key themes and concepts that define our research.</p>",
            showTitle: true,
            containerClass: "image-embed-container"
        },
        {
            type: 'image',
            id: "remoboko-wordcloud-fr",
            src: "https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/WordClouds/french_wordcloud.png",
            alt: "Nuage de mots des termes français liés à la recherche Remoboko",
            showTitle: true,
            containerClass: "image-embed-container"
        }
    ]
}; 