import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const islamsPeripheriesErlangenSeminar2026: Activity = {
	id: 'islams-peripheries-erlangen-seminar-2026',
	title:
		'Presenting "Islam\'s Peripheries" in the "Digital History in/of Central Asia and the South Caucasus" Seminar',
	dateISO: '2026-06-29',
	date: formatDisplayDate('2026-06-29'),
	year: 2026,
	type: 'lecture',
	description:
		'Aksana Ismailbekova and I introduced our VolkswagenStiftung-funded project on AI and Islamic archives in West Africa and Central Asia in the "Digital History in/of Central Asia and the South Caucasus" seminar series at Friedrich-Alexander-Universität Erlangen-Nürnberg.',
	content: `
<p>Today I had the pleasure of presenting our project "<a href="/research/islams-peripheries-dh-ai-west-africa-central-asia">Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia</a>" with <a href="https://www.zmo.de/en/people/dr-aksana-ismailbekova" target="_blank" rel="noopener noreferrer">Aksana Ismailbekova</a> in the <a href="https://www.osteuropa.phil.fau.de/digital-history-seminars/" target="_blank" rel="noopener noreferrer">"Digital History in/of Central Asia and the South Caucasus"</a> seminar series at Friedrich-Alexander-Universität Erlangen-Nürnberg.</p>

<p>The talk introduced our upcoming <a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer">VolkswagenStiftung</a>-funded project, which uses AI to unlock two unique multilingual collections held at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a>: the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> (14,500+ items from six West African countries, 1960s to the present) and the <a href="https://www.zmo.de/en/library/special-collection-1/translate-to-english-reinhard-eisener-bestand" target="_blank" rel="noopener noreferrer"><em>Reinhard Eisener Collection</em></a> (1,546 documents on the Emirate of Bukhara, early Soviet governance, and the Tajik civil war).</p>

<p>In Islamic studies, sub-Saharan Africa and Central Asia are often treated as marginal. Bringing these two "peripheries" into the same frame, we asked what AI-driven workflows make possible across roughly 16,000 documents in more than ten languages and scripts: multimodal large language models for text extraction and named entity recognition, a cross-regional chatbot for semantic queries, and open, replicable pipelines with human-in-the-loop validation.</p>

<p>My <a href="https://slides.frederickmadore.com/talks/2026-06-29-erlangen-islam-peripheries/" target="_blank" rel="noopener noreferrer">slides are available online</a>.</p>
	`,
	tags: [
		'Volkswagen Foundation',
		'Digital Humanities',
		'AI',
		'Large Language Models',
		'IWAC',
		'Islam',
		'West Africa',
		'Central Asia',
		'Archives',
		'Erlangen'
	],
	url: 'https://www.osteuropa.phil.fau.de/digital-history-seminars/',
	urlLabel: 'Seminar Series Website',
	additionalUrls: [
		{
			label: 'Presentation Slides',
			url: 'https://slides.frederickmadore.com/talks/2026-06-29-erlangen-islam-peripheries/'
		}
	],
	image: 'images/communications/islam-peripheries-dh-ai-west-africa-central-asia-2026.webp',
	heroImage: {
		src: 'images/communications/islam-peripheries-dh-ai-west-africa-central-asia-2026-hero.webp',
		alt: "Poster for the seminar series “Digital History in/of Central Asia and the South Caucasus,” advertising the talk “Islam's ‘Peripheries’: Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia” by Dr. Aksana Ismailbekova (Leibniz-Zentrum Moderner Orient, Berlin) and Dr. Frédérick Madore (University of Bayreuth) on 29 June at 14:00 CET. Portraits of the two speakers appear on the right, with the Max Weber Stiftung and Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU) logos along the top.",
		caption:
			'Poster for the talk in the “Digital History in/of Central Asia and the South Caucasus” seminar series at Friedrich-Alexander-Universität Erlangen-Nürnberg.'
	},
	panelType: 'lecture'
};
