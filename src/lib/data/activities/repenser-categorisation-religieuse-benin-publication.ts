import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'repenser-categorisation-religieuse-benin-publication',
	title: "Publication of 'Repenser la catégorisation religieuse à partir du Bénin, terre du Vodun'",
	dateISO: '2026-03-10',
	date: formatDisplayDate('2026-03-10'),
	year: 2026,
	description:
		"Publication of the edited volume L'Afrique des religions à l'épreuve des chiffres et des catégorisations, featuring a chapter co-authored with Fiacre Anato on the limits of religious categorisations in Beninese censuses and surveys.",
	content: `
        <p>Delighted to see the publication of the edited volume <a href="https://www.hemisphereseditions.com/l-afrique-des-religions" target="_blank" rel="noopener noreferrer"><em>L'Afrique des religions à l'épreuve des chiffres et des catégorisations</em></a>, directed by Marc-Antoine Pérouse de Montclos, Nathalie Bernard-Maugiron and Aurélien Dasré, to which I contributed a chapter with Fiacre Anato entitled "<a href="/publications/repenser-categorisation-religieuse-benin-2026">Repenser la catégorisation religieuse à partir du Bénin, terre du Vodun</a>".</p>

        <p>Drawing on the Beninese case, our chapter examines the limits of religious categorisations in censuses and demographic surveys. Statistics suggest a steady decline of Vodun since independence in favour of Christianity and Islam, but fieldwork tells a different story: multiple affiliations, circulation between traditions, hybridities that survey categories struggle to capture.</p>

        <p>The interdisciplinary dialogue with the other contributors was particularly enriching, notably with Aurélien Dasré, a demographer, whose expertise shed light on how religious categories are constructed in censuses and Demographic and Health Surveys — data that historians like myself often draw on without sufficiently questioning their limitations.</p>
    `,
	tags: ['Publication', 'Benin', 'Religion', 'West Africa'],
	type: 'publication',
	panelType: 'publication',
	image: 'images/publications/repenser-categorisation-religieuse-benin.webp',
	heroImage: {
		src: 'images/publications/repenser-categorisation-religieuse-benin.webp',
		alt: "Cover of L'Afrique des religions à l'épreuve des chiffres et des catégorisations"
	}
};
