import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const genocideAtTheSecurityCouncil: DigitalHumanitiesProject = {
	id: 'genocide-at-the-security-council',
	title: 'Genocide at the Security Council',
	years: '2026-',
	shortDescription:
		'A reproducible pipeline and interactive dashboard tracing how the word genocide was used across 106,302 UN Security Council speeches, 1992–2023. Built with Python and SvelteKit, with every figure traceable to the script that made it.',
	description: `
		<p>Between 1992 and 2023 the UN Security Council heard 106,302 speeches. Someone said the word <em>genocide</em> in 3,273 of them, 3.08% of the corpus, 6,092 times in all. The material is the <a href="https://doi.org/10.7910/DVN/KGVSYH" target="_blank" rel="noopener noreferrer">UN Security Council Debates</a> corpus (Schoenfeld, Eckhard, Patz, van Meegdenburg &amp; Pires, v6.1, CC0): 6,582 meetings, 66.4 million words, public domain. <a href="https://fmadore.github.io/genocide-at-the-security-council/" target="_blank" rel="noopener noreferrer">Genocide at the Security Council</a> asks who said it, about what, and what the word was doing there.</p>

		<h3>Six views</h3>
		<ul>
			<li><strong>Overview</strong>: the question, the headline counts, and the annual series read two ways at once, as raw occurrences and as a share of speeches</li>
			<li><strong>Chronology</strong>: every term and lexical register over time, plotted against 35 reference dates traced to primary sources</li>
			<li><strong>Language</strong>: what the word travels with, by speaker and by period, measured by log-likelihood and log ratio side by side</li>
			<li><strong>Actors</strong>: who said it, as a share of their own speeches, with Council membership resolved year by year</li>
			<li><strong>Concordance</strong>: 79,569 lines across 22 terms, filterable by term, year, month, speaker and meeting, each expandable to the full speech</li>
			<li><strong>Methods</strong>: how every number was made, sourced and bounded</li>
		</ul>

		<p>Every chart says what it answers, how to read its marks and what it does not show, and names the script that produced the file behind it. Take any figure away as CSV with its provenance, or as SVG or PNG with the filters drawn into the image.</p>

		<h3>How it is built</h3>

		<p>Python does the counting, from the raw Dataverse download through to the finished tables. The dashboard is a static <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">SvelteKit</a> site with <a href="https://echarts.apache.org/" target="_blank" rel="noopener noreferrer">ECharts</a> figures and a <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre</a> locator map. The choices that need human judgement, among them the genocide lexicon and the reference dates, sit in versioned config files where anyone can inspect them and argue with them.</p>

		<p>The code is <a href="https://github.com/fmadore/genocide-at-the-security-council/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>, the derived tables and figures CC BY 4.0, the source corpus CC0.</p>
	`,
	imageUrl: '/images/digital-humanities/genocide-at-the-security-council.webp',
	order: 0,
	links: [
		{ url: 'https://fmadore.github.io/genocide-at-the-security-council/' },
		{
			url: 'https://github.com/fmadore/genocide-at-the-security-council',
			label: 'genocide-at-the-security-council',
			type: 'code'
		},
		{ url: 'https://doi.org/10.7910/DVN/KGVSYH', label: 'Source corpus (Dataverse)', type: 'data' }
	],
	skills: [
		'Python',
		'pandas',
		'Corpus Linguistics',
		'NLP',
		'Text Analysis',
		'Reproducible Research',
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'ECharts',
		'MapLibre GL',
		'Data Visualisation',
		'GitHub Actions'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'genocide-security-council-embed',
			src: 'https://fmadore.github.io/genocide-at-the-security-council/',
			title: 'The dashboard',
			description:
				'<p>The overview view, with the headline counts and the two figures that set up the rest. Follow the nav for the chronology, the collocates, the per-speaker rates and the full concordance.</p>',
			showTitle: true,
			variant: 'responsive'
		}
	],
	seoKeywords: [
		'genocide',
		'UN Security Council',
		'corpus linguistics',
		'discourse analysis',
		'text as data',
		'digital humanities',
		'computational social science',
		'lexicometry',
		'concordance',
		'keyword in context',
		'reproducible research',
		'data visualisation',
		'international relations',
		'United Nations'
	]
};
