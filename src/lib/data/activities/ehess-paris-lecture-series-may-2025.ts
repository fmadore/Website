import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const ehessParisLectureSeries2025: Activity = {
	id: 'ehess-paris-lecture-series-2025',
	title: 'Lecture Series at EHESS, Paris',
	dateISO: '2025-05-12',
	date: formatDisplayDate('2025-05-12'),
	year: 2025,
	description:
		'A series of four public talks at EHESS, Paris, in May 2025, exploring the histories of Islam and religious pluralism in francophone West Africa using digital humanities methods.',
	content: `
        <p>I'm delighted to be spending May in Paris as a professeur invité at the École des Hautes Études en Sciences Sociales (EHESS). My visit - made possible by the kind invitation of Marie Miran (EHESS, IMAF) and Mathieu Terrier (CNRS, LEM, IISMM) - focuses on four public lectures that explore the history of Islam and religious pluralism in francophone West Africa and demonstrate what digital humanities methods add to the historian's toolkit.</p>
        
        <p>The series opens on Monday 12 May with "Questions d'islam en Afrique de l'Ouest : enjeux et défis de la recherche avec les archives physiques et numériques", a methodological reflection on working with fragmented post-colonial records and born-digital sources.</p>
        
        <p>The following week, on Tuesday 20 May, I will present 'L'histoire des communautés musulmans ouest-africaines : approches numériques', demonstrating how the Islam West Africa Collection supports distant reading and network visualisations of 65 years of media coverage.</p>
        
        <p>On Wednesday 21 May, the lecture "Rencontre entre chrétiens et musulmans : au-delà du binaire coexistence pacifique/conflits religieux" revisits religious pluralism in Togo, Benin, Côte d'Ivoire and Burkina Faso.</p>
        
        <p>The cycle concludes on Wednesday 28 May with "Militantisme religieux sur les campus universitaires. Le cas du Bénin et du Togo", which traces how Christian and Muslim student associations have reshaped university life since 1970.</p>
    `,
	tags: [
		'EHESS',
		'Paris',
		'Francophone West Africa',
		'Islam',
		'Religious Pluralism',
		'Digital Humanities',
		'History'
	],
	image: 'images/communications/EHESS-2025.webp',
	heroImage: {
		src: 'images/communications/EHESS-2025-hero.webp',
		alt: "Promotional flyer for Frédérick Madore's May 2025 lecture series at EHESS, Paris, featuring talks on Islam in West Africa, digital humanities, religious coexistence, and student activism."
	},
	pdfPath: 'files/prog-professeurs-invites_2024-2025_madore.pdf',
	pdfTitle: 'Flyer',
	panelType: 'lecture'
};
