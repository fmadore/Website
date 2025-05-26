import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacSentimentAnalysis: DigitalHumanitiesProject = {
	id: 'iwac-sentiment-analysis',
	title: 'IWAC Sentiment Analysis',
	years: '2025',
	shortDescription:
		'This interactive visualisation presents a sentiment analysis concerning the representation of Islam and Muslims in articles from the Islam West Africa Collection.',
	description:
		"<p>This interactive dashboard allows you to explore how Francophone West African newspapers portray Islam and Muslims. Each article is scored on three axes: polarity (ranging from 'very negative' to 'very positive'), subjectivity (from 1 = very objective to 5 = highly subjective) and centrality (how central Islam/Muslims are to the story). Filters and hover-over details enable you to quickly compare sentiment profiles and trace patterns of bias, tone and topical focus across outlets, periods or countries.</p>",
	imageUrl: '/images/digital-humanities/iwac-sentiment-analysis.webp',
	order: 4,
	skills: ['Svelte', 'Data Visualisation', 'ECharts', 'Vite', 'Tailwind CSS', 'TypeScript'],
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
