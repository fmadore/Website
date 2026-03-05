import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

const volkswagenStiftungOpenUpKickoff2026: Activity = {
	id: 'volkswagenstiftung-open-up-kickoff-2026',
	title:
		'Presenting "Islam\'s Peripheries" at the VolkswagenStiftung "Open Up" Kick-Off Event',
	dateISO: '2026-03-05',
	date: formatDisplayDate('2026-03-05'),
	year: 2026,
	type: 'presentation',
	description:
		'Aksana Ismailbekova and I presented our project "Islam\'s \'Peripheries\'" at the VolkswagenStiftung "Open Up" kick-off event at Herrenhausen Palace in Hannover.',
	content: `
<p>It was a pleasure being back at Herrenhausen Palace in Hannover. <a href="https://www.zmo.de/en/people/dr-aksana-ismailbekova" target="_blank" rel="noopener noreferrer">Aksana Ismailbekova</a> and I presented our project "<a href="/research/islams-peripheries-dh-ai-west-africa-central-asia">Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia</a>" at the <a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer">VolkswagenStiftung</a> <a href="https://www.volkswagenstiftung.de/en/funding/funding-offer/open-new-research-spaces-humanities-and-cultural-studies" target="_blank" rel="noopener noreferrer">"Open Up"</a> kick-off event.</p>

<p>Over two days, researchers of the funded projects presented their ideas and exchanged feedback. It was fascinating to get to learn about such varied projects, from soundscapes of populism and the historical genealogy of guilty pleasures to paleolithic hominins and environmental peace.</p>

<p>Thank you to the VolkswagenStiftung for actively funding exploratory research where taking risks is valued, not penalised.</p>
`,
	tags: [
		'Volkswagen Foundation',
		'Digital Humanities',
		'AI',
		'West Africa',
		'Central Asia',
		'Islam',
		'IWAC',
		'Presentation',
		'Hannover'
	],
	heroImage: {
		src: 'images/activities/volkswagenstiftung-open-up-kickoff-2026-hero.webp',
		alt: 'Frédérick Madore and Aksana Ismailbekova presenting their project at the VolkswagenStiftung "Open Up" kick-off event at Herrenhausen Palace in Hannover'
	}
};

export default volkswagenStiftungOpenUpKickoff2026;
