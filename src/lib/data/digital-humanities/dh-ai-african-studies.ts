import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const dhAiAfricanStudies: DigitalHumanitiesProject = {
	id: 'dh-ai-african-studies',
	title: 'Charting New Territory: Digital Humanities and AI in African Studies',
	years: '2025-2026',
	shortDescription:
		'The website for a VolkswagenStiftung scoping workshop held in Hanover in February 2026, which documents its programme and 26 participants and carries a filterable bibliography of 215 works, a concept map of the literature, six filmed interviews, and the forthcoming position paper.',
	description: `
		<p>This is the website for <em>Charting New Territory: Digital Humanities and AI in African Studies</em>, a scoping workshop that <a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a> and I organised at the Xplanatorium Herrenhausen in Hanover from 18 to 20 February 2026, funded by the <a href="https://www.volkswagenstiftung.de/en/funding/funding-offer/scoping-workshops" target="_blank" rel="noopener noreferrer">VolkswagenStiftung</a>. It gathered 26 researchers from 16 countries across Africa, Europe and beyond for three days of structured discussion rather than presentations. I designed and built the site; it announced the workshop beforehand and now documents what came out of it. The event itself is listed under <a href="/communications/volkswagenstiftung-dh-ai-african-studies-workshop-2026">conference activity</a>, and the wider <a href="/research/dh-ai-african-studies">research agenda</a> it belongs to has its own page.</p>

		<p>Most workshop sites go quiet once the delegates leave. This one was built so that the material assembled to prepare the discussion, and the record of what the discussion produced, stay usable afterwards.</p>

		<h3>Programme and participants</h3>
		<p>The three-day schedule is browsable by day, with URL-synced tabs so any session can be linked to directly. A searchable directory covers all 26 participants, viewable by thematic group or plotted on an interactive map of their institutional affiliations, which makes the geographic spread of the group visible at a glance.</p>

		<h3>References</h3>
		<p>The reading list assembled to prepare the workshop is published as a standing bibliography of <strong>215 works</strong> on digital humanities, artificial intelligence and African studies: journal articles, books, chapters, theses, blog posts, videos and web pages, in English, French and German. It filters by type, language and year, and by any of <strong>923 keywords</strong> covering questions such as data sovereignty, digital colonialism, African language technologies and AI ethics. Every entry carries an abstract and a link to the work itself, and any selection exports to BibTeX or RIS, so the bibliography can be pulled into Zotero rather than only read on the page.</p>

		<h3>Concept map</h3>
		<p>Reading 215 works produces notes; the harder question is what they collectively say. Each reference was read and annotated in Obsidian, with recurring themes captured as interlinked concept notes. Fifty-five foundational concepts were mapped to the workshop's thematic groups as seeds, and the wiki-links between notes then surfaced connections nobody had planned, expanding the network to <strong>105 concepts joined by 863 relationships</strong>. A Python script converts that graph to JSON and a D3 force layout draws it: node size follows connection density, seed concepts are marked, and clusters emerge around archives, epistemologies and decoloniality, infrastructure and governance, and language technologies. The map is a reading of a corpus, generated from annotation rather than asserted from memory, and the script that produced it is in the repository.</p>

		<h3>Interviews and photographs</h3>
		<p>Six short filmed interviews let participants set out their own positions: Emmanuel Ngue Um on African language resources, Duncan Money on archival digitisation, Karen Byera Ijumba on restitution data, Fallou Ngom on Ajami manuscripts, Menno van Zaanen on digital language resources, and Albrecht Hofheinz on Arabic manuscript analysis. Filmed by Calum Houston. A gallery covers the three days.</p>

		<h3>Position paper</h3>
		<p>The workshop's main outcome is a co-authored position paper on the ethical integration of digital humanities and AI in African studies, written for specialists and policy audiences alike. A drafting committee has been working on it since the workshop closed, and it will appear in the <a href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts" target="_blank" rel="noopener noreferrer">ZMO Programmatic Texts</a> series; the site carries a page for it and will publish the details on release.</p>

		<h3>How it's built</h3>
		<p>A static <a href="https://svelte.dev/docs/kit" target="_blank" rel="noopener noreferrer">SvelteKit</a> site (Svelte 5 runes, TypeScript, Tailwind CSS) deployed to GitHub Pages, with <a href="https://d3js.org/" target="_blank" rel="noopener noreferrer">D3</a> for the concept map and <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet</a> for the participant map. Two standard-library Python scripts do the data work: one fetches and normalises the references, the other extracts the concept graph from the Obsidian vault. The interface has a light and dark mode, meets WCAG 2.1 Level AA, and publishes JSON-LD structured data.</p>
	`,
	imageUrl: '/images/digital-humanities/dh-ai-african-studies.webp',
	order: 4,
	links: [
		{ url: 'https://fmadore.github.io/dh-ai-african-studies-2026/' },
		{ url: 'https://fmadore.github.io/dh-ai-african-studies-2026/references', label: 'References' },
		{ url: 'https://fmadore.github.io/dh-ai-african-studies-2026/concepts', label: 'Concept map' },
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
	embeddableContent: [
		{
			type: 'iframe',
			id: 'dh-ai-african-studies-concept-map',
			src: 'https://fmadore.github.io/dh-ai-african-studies-2026/concepts',
			title: 'Concept map',
			description:
				'<p>105 concepts and 863 relationships extracted from reading notes on the workshop bibliography. Ctrl+scroll to zoom, drag the background to pan, drag a node to reposition it.</p>',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		}
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
