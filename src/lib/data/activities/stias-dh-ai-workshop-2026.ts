import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

const activityDateISO = '2026-09-18';

export const stiasDhAiWorkshop2026: Activity = {
	id: 'stias-dh-ai-workshop-2026',
	title: 'Heading to Stellenbosch for the workshop on digital humanities and AI in African studies',
	dateISO: activityDateISO,
	date: formatDisplayDate(activityDateISO),
	year: 2026,
	description:
		'The workshop "Digital Humanities and Artificial Intelligence in African Studies: Towards Sustainable and Equitable Practices" runs at the Stellenbosch Institute for Advanced Study from 21 to 24 September 2026. Presentations are streamed live on Teams with simultaneous French–English translation.',
	content: `
		<p>I'm excited to be heading to South Africa for the workshop <a href="/communications/stias-dh-ai-african-studies-workshop-2026">"Digital Humanities and Artificial Intelligence in African Studies: Towards Sustainable and Equitable Practices"</a>, taking place at the <a href="https://stias.ac.za/" target="_blank" rel="noopener noreferrer">Stellenbosch Institute for Advanced Study</a> from 21 to 24 September. I'm co-organising it with Emmanuel Ngué Um, <a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a>, and <a href="https://menno.abstractcow.com/" target="_blank" rel="noopener noreferrer">Menno van Zaanen</a>, with generous funding from the <a href="https://www.dfg.de/en" target="_blank" rel="noopener noreferrer">DFG</a>’s <a href="https://pointsud.org/" target="_blank" rel="noopener noreferrer">Point Sud</a> programme.</p>

		<p>We have a strong programme lined up, covering African languages, manuscripts, digital archives and the practical challenges of building sustainable research infrastructure.</p>

		<p>You're very welcome to join us online! Presentations will be streamed live via Teams, with simultaneous French–English translation. The programme and Teams link are available on the <a href="https://fmadore.github.io/stias-dh-ai-workshop-2026/" target="_blank" rel="noopener noreferrer">workshop website</a>.</p>
	`,
	tags: [
		'Digital Humanities',
		'AI',
		'African Studies',
		'Workshop',
		'Sustainability',
		'Equity',
		'DFG',
		'STIAS'
	],
	type: 'workshop',
	panelType: 'workshop',
	url: 'https://fmadore.github.io/stias-dh-ai-workshop-2026/',
	urlLabel: 'Workshop Website',
	image: 'images/communications/point-sud-logo.svg',
	heroImage: {
		src: 'images/communications/point-sud-logo.svg',
		alt: 'DFG Point Sud programme logo',
		caption: ''
	}
};

export default stiasDhAiWorkshop2026;
