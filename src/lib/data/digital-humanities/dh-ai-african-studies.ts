import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const dhAiAfricanStudies: DigitalHumanitiesProject = {
	id: 'dh-ai-african-studies',
	title: 'Charting New Territory: Digital Humanities and AI in African Studies',
	years: '2025-2026',
	shortDescription:
		'The website of a VolkswagenStiftung scoping workshop held in Hanover in February 2026: its programme and 26 participants, a bibliography of over 200 works, a concept map of the literature, six filmed interviews and the position paper it produced.',
	description: `
		<p><a href="https://fmadore.github.io/dh-ai-african-studies-2026/" target="_blank" rel="noopener noreferrer"><em>Charting New Territory: Digital Humanities and AI in African Studies</em></a> is the website for a scoping workshop that <a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a> and I organised at the Xplanatorium Herrenhausen in Hanover from 18 to 20 February 2026, funded by the <a href="https://www.volkswagenstiftung.de/en/funding/funding-offer/scoping-workshops" target="_blank" rel="noopener noreferrer">VolkswagenStiftung</a>. It gathered 26 researchers from 16 countries across Africa, Europe and beyond for three days of structured discussion rather than presentations.</p>
		<p>I designed and built the site. It announced the workshop in advance and now serves as its archive. The event itself is listed under <a href="/communications/volkswagenstiftung-dh-ai-african-studies-workshop-2026">conference activity</a>, and it belongs to a wider <a href="/research/dh-ai-african-studies">research agenda</a>.</p>

		<h2>The position paper</h2>
		<p>The workshop's main outcome, <a href="/publications/for-whom-for-what-purpose-dh-ai-african-studies-2026"><em>For Whom and For What Purpose?</em></a>, appeared in the ZMO Programmatic Texts series in September 2026, written together by the participants. It puts one question to digital humanities and AI work in African studies: for whom, and for what purpose, is it undertaken? The site carries the paper's abstract and a link to the full text, alongside a blog post and a report on the workshop.</p>

		<h2>Programme and participants</h2>
		<p>The three-day programme reads day by day, with a direct link to every session. A searchable directory presents all 26 participants, by thematic group or on a map of their institutions.</p>

		<h2>References</h2>
		<p>The reading list gathered to prepare the workshop is now a standing bibliography of <strong>217 works</strong> on digital humanities, artificial intelligence and African studies: articles, books, theses, reports, blog posts, videos and more, in English, French and German.</p>
		<p>It filters by type, language and year, and by any of more than <strong>900 keywords</strong>, from data sovereignty and digital colonialism to African language technologies and AI ethics. Every entry carries an abstract and a link to the work itself, and any selection exports to BibTeX or RIS, so readers can pull it straight into Zotero.</p>

		<h2>Concept map</h2>
		<p>Reading more than 200 works produces notes; the harder question is what they say together. I annotated each reference in Obsidian and turned recurring themes into linked concept notes.</p>
		<p>Eighty-six foundational concepts, matched to the workshop's four thematic groups, seeded the map. The links between notes then brought out connections nobody had planned, adding 59 more. The result, <strong>145 concepts joined by 1,219 relationships</strong>, clusters around archives, epistemologies and decoloniality, infrastructure and governance, and language technologies. A Python script turns the notes into the network, so the map is a reading of the corpus, drawn from annotation rather than from memory. On the <a href="https://fmadore.github.io/dh-ai-african-studies-2026/concepts" target="_blank" rel="noopener noreferrer">live map</a>, select any concept to see what it connects to.</p>

		<h2>Interviews and photographs</h2>
		<p>Six short interviews, filmed by Calum Houston, let participants set out their own positions: Emmanuel Ngue Um on African language resources, Duncan Money on archival digitisation, Karen Byera Ijumba on restitution data, Fallou Ngom on Ajami manuscripts, Menno van Zaanen on digital language resources, and Albrecht Hofheinz on Arabic manuscript analysis. A photo gallery covers all three days.</p>

		<h2>How it's built</h2>
		<p>The site is a static <a href="https://svelte.dev/docs/kit" target="_blank" rel="noopener noreferrer">SvelteKit</a> build deployed to GitHub Pages, with <a href="https://d3js.org/" target="_blank" rel="noopener noreferrer">D3</a> for the concept map and <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet</a> for the participant map. Two Python scripts do the data work: one fetches and tidies the references, the other extracts the concept network from the Obsidian notes. The site has light and dark modes, meets the WCAG 2.1 AA accessibility standard, and works from the keyboard throughout.</p>
	`,
	imageUrl: '/images/digital-humanities/dh-ai-african-studies.webp',
	order: 4,
	links: [
		{ url: 'https://fmadore.github.io/dh-ai-african-studies-2026/' },
		{
			url: 'https://doi.org/10.58144/20260827-000',
			label: 'Position paper (ZMO Programmatic Texts)'
		},
		{
			url: 'https://github.com/fmadore/dh-ai-african-studies-2026',
			label: 'dh-ai-african-studies-2026',
			type: 'code'
		}
	],
	skills: [
		'Svelte 5',
		'SvelteKit',
		'TypeScript',
		'Tailwind CSS',
		'D3.js',
		'Leaflet',
		'Python',
		'Obsidian',
		'Zotero',
		'Metadata Standards',
		'Data Visualisation',
		'Network graphs'
	],
	seoKeywords: [
		'digital humanities',
		'artificial intelligence',
		'African studies',
		'scoping workshop',
		'VolkswagenStiftung',
		'concept map',
		'network visualisation',
		'bibliography',
		'data sovereignty',
		'digital colonialism',
		'African language technologies',
		'AI ethics',
		'position paper',
		'data colonialism',
		'decolonial digital humanities'
	]
};
