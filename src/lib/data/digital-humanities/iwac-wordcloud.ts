import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacWordcloud: DigitalHumanitiesProject = {
    id: "iwac-wordcloud",
    title: "IWAC Newspaper Word Cloud",
    years: "2025",
    shortDescription: "Interactive word cloud visualising the most frequent words in newspaper articles from the Islam West Africa Collection.",
    description: "<p>This interactive word cloud visualises the most frequently used words in newspaper articles from the <a href=\"https://islam.zmo.de/s/westafrica/page/home\" target=\"_blank\" rel=\"noopener noreferrer\"><em>Islam West Africa Collection</em></a> (IWAC), excluding Islamic publications. It provides an insight into the dominant themes in Benin, Burkina Faso, Côte d'Ivoire, and Togo. Users can toggle between countries to explore national differences, with word sizes reflecting their frequency in the articles. Hover over words to see exact frequency counts.</p>",
    imageUrl: `/images/digital-humanities/iwac-wordcloud.webp`,
    skills: ["D3.js", "Python", "NLTK", "spaCy"],
    iframes: [
        {
            id: "iwac-wordcloud-embed",
            // title: "IWAC Wordcloud Visualization", // Title can be displayed by the page component if needed
            src: "https://fmadore.github.io/IWAC-wordcloud/",
            // description: "Explore the interactive word cloud.",
            aspectRatio: "4-3", // Or a specific class like 'iframe-container-aspect-4-3' in containerClass
            containerClass: "iframe-container-aspect iframe-container-aspect-4-3", // Example
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: false
        }
    ]
}; 