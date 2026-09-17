import type { Communication } from '$lib/types/communication';

// Talk: invited panellist, AI and Africa Symposium, University of Kansas (African Digital Humanities / AAAS-KASC)
export const talkAiAfricaSymposiumKansas2026: Communication = {
	id: 'ai-africa-symposium-kansas-2026',
	title: 'University of Kansas AI and Africa Symposium',
	authors: ['Frédérick Madore'],
	date: '17 September 2026',
	dateISO: '2026-09-17',
	year: 2026,
	conference: 'AI and Africa Symposium',
	panelTitle: 'Panel I: African History',
	location: 'University of Kansas, Lawrence',
	country: 'United States',
	type: 'lecture',
	language: 'English',
	abstract:
		'Building upon our 2026 Connecting Codes Conference in Nairobi and previous African DH symposia, this virtual event features panels dedicated to African history and literature. Speakers will examine how AI systems and discourses shape scholarly production, emphasizing the contributions of active developers, writers, and scholars in the field. The discussions will highlight how AI methodologies and tools invigorate digital humanities research within African studies, reinforcing our commitment to critical and postcolonial approaches to digital technologies at the University of Kansas.',
	tags: [
		'AI',
		'Digital Humanities',
		'African Studies',
		'African History',
		'African Literature',
		'Archives'
	],
	slidesUrl: 'https://slides.frederickmadore.com/talks/2026-09-17-kansas-ai-and-the-work-of/',
	url: 'https://calendar.ku.edu/event/ai-and-africa-symposium',
	urlLabel: 'Event Website',
	image: 'images/communications/ai-africa-symposium-kansas-2026.webp',
	heroImage: {
		src: 'images/communications/ai-africa-symposium-kansas-2026-hero.webp',
		alt: 'Flyer for the AI and Africa Symposium, held on Zoom on 17 September 2026 from 10am to 1pm, organised by AAAS | KASC and African Digital Humanities at the University of Kansas. Panel I: African History with Frédérick Madore, Karen Ijumba and Fu’ad Lawal, moderated by Dr. Rahina Muazu. Panel II: African Writers Discuss AI with Mubanga Kalimamukwento, Ukamaka Olisakwe and Munyao Kilolo, moderated by Dr. Martha Ndakalako.'
	},
	coordinates: {
		latitude: 38.9543,
		longitude: -95.2558
	},
	participants: [
		{
			name: 'Rahina Muazu',
			role: 'Moderator, Panel I: African History'
		},
		{
			name: 'Frédérick Madore',
			role: 'Panellist, Panel I: African History',
			affiliation: 'University of Bayreuth'
		},
		{
			name: 'Karen Ijumba',
			role: 'Panellist, Panel I: African History',
			affiliation: 'Open Restitution'
		},
		{
			name: 'Fu’ad Lawal',
			role: 'Panellist, Panel I: African History',
			affiliation: 'Founder, Archivi.ng'
		},
		{
			name: 'Martha Ndakalako',
			role: 'Moderator, Panel II: African Writers Discuss AI'
		},
		{
			name: 'Mubanga Kalimamukwento',
			role: 'Panellist, Panel II: African Writers Discuss AI',
			affiliation: 'Author of The Shipikisha Club'
		},
		{
			name: 'Ukamaka Olisakwe',
			role: 'Panellist, Panel II: African Writers Discuss AI',
			affiliation: 'Author of Don’t Answer When They Call Your Name'
		},
		{
			name: 'Munyao Kilolo',
			role: 'Panellist, Panel II: African Writers Discuss AI',
			affiliation: 'Translator and Editor at Ituĩka'
		}
	],
	project: 'Digital Humanities and AI in African Studies'
};

export default talkAiAfricaSymposiumKansas2026;
