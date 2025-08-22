import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Activity: When AI Meets the Archive - SADiLaR Digital Humanities Colloquium Talk
export const whenAIMeetsTheArchiveSadilar2025: Activity = {
	id: 'when-ai-meets-the-archive-sadilar-2025',
	title: 'When AI Meets the Archive: Transforming the Islam West Africa Collection with Large Language Models',
	dateISO: '2025-08-20',
	date: formatDisplayDate('2025-08-20'),
	year: 2025,
	description: 'Invited lecture at the SADiLaR Digital Humanities colloquia exploring how large language models can transform vast archival collections into more navigable resources.',
	content: `
        <p>I was invited to give a presentation at the SADiLaR Digital Humanities Colloquium, where I discussed how artificial intelligence could transform archival research. My presentation focused on the Islam West Africa Collection (IWAC), comprising over 14,000 documents from six countries containing 25 million words.</p>
        
        <p>The presentation showcased three practical applications of large language models. These included enhancing the accuracy of optical character recognition (OCR) and entity recognition for African materials, conducting experimental sentiment analysis across over 10,000 newspaper articles examining the representation of Islam, and developing a conversational AI chatbot that transcends traditional keyword-based search methodologies.</p>
        
        <p>Drawing on my experience of working on the IWAC, I presented practical solutions for managing digital abundance, emphasising the importance of maintaining a critical awareness of the inherent limitations of AI technologies. The talk emphasised the transformative potential of AI technologies when applied to historical materials, as well as the necessary cautions.</p>
            `,
	tags: ['Digital Humanities', 'AI', 'IWAC', 'Large Language Models'],
	url: 'https://sadilar.org/en/dh-colloquium/',
	additionalUrls: [
		{ label: 'Video Recording', url: 'https://youtu.be/OhbPYA4_URo' }
	],
	image: 'images/communications/SADILAR.webp',
	heroImage: {
		src: 'images/communications/SADILAR-hero.webp',
		alt: 'Poster for the SADiLaR DH Colloquium on 20 August 2025 at 10:00 SAST. Title reads: "When AI Meets the Archive: Transforming the Islam West Africa Collection with Large Language Models." Speaker: Frédérick Madore. The right side features a digital illustration of binary code with document icons connected by lines and a large magnifying glass.'},
	type: 'lecture'
};
