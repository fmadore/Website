import type { Activity } from '\$lib/types';
import { formatDisplayDate } from '\$lib/utils/date-formatter';
import { base } from '$app/paths'; // Import base path

export const activity: Activity = {
	id: 'tracing-islamic-knowledge-production',
	title:
		'Tracing Islamic Knowledge Production in Francophone West African Newspapers (1990-Present)',
	dateISO: '2024-12-02',
	date: formatDisplayDate('2024-12-02'),
	year: 2024,
	description:
		'Presented findings on Islamic knowledge production in Francophone West Africa at the ZMO workshop "Perspectives in Motion: Conceptual Fields from the Global South". Examined how Muslim intellectuals navigate multiple epistemologies using a corpus of 1,500 Islamic periodicals.',
	content: `
        <p>At the workshop “Perspectives in Motion: Conceptual Fields from the Global South” hosted by ZMO, I presented findings from my research on Islamic knowledge production in Francophone West Africa. Drawing on a corpus of 1,500 Islamic periodicals from Benin, Burkina Faso, Côte d'Ivoire and Togo, my presentation <a href="${base}/communications/tracing-islamic-knowledge-production">“Tracing Islamic Knowledge Production in Francophone West African Newspapers (1990-Present)”</a> examined how Western-educated Muslim intellectuals navigate multiple epistemological traditions to create new theoretical frameworks.</p>
    `,
	tags: ['Workshop', 'Digital Humanities', "Côte d'Ivoire"],
	image: '',
	panelType: 'workshop',
	heroImage: {
		src: 'images/activities/tracing-islamic-knowledge-production.webp',
		alt: "Bar chart of 204 articles mentioning intégrisme by country and year (1979-2019), peaking in Côte d'Ivoire in the early 1990s.",
		caption: ''
	},
	pdfPath: 'files/perspectives-in-motion-programme.pdf',
	pdfTitle: 'Workshop programme'
};
