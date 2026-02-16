import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
    id: 'religious-activism-campuses-review-fall-2025',
    title: "Macodou Fall's review of 'Religious Activism on Campuses in Togo and Benin'",
    dateISO: '2026-01-14',
    date: formatDisplayDate('2026-01-14'),
    year: 2026,
    description:
        "Grateful that my book Religious Activism on Campuses in Togo and Benin has been reviewed by Macodou Fall in Research Africa Reviews.",
    content: `
        <p>Grateful that my book <a href="https://doi.org/10.1515/9783111428895" target="_blank" rel="noreferrer noopener"><em>Religious Activism on Campuses in Togo and Benin</em></a> has been reviewed by Macodou Fall in the latest issue of <a href="https://researchafrica.duke.edu/sites/default/files/-5-7-Religious-Activism-on-Campuses-in-Togo-and-Benin-Issue3-2025.pdf" target="_blank" rel="noreferrer noopener"><em>Research Africa Reviews</em></a>.</p>
        
        <p>I appreciate him taking the time to engage with the text. He offers thoughtful, constructive criticism regarding the "pivot from piety to pragmatism," suggesting that a deeper theological exploration of the "social curriculum" could enrich the analysis.</p>
        
        <p>He points out that the movements' economic survival could be considered a "moral and religious mandate for communal activism," rather than merely a response to state failure.</p>
        
        <p>Here's an excerpt:</p>
        
        <blockquote>
        <p>"These nuances, however, do not detract from the book's contribution, which is considerable; this is due to its comprehensive analysis of the history and development of faith-based movements in Togo and Benin from 1970 to 2023. The book offers a valuable resource for scholars seeking to understand the complex interplay between faith, activism, and adaptation in Francophone Africa."</p>
        </blockquote>
        
        <p>Fall, Macodou. "Frédérick Madore, Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023. Berlin: De Gruyter, 2023. 308 Pages. ISBN: 978-3-11-142790-4." <em>Research Africa Reviews</em> 9, no. 3 (2025): 15–17.</p>
    `,
    tags: ['Book Review', 'Religious Activism', 'Togo', 'Benin', 'Publication', 'Islam', 'West Africa'],
    panelType: 'publication',
    heroImage: {
        src: 'images/activities/research-africa-reviews-hero.webp',
        alt: 'Screenshot of Research Africa Reviews journal website showing Volume 9, Issue 3 - December 2025'
    },
    type: 'publication',
    url: 'https://researchafrica.duke.edu/sites/default/files/-5-7-Religious-Activism-on-Campuses-in-Togo-and-Benin-Issue3-2025.pdf'
};
