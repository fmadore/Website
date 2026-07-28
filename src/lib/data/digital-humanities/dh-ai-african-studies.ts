import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const dhAiAfricanStudies: DigitalHumanitiesProject = {
	id: 'dh-ai-african-studies',
	title: 'Charting New Territory: Digital Humanities and AI in African Studies',
	years: '2025-2026',
	shortDescription:
		'The website for a VolkswagenStiftung scoping workshop held in Hanover in February 2026, which documents its programme and 26 participants and carries a filterable bibliography of over 200 works, a concept map of the literature, six filmed interviews, and the forthcoming position paper.',
	description: `
		<p><a href="https://fmadore.github.io/dh-ai-african-studies-2026/" target="_blank" rel="noopener noreferrer"><em>Charting New Territory: Digital Humanities and AI in African Studies</em></a> is the website for a scoping workshop that <a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a> and I organised at the Xplanatorium Herrenhausen in Hanover from 18 to 20 February 2026, funded by the <a href="https://www.volkswagenstiftung.de/en/funding/funding-offer/scoping-workshops" target="_blank" rel="noopener noreferrer">VolkswagenStiftung</a>. It gathered 26 researchers from 16 countries across Africa, Europe and beyond for three days of structured discussion rather than presentations.</p>

		<p>I designed and built the site. It announced the workshop in advance and now documents its outcomes. The event itself is listed under <a href="/communications/volkswagenstiftung-dh-ai-african-studies-workshop-2026">conference activity</a>, and it belongs to a wider <a href="/research/dh-ai-african-studies">research agenda</a>.</p>

		<h3>Programme and participants</h3>
		<p>Tabs split the three-day programme by day and sync to the URL, so any session can be linked to directly. A searchable directory covers all 26 participants: browse them by thematic group, or see where they work on an interactive map of their institutional affiliations.</p>

		<h3>References</h3>
		<p>The reading list gathered to prepare the workshop is now a standing bibliography of over <strong>200 works</strong> on digital humanities, artificial intelligence and African studies: journal articles, books, chapters, theses, blog posts, videos and web pages, in English, French and German.</p>
		<p>It filters by type, language and year, and by any of <strong>943 keywords</strong> covering data sovereignty, digital colonialism, African language technologies and AI ethics. Every entry carries an abstract and a link to the work itself, and any selection exports to BibTeX or RIS, so readers can pull the bibliography into Zotero instead of only reading it on the page.</p>

		<h3>Concept map</h3>
		<p>Reading 215 works produces notes; the harder question is what they collectively say. I read and annotated each reference in Obsidian and captured recurring themes as interlinked concept notes.</p>
		<p>Fifty-five foundational concepts seeded the map, matched to the workshop's thematic groups. The wiki-links between notes then surfaced connections nobody had planned, and the network grew to <strong>105 concepts joined by 863 relationships</strong>. A Python script converts that graph to JSON and a D3 force layout draws it: node size follows connection density, seeds are marked, and clusters emerge around archives, epistemologies and decoloniality, infrastructure and governance, and language technologies.</p>
		<p>The map is a reading of a corpus, drawn from annotation rather than from memory. The script that produced it is in the repository. On the <a href="https://fmadore.github.io/dh-ai-african-studies-2026/concepts" target="_blank" rel="noopener noreferrer">live map</a>, Ctrl+scroll to zoom, drag the background to pan, and drag a node to reposition it.</p>

		<h3>Interviews and photographs</h3>
		<p>Six short interviews, filmed by Calum Houston, let participants set out their own positions: Emmanuel Ngue Um on African language resources, Duncan Money on archival digitisation, Karen Byera Ijumba on restitution data, Fallou Ngom on Ajami manuscripts, Menno van Zaanen on digital language resources, and Albrecht Hofheinz on Arabic manuscript analysis. A photo gallery covers all three days.</p>

		<h3>Position paper</h3>
		<p>The workshop's main outcome is a co-authored position paper on the ethical integration of digital humanities and AI in African studies, written for specialists and policy readers. A drafting committee has been working on it since the workshop closed, and it will appear in the <a href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts" target="_blank" rel="noopener noreferrer">ZMO Programmatic Texts</a> series. The site carries a page for the paper and will publish the details on release.</p>

		<h3>How it's built</h3>
		<p>The site is a static <a href="https://svelte.dev/docs/kit" target="_blank" rel="noopener noreferrer">SvelteKit</a> build (Svelte 5 runes, TypeScript, Tailwind CSS) deployed to GitHub Pages, with <a href="https://d3js.org/" target="_blank" rel="noopener noreferrer">D3</a> for the concept map and <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet</a> for the participant map. Two standard-library Python scripts do the data work: one fetches and normalises the references, the other extracts the concept graph from the Obsidian vault. The interface has a light and dark mode, meets WCAG 2.1 Level AA, and publishes JSON-LD structured data.</p>
	`,
	imageUrl: '/images/digital-humanities/dh-ai-african-studies.webp',
	order: 4,
	links: [
		{ url: 'https://fmadore.github.io/dh-ai-african-studies-2026/' },
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
		'network visualization',
		'bibliography',
		'data sovereignty',
		'digital colonialism',
		'African language technologies',
		'AI ethics'
	]
};
