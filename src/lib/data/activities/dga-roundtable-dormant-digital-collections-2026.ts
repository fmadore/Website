import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const dgaRoundtableDormantDigitalCollections2026: Activity = {
	id: 'dga-roundtable-dormant-digital-collections-2026',
	title:
		'Dormant Digital Collections, AI Triage: Lessons from the Islam West Africa Collection and Beyond',
	dateISO: '2026-05-06',
	date: formatDisplayDate('2026-05-06'),
	year: 2026,
	description:
		"Invited talk for the Deutsche Gesellschaft für Asienforschung (DGA) roundtable on Digital Humanities and AI in regional studies, exploring how AI can turn scholars' dormant scan collections into active research instruments.",
	content: `
        <p>Very glad to give a talk for the <a href="https://asienforschung.de/" target="_blank" rel="noopener noreferrer">Deutsche Gesellschaft für Asienforschung</a> (DGA) later today on "Dormant Digital Collections, AI Triage: Lessons from the Islam West Africa Collection and Beyond." The lecture is part of the DGA roundtable series on Digital Humanities and Artificial Intelligence in regional studies, hosted at the <a href="https://www.zmo.de/" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient</a> in Berlin and online via Zoom, with Dr Max Kramer moderating.</p>

        <p>Where Arlette Farge located the "allure" of the archive in the slow, tactile encounter with the document, AI can offer a pragmatic complement: rapid triage of the ever-growing personal collections of scans that scholars accumulate. This talk is an invitation to experiment, turning dormant digital collections into active research instruments.</p>

        <p>More details and the Zoom link are available on the <a href="https://asienforschung.de/events/roundtable-2-digital-humanities-und-kuenstliche-intelligenz-in-den-regionalwissenschaften/" target="_blank" rel="noopener noreferrer">DGA event page</a>.</p>
    `,
	tags: [
		'Digital Humanities',
		'AI',
		'IWAC',
		'Talk',
		'DGA',
		'ZMO',
		'Archives',
		'West Africa',
		'Islam'
	],
	url: 'https://asienforschung.de/events/roundtable-2-digital-humanities-und-kuenstliche-intelligenz-in-den-regionalwissenschaften/',
	type: 'lecture',
	panelType: 'lecture',
	heroImage: {
		src: 'images/activities/dga-roundtable-2026-hero.webp',
		alt: 'Poster for the DGA-Roundtable on Digital Humanities and Artificial Intelligence in regional studies, 6 May 2026 at 17:30, hosted at ZMO Berlin and online via Zoom. Speaker: Dr. Frédérick Madore. Moderation: Dr. Max Kramer.'
	}
};
