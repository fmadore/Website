import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'charting-new-territory-blogpost-2026',
	title: 'Blog post: Charting New Territory – Digital Humanities and AI in African Studies',
	dateISO: '2026-03-31',
	date: formatDisplayDate('2026-03-31'),
	year: 2026,
	description:
		'Blog post co-authored with Vincent Hiribarren for Digital History Bielefeld, reflecting on the Hannover workshop on Digital Humanities and AI in African Studies.',
	content: `
		<p><a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a> and I published a blog post on <a href="https://digihistbie.hypotheses.org/1117" target="_blank" rel="noopener noreferrer">Digital History Bielefeld</a> reflecting on our workshop "<a href="https://fmadore.github.io/dh-ai-african-studies-2026/" target="_blank" rel="noopener noreferrer">Charting New Territory: Digital Humanities and AI in African Studies</a>," held in February 2026 at Schloss Herrenhausen in Hannover.</p>

		<p>The post recounts how 26 researchers from 16 countries spent three days working in thematic groups on language technologies, archives, infrastructure, and epistemologies, with no traditional presentations. Instead, the workshop combined plenary sessions, poster presentations, World Café rounds, and collaborative writing. By the end of the second day, the group was already drafting a co-authored position paper together.</p>

		<p>We discuss the key themes that emerged across all groups: data colonialism and extractivism, the tension between open access and data sovereignty, minimal computing as a deliberate methodological choice, and the persistent question of who digital humanities work ultimately serves. The post also addresses the practical obstacles of organising such events, including European visa procedures and the anglophone dominance of the field, which limits participation from francophone Africa.</p>

		<p>Looking ahead, the position paper will appear in the <a href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts" target="_blank" rel="noopener noreferrer">ZMO Programmatic Texts</a> series. A <a href="https://fmadore.github.io/stias-dh-ai-workshop-2026/" target="_blank" rel="noopener noreferrer">second workshop</a>, funded by the DFG Point Sud programme, is planned for September 2026 at the Stellenbosch Institute for Advanced Study (STIAS) in South Africa.</p>
	`,
	tags: [
		'Digital Humanities',
		'Artificial Intelligence',
		'African Studies',
		'Workshop',
		'Blog Post',
		'VolkswagenStiftung'
	],
	type: 'publication',
	panelType: 'publication',
	url: 'https://digihistbie.hypotheses.org/1117',
	image: 'images/publications/digital-history-bielefeld.webp',
	heroImage: {
		src: 'images/publications/digital-history-bielefeld-hero.webp',
		alt: 'Screenshot of the blog post on Digital History Bielefeld'
	}
};
