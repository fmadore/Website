import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

const activityDateISO = '2026-03-24';

export const activity: Activity = {
	id: 'dh-ai-african-studies-stias-workshop',
	title:
		'Call for Papers: Digital Humanities and Artificial Intelligence in African Studies: Towards Sustainable and Equitable Practices',
	dateISO: activityDateISO,
	date: formatDisplayDate(activityDateISO),
	year: 2026,
	description:
		'Call for papers for a four-day workshop at the Stellenbosch Institute for Advanced Study (STIAS) in South Africa, 21\u201324 September 2026, co-organised with Vincent Hiribarren, Emmanuel Ngu\u00e9 Um, and Menno van Zaanen, and funded by the DFG Point Sud programme.',
	content: `
		<p>Thanks to the generous funding of the <a href="https://www.dfg.de/en" target="_blank" rel="noopener noreferrer">Deutsche Forschungsgemeinschaft</a> (DFG) programme <a href="https://pointsud.org/" target="_blank" rel="noopener noreferrer">Point Sud</a>, <a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a>, Emmanuel Ngu\u00e9 Um, <a href="https://menno.abstractcow.com/" target="_blank" rel="noopener noreferrer">Menno van Zaanen</a>, and I are organising a four-day <a href="https://fmadore.github.io/stias-dh-ai-workshop-2026/" target="_blank" rel="noopener noreferrer">workshop</a> at the <a href="https://stias.ac.za/" target="_blank" rel="noopener noreferrer">Stellenbosch Institute for Advanced Study</a> (STIAS) in South Africa, 21\u201324 September 2026.</p>

		<p>We are looking for contributions along three axes:</p>
		<ol>
			<li>Transforming research methods through AI and digital tools in African Studies</li>
			<li>Building sustainable research infrastructures from African perspectives</li>
			<li>Centring African knowledge systems in digital research design</li>
		</ol>

		<h3>Submission details</h3>
		<p><strong>Deadline:</strong> Proposals of up to 500 words (in English or French) are due by <strong>30 April 2026</strong>.</p>

		<p>Selected papers may be published in a special issue of the <a href="https://upjournals.up.ac.za/index.php/dhasa" target="_blank" rel="noopener noreferrer"><em>Journal of the Digital Humanities Association of Southern Africa</em></a> (JDHASA).</p>

		<p>Full details and submission guidelines are available <a href="https://fmadore.github.io/stias-dh-ai-workshop-2026/call-for-papers" target="_blank" rel="noopener noreferrer">here</a>.</p>
	`,
	heroImage: {
		src: 'images/communications/point-sud-logo.svg',
		alt: 'DFG Point Sud programme logo',
		caption: ''
	},
	tags: ['Digital Humanities', 'AI', 'African Studies', 'Call for Papers', 'Workshop', 'DFG'],
	type: 'workshop',
	panelType: 'workshop'
};
