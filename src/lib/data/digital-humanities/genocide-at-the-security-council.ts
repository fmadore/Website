import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const genocideAtTheSecurityCouncil: DigitalHumanitiesProject = {
	id: 'genocide-at-the-security-council',
	title: 'Genocide at the Security Council',
	years: '2026-',
	shortDescription:
		'A reproducible pipeline and interactive dashboard tracing how the word genocide was used across 167,642 UN Security Council speeches, 1946–2024, with every figure traceable to the script that made it.',
	description: `
		<p>Between 1946 and 2024 the UN Security Council heard 167,642 speeches. Someone said the word <em>genocide</em>, or a form such as <em>genocidal</em>, in 4,136 of them, 2.47% of the corpus, 7,787 times in all. The material is <a href="https://doi.org/10.7910/DVN/CKPTRB" target="_blank" rel="noopener noreferrer">The UNSC Meetings and Speeches</a> corpus (Sakamoto &amp; Matsuoka, v5.0, CC0): 9,464 meetings, 86.8 million words, public domain. <a href="https://fmadore.github.io/genocide-at-the-security-council/" target="_blank" rel="noopener noreferrer">Genocide at the Security Council</a> asks who said it, about what, and what the word was doing there.</p>

		<h2>Eight views</h2>
		<ul>
			<li><strong>Overview</strong>: the headline counts, and the annual series read two ways at once, as raw occurrences and as a share of speeches</li>
			<li><strong>Chronology</strong>: the word and its neighbours over time, year by year or month by month, plotted against 59 reference dates traced to primary sources</li>
			<li><strong>Words in context</strong>: what the word travels with, by speaker and by period</li>
			<li><strong>Actors</strong>: who said it, as a share of their own speeches, with Council membership resolved year by year</li>
			<li><strong>Concordance</strong>: every match with its sentence and the meeting symbol to cite, each expandable to the full speech</li>
			<li><strong>Usage</strong>: which case or concept each mention concerns, and whether the speaker asserts, rejects or reports the claim</li>
			<li><strong>Semantic map</strong>: speeches placed by similarity of wording and subject</li>
			<li><strong>Methods</strong>: how every number was made, sourced and bounded</li>
		</ul>

		<p>Every view says whether it is computed from the record or produced by a language model. Every chart says what it answers, how to read its marks and what it does not show, and names the script that produced the file behind it. Take any figure away as CSV with its provenance, or as SVG or PNG with the filters drawn into the image.</p>

		<h2>Reading with a language model</h2>

		<p>The Usage and Semantic map views are experimental. An open-weight model, Qwen3.8 27B, run on project-controlled hardware, has classified 7,694 of the 7,787 mentions, and a second model, Gemma 4 31B, offers a second opinion. The human-coded sample that will test them has not yet been coded, so the dashboard presents these labels as a way into the passages, not as findings. The word counts elsewhere do not depend on them.</p>

		<h2>How it is built</h2>

		<p>Python does the counting, from the raw Dataverse download through to the finished tables. The dashboard is a static <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">SvelteKit</a> site with <a href="https://echarts.apache.org/" target="_blank" rel="noopener noreferrer">ECharts</a> figures and a <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre</a> map. The choices that need human judgement, among them the genocide lexicon and the reference dates, sit in versioned config files where anyone can inspect them and argue with them.</p>

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
		{ url: 'https://doi.org/10.7910/DVN/CKPTRB', label: 'Source corpus (Dataverse)', type: 'data' }
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
		'LLM',
		'Open-weight models',
		'vLLM',
		'Embeddings',
		'GitHub Actions'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'genocide-security-council-embed',
			src: 'https://fmadore.github.io/genocide-at-the-security-council/',
			title: 'The dashboard',
			description:
				'<p>The overview, with the headline counts and the two figures that set up the rest. Follow the navigation for the chronology, the words in context, the per-speaker rates, the full concordance and the experimental model views.</p>',
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
