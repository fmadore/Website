import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacSentimentAnalysis: DigitalHumanitiesProject = {
	id: 'iwac-sentiment-analysis',
	title: 'IWAC Sentiment Analysis',
	years: '2025',
	shortDescription:
		'Interactive visualization of sentiment patterns in 12,280+ West African press articles on Islam, with multi-model comparison (ChatGPT, Gemini, Mistral) and third-party arbitration.',
	description:
		"<p>This interactive web application visualizes sentiment patterns in Francophone press coverage of Islam and Muslims in West Africa using the Islam West Africa Collection (IWAC) corpus—12,280+ articles from 56 newspapers across five countries. It features eight visualization views (charts, trends, distribution, volume, heatmap, table, comparison, extremes) analyzing polarity, subjectivity, and Islam/Muslims centrality. The multi-model comparison mode evaluates discrepancies between three AI models (ChatGPT, Gemini, Mistral) with Gemini 3.0 Pro serving as third-party arbiter. A lexical extremes analysis identifies keywords associated with extreme sentiments. The bilingual interface (French/English) supports hierarchical filtering and shareable URLs.</p>",
	imageUrl: '/images/digital-humanities/iwac-sentiment-analysis.webp',
	order: 4,
	skills: [
		'Svelte',
		'Data Visualisation',
		'ECharts',
		'Vite',
		'Tailwind CSS',
		'TypeScript',
		'Prompt Engineering',
		'LLM',
		'JSON'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'iwac-sentiment-analysis-embed',
			src: 'https://fmadore.github.io/IWAC-sentiment-analysis/',
			title: 'IWAC Sentiment Analysis',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		}
	]
};
