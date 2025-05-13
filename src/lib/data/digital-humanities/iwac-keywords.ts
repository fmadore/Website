import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacKeywords: DigitalHumanitiesProject = {
    id: "iwac-keywords",
    title: "IWAC Keywords Dashboard",
    years: "2024",
    shortDescription: "Interactive temporal analysis of keywords from West African newspapers in the Islam West Africa Collection, revealing thematic evolution and media attention patterns.",
    description: "<p>This interactive visualization analyzes the chronological evolution of themes in West African press through a time series of key keywords identified in the <em>Islam West Africa Collection</em>. Developed with Shiny for Python, the interface enables multidimensional data exploration by filtering by country, newspaper, category, and time period.</p><p>The main chart reveals underlying trends (such as the gradual emergence of discourse on terrorism after 2001) and peaks in media attention related to specific events. Users can compare up to five themes simultaneously to analyze their temporal correlations or divergences. For example, we can observe how mentions of \"Arab cooperation\" historically preceded those of \"terrorism and radicalization,\" illustrating the evolution of representations of relations between West Africa and the Arab world.</p>",
    imageUrl: `/images/digital-humanities/iwac-keywords.webp`,
    skills: ["Shiny for Python", "Plotly"],
    iframes: [
        {
            id: "iwac-keywords-dashboard-embed",
            src: "https://fmadore.shinyapps.io/iwac_keywords/",
            title: "IWAC Keywords Dashboard",
            scrolling: "yes",
            allowfullscreen: true,
            showTitle: true,
            containerClass: "iframe-container-aspect iframe-container-aspect-16-9"
        }
    ]
}; 