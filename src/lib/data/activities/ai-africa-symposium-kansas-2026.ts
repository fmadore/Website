import type { Activity } from '#lib/types/index.ts';
import { formatDisplayDate } from '#lib/utils/date-formatter.ts';

export const aiAfricaSymposiumKansas2026: Activity = {
	id: 'ai-africa-symposium-kansas-2026',
	title: 'Panel on African history at the AI and Africa Symposium',
	dateISO: '2026-09-16',
	date: formatDisplayDate('2026-09-16'),
	year: 2026,
	description:
		'Taking part in Panel I: African History at the University of Kansas AI and Africa Symposium, held on Zoom on 17 September 2026.',
	content: `
        <p>Glad to be taking part in the <a href="/communications/ai-africa-symposium-kansas-2026">panel on African history</a> at the <a href="https://calendar.ku.edu/event/ai-and-africa-symposium" target="_blank" rel="noopener noreferrer">AI and Africa Symposium</a>, with a great line-up of panellists.</p>

        <p>Building upon the 2026 Connecting Codes Conference in Nairobi and previous African DH symposia, this virtual event features panels dedicated to African history and literature. Speakers will examine how AI systems and discourses shape scholarly production, emphasizing the contributions of active developers, writers, and scholars in the field. The discussions will highlight how AI methodologies and tools invigorate digital humanities research within African studies, reinforcing a commitment to critical and postcolonial approaches to digital technologies at the University of Kansas.</p>

        <p>17 September, on Zoom. Looking forward to the discussion!</p>
    `,
	tags: [
		'Artificial Intelligence',
		'Digital Humanities',
		'African Studies',
		'African History',
		'African Literature',
		'Archives'
	],
	type: 'lecture',
	panelType: 'lecture',
	url: 'https://calendar.ku.edu/event/ai-and-africa-symposium',
	image: 'images/communications/ai-africa-symposium-kansas-2026.webp',
	heroImage: {
		src: 'images/communications/ai-africa-symposium-kansas-2026-hero.webp',
		alt: "Flyer for the AI and Africa Symposium (Zoom, 17 September 2026, 10am to 1pm), run by AAAS | KASC and African Digital Humanities at the University of Kansas, with portraits of the two panels' speakers and moderators."
	}
};

export default aiAfricaSymposiumKansas2026;
