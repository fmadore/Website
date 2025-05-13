import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const muslimUmbrellaOrganizations: DigitalHumanitiesProject = {
    id: "muslim-umbrella-organizations",
    title: "Muslim Umbrella Organisations in IWAC",
    years: "2025",
    shortDescription: "Co-occurrence matrix and topic modeling analysis of newspaper articles discussing Muslim umbrella organisations within the Islam West Africa Collection.",
    description: "<p>This project examines the representation of Muslim umbrella organisations in West African newspaper archives sourced from the <em>Islam West Africa Collection (IWAC)</em>. Using computational text analysis techniques, we explore patterns and themes associated with these organisations.</p>",
    imageUrl: `/images/digital-humanities/muslim-umbrella.webp`,
    skills: ["D3.js", "Python", "NLTK", "spaCy", "scikit-learn"],
    iframes: [
        {
            id: "iwac-cooccurrence-matrix-embed",
            src: "https://fmadore.github.io/IWAC-co-occurrence-matrix/index.html",
            title: "Co-occurrence Matrix",
            description: "<p>Visualising co-occurrences of words in articles discussing these organisations.</p>",
            scrolling: "yes", // Explicitly set based on common usage for dashboards
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        },
        {
            id: "iwac-topic-modelling-embed",
            src: "https://fmadore.github.io/IWAC-topic-modelling/",
            title: "Topic Modeling",
            description: "<p>Identifying latent topics and themes within the articles discussing these organisations.</p>",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        }
    ]
}; 