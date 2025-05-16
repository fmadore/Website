import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacOverview: DigitalHumanitiesProject = {
    id: "iwac-overview",
    title: "Islam West Africa Collection Overview",
    years: "2025",
    shortDescription: "Interactive dashboard for exploring the IWAC collection with dynamic visualizations (treemaps, charts, timelines) and filtering capabilities.",
    description: "<p>This interactive data visualisation dashboard allows for dynamic exploration of the <a href=\"https://islam.zmo.de/s/westafrica/page/home\" target=\"_blank\" rel=\"noopener noreferrer\"><em>Islam West Africa Collection</em></a> (IWAC). Developed with Svelte and D3.js, it presents various visualisations (treemaps, bar charts, pie charts, and timelines) to analyse the distribution of collection items based on attributes such as country, language, item type, date, and word count. Users can interact with filters and explore the data dynamically with features like zooming and tooltips.</p>",
    imageUrl: `/images/digital-humanities/iwac-overview.webp`,
    order: 3,
    skills: ["Svelte", "D3.js", "TypeScript", "Vite", "Data visualisation"],
    embeddableContent: [
        {
            type: 'iframe',
            id: "iwac-overview-main-embed",
            src: "https://fmadore.github.io/IWAC-overview/index.html?lang=en&tab=countries",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            // Defaulting to iframe-container for height (600px default, responsive)
            // Alternatives: 
            // containerClass: 'iframe-container-lg', // for 800px height
            // aspectRatio: '16-9', // for 16:9 aspect ratio
            // height: '700px', // for a specific pixel height
            containerClass: 'iframe-container-aspect iframe-container-aspect-16-9' // Let's try 16:9 aspect ratio for this one
        }
    ]
}; 