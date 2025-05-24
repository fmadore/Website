import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const ecoleNationaleDesChartesVisit2025: Activity = {
    id: "ecole-nationale-des-chartes-visit-2025",
    title: "Visit to the École nationale des chartes",
    dateISO: "2025-05-22",
    date: formatDisplayDate("2025-05-22"),
    year: 2025,
    description: "Visited École nationale des chartes in Paris on the invitation of Vincent Jolivet.",
    content: `
        <p>On 22 May, I visited the <a href="https://www.chartes.psl.eu/" target="_blank" rel="noopener noreferrer">École nationale des chartes</a> (ENC) in Paris to exchange ideas with colleagues specialising in digital humanities and public outreach. The ENC is a leader in applying computational methods to historical research.</p>
        <p>I presented the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> (IWAC) and demonstrated my AI-augmented data curation workflows, discussing the broader role of machine-assisted scholarship in historical research. In return, ENC colleagues introduced me to the <a href="https://endp.chartes.psl.eu/" target="_blank" rel="noopener noreferrer">e-NDP (Notre-Dame de Paris et son cloître)</a> project and its digital edition platform. They showcased how medieval chapter registers are made accessible through searchable transcriptions, faceted browsing and an interface designed for researchers and the general public alike.</p>
        <p>We spent a long time comparing our respective approaches to AI chatbots: the ENC's prototype, which is based on their <a href="https://theses.chartes.psl.eu/" target="_blank" rel="noopener noreferrer">'position de thèse' corpus</a> and uses Retrieval-Augmented Generation (RAG) architecture; and IWAC's conversational agent, which is in development. Our discussions explored the potential and limitations of generative AI in historical research.</p>
        <p>Special thanks to Vincent Jolivet, Elsa Marguin-Hamon (Director of Research and International Relations), and the ENC staff for a productive visit. I look forward to future collaboration.</p>
    `,
    tags: ["École nationale des chartes", "Paris", "Digital Humanities", "AI", "Computational Methods"],
    heroImage: { 
        src: "images/activities/ecole-nationale-des-chartes.webp", 
        alt: "École nationale des chartes"
    },
    panelType: "event"
};