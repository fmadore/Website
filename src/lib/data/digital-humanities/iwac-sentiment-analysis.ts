import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacSentimentAnalysis: DigitalHumanitiesProject = {
    id: "iwac-sentiment-analysis",
    title: "IWAC Sentiment Analysis",
    years: "2025",
    shortDescription: "This interactive visualisation presents a sentiment analysis concerning the representation of Islam and Muslims in articles from the Islam West Africa Collection.",
    description: "<p>This visualization presents an analysis of sentiments regarding the representation of Islam and Muslims in Francophone West African media articles. You can explore the live project <a href=\"https://fmadore.github.io/IWAC-sentiment-analysis/\" target=\"_blank\" rel=\"noopener noreferrer\">here</a>. This project is based on the data from the IWAC database and provides insights into how sentiments are expressed in relation to Islam and Muslims within these articles.</p>",
    imageUrl: "/images/digital-humanities/iwac-sentiment-analysis.webp",
    order: 4,
    skills: ["Svelte", "Data Visualisation", "ECharts", "Vite", "Tailwind CSS", "TypeScript"],
    embeddableContent: [
        {
            type: 'iframe',
            id: "iwac-sentiment-analysis-embed",
            src: "https://fmadore.github.io/IWAC-sentiment-analysis/",
            title: "IWAC Sentiment Analysis",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        }
    ]
}; 