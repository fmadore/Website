import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

const activityDateISO = '2026-02-16';

export const chartingNewTerritoryWorkshopHannover: Activity = {
	id: 'charting-new-territory-workshop-hannover',
	title: 'Charting New Territory: Digital Humanities and AI in African Studies Workshop, Hannover',
	dateISO: activityDateISO,
	date: formatDisplayDate(activityDateISO),
	year: 2026,
	description:
		'Three-day workshop in Hannover bringing together 25 researchers from 16 countries to explore digital humanities and AI in African Studies, co-organised with Vincent Hiribarren and funded by the VolkswagenStiftung.',
	content: `
		<p><a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a> and I are heading to Hannover this week to welcome 25 researchers from 16 countries for a three-day <a href="https://fmadore.github.io/dh-ai-african-studies-2026/" target="_blank" rel="noopener noreferrer">workshop on digital humanities and AI in African Studies</a>. We have been organising this event since last August.</p>
		<p>Digital humanities have a longer history in African studies than most people realise, but much of this development has occurred in isolation, with few initiatives bringing together scholars from different disciplines and regions. Meanwhile, AI is accelerating the field faster than critical reflection can keep up, and all too often, these conversations take place without African scholars present. We wanted to change that. Our participants include historians, linguists working with African languages, archivists digitising endangered collections, literary and art scholars, researchers specialising in AI governance, and open science practitioners.</p>
		<p>This is not a "traditional" academic conference. No keynotes, no panels. Three workstreams will run through facilitated discussions, covering methods, equitable collaboration, and ethical frameworks. The goal is a co-authored position paper, to be published open-access in the <a href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts" target="_blank" rel="noopener noreferrer">ZMO Programmatic Texts</a> series.</p>
		<p>Thanks to the <a href="https://www.volkswagenstiftung.de/" target="_blank" rel="noopener noreferrer">VolkswagenStiftung</a> for funding and hosting us at the Xplanatorium Herrenhausen, to Anke Harwardt-Feye for her help with logistics, and to our student assistants, Eline Marie Langbo Holm and Calum Houston, for handling a huge amount of organisational work.</p>
		<p>More to come from Hannover this week!</p>
	`,
	heroImage: {
		src: 'images/activities/charting-new-territory-workshop-hannover-hero.webp',
		alt: 'Charting New Territory: Digital Humanities and AI in African Studies Workshop, Hannover',
		caption: ''
	},
	tags: ['Digital Humanities', 'AI', 'African Studies', 'Workshop', 'Volkswagen Foundation'],
	type: 'workshop',
	panelType: 'workshop'
};
