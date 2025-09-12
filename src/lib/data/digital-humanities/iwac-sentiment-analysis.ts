import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacSentimentAnalysis: DigitalHumanitiesProject = {
	id: 'iwac-sentiment-analysis',
	title: 'IWAC Sentiment Analysis',
	years: '2025',
	shortDescription:
		'This web application uses the IWAC corpus to visualise sentiment patterns in West African press coverage of Islam, and features a comparative analysis tool that evaluates discrepancies between ChatGPT and Gemini sentiment analyses.',
	description:
		"<p>This interactive web application provides a range of visualisation and analysis tools to help users explore sentiment patterns in Francophone press coverage of Islam and Muslims in West Africa using the Islam West Africa Collection (IWAC) corpus. The platform enables researchers to examine media sentiment using different analytical methods, such as temporal trends, geographical distributions and cross-dimensional correlations between polarity, subjectivity and centrality scores. A notable feature is the comparative analysis mode, which evaluates discrepancies between ChatGPT and Gemini's analyses of the same articles, offering insights into the reliability of the models and potential biases in automated content analysis. The application features hierarchical filtering capabilities and multilingual support for French and English, as well as various visualisation formats, including interactive charts, heatmaps and detailed, article-level comparisons.</p>",
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
