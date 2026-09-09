import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'for-whom-for-what-purpose-publication-2026',
	title:
		'New publication: For Whom and For What Purpose? A Position Paper on Digital Humanities and AI in African Studies',
	dateISO: '2026-09-09',
	date: formatDisplayDate('2026-09-09'),
	year: 2026,
	description:
		'Our collective position paper on digital humanities and AI in African Studies is now freely available in the ZMO Programmatic Texts series.',
	content: `
		<p>I’m very happy to share that our position paper, “<a href="https://doi.org/10.58144/20260827-000" target="_blank" rel="noopener noreferrer">For Whom and For What Purpose? A Position Paper on Digital Humanities and AI in African Studies</a>”, is now out in the ZMO Programmatic Texts series!</p>
		<p>It grew out of a workshop that Vincent Hiribarren and I organised in Hanover last February with the generous support of the VolkswagenStiftung.</p>
		<p>We set ourselves a slightly crazy challenge: to write a collective text with 25 authors from different disciplines, backgrounds, and research interests, while making sure everyone had a voice in the final piece.</p>
		<p>We could not be more pleased with the result. We had a wonderful group with a remarkable sense of collective purpose throughout the workshop and the writing process.</p>
		<p>The paper is freely available and we are also working on a French translation.</p>
		<p>We hope it will help shape further discussions about digital humanities and AI in African Studies.</p>
		<p>Many thanks to my co-authors for making this such a rewarding collective experience:</p>
		<p>Agata Błoch, Albrecht Hofheinz, Ashleigh Harris, Augustin Ndione, Britta Frede, Cassandra Mark-Thiesen, Duncan Money, Emmanuel Ngue Um, Érika Melek Delgado, Fallou Ngom, Fu’ad Lawal, Irene Mwendwa, James Yékú, Janeth David Nzenga, Johannes Sibeko, Karen Byera Ijumba, Kólá Túbọ̀sún, Leah Junck, Menno van Zaanen, Nuraddin Aman, Oumou Sidibé, Susan Elizabeth Gagliardi, Thompson Gyedu Kwarkye</p>
	`,
	tags: ['Digital Humanities', 'AI', 'African Studies', 'Publication', 'Volkswagen Foundation'],
	type: 'publication',
	panelType: 'publication',
	url: 'https://doi.org/10.58144/20260827-000',
	image: 'images/publications/for-whom-for-what-purpose-2026.webp',
	heroImage: {
		src: 'images/publications/for-whom-for-what-purpose-2026.webp',
		alt: 'Cover of For Whom and For What Purpose? A Position Paper on Digital Humanities and AI in African Studies, ZMO Programmatic Texts 16'
	}
};
