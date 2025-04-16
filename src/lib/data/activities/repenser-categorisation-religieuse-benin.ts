import type { Activity } from '\$lib/types';
import { formatDisplayDate } from '\$lib/utils/date-formatter';

export const activity: Activity = {
    id: "repenser-categorisation-religieuse-benin",
    title: "Repenser la catégorisation religieuse à partir du Bénin, terre du vodun",
    dateISO: "2024-12-05",
    date: formatDisplayDate("2024-12-05"),
    year: 2024,
    description: "Presented a paper with Fiacre Anato at the workshop L'Afrique des religions à l'épreuve des chiffres et des catégorisations at the Université Paris Cité. Examined religious categorisation dynamics in Benin, highlighting the tension between Vodun's statistical decline and its cultural vitality.",
    content: `
        <p>On 5 December, I presented a paper with Fiacre Anato entitled "Repenser la catégorisation religieuse à partir du Bénin, terre du vodun" at the workshop <em>L'Afrique des religions à l'épreuve des chiffres et des catégorisations</em> at the Université Paris Cité.</p>
        
        <p>Our research examined the dynamics of religious categorisation in contemporary Benin, where official statistics suggest a decline in Vodun practices, while field observations reveal its continued vitality through widespread dual religious affiliation.</p>
        
        <p>We analysed how recent state-led promotion of Vodun through initiatives such as "Vodun Days" highlights the tensions between statistical marginalisation and cultural valorisation.</p>

        <p>The paper shows how Benin's religious landscape challenges conventional categorisations, with many people navigating fluidly between different religious traditions, despite official statistics enforcing single religious affiliations.</p>
        
        <p>This work contributes to broader discussions on religious measurement and categorisation in Africa, while highlighting the limitations of current quantitative approaches in capturing complex religious realities.</p>
    `,
    tags: ["Workshop", "Benin"],
    panelType: "workshop",
}; 