import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacSentimentAnalysis: DigitalHumanitiesProject = {
	id: 'iwac-sentiment-analysis',
	title: 'IWAC Sentiment Analysis',
	years: '2025-2026',
	shortDescription:
		'An interactive dashboard comparing how five AI models read the tone of more than 12,000 West African press articles on Islam, where they agree, and where they part ways.',
	description: `
		<p>How do West African newspapers portray Islam and Muslims, and can AI help answer that question at scale? This dashboard explores 12,349 French-language articles from 58 newspapers in Benin, Burkina Faso, Côte d'Ivoire, Niger and Togo, published between 1961 and 2025 and drawn from the <a href="/digital-humanities/iwac">Islam West Africa Collection</a>.</p>
		<p>Rather than trust a single model, it asks five: GPT-5.6 Luna, Mistral Small 4, DeepSeek V4 Flash, Gemma 4 31B and Qwen3.8 27B. Each read every article and judged three things:</p>
		<ul>
			<li><strong>Polarity</strong>: how favourably the article portrays Islam and Muslims</li>
			<li><strong>Subjectivity</strong>: how much opinion it contains, as against reported fact</li>
			<li><strong>Centrality</strong>: how central Islam is to the story</li>
		</ul>
		<p>Each model also explains every judgement in a sentence or two, so any rating can be checked against its reasoning.</p>

		<h2>Where the models disagree</h2>
		<p>The disagreements are part of the findings. All five models agree on polarity for only about a third of the articles. The dashboard measures their agreement pair by pair, shows the articles that split them, and asks a sixth model, Claude Opus 5, to arbitrate blind on the sharpest disputes. It is also open about its gaps: Qwen declined 200 articles, mostly ones in which Islam is peripheral, and the dashboard says so rather than hiding it.</p>

		<h2>What you can explore</h2>
		<p>Thirteen views share one set of filters, by country, newspaper and rating, and every view has its own web address for sharing:</p>
		<ul>
			<li><strong>Trends</strong> over time, by country and by newspaper, with newspapers ranked by tone</li>
			<li><strong>Seasonality</strong>: coverage nearly doubles during Ramadan and the hajj months, a rhythm only an Islamic-calendar view reveals</li>
			<li><strong>A map</strong> of the places the articles mention</li>
			<li><strong>The full article table</strong>, with each model's justifications</li>
			<li><strong>Comparison and agreement</strong>: two models side by side, agreement statistics and the arbiter's verdicts</li>
			<li><strong>Extremes</strong>: the words that characterise the most positive and most negative coverage</li>
		</ul>
		<p>The interface is bilingual, in French and English, and any selection can be downloaded as CSV.</p>

		<h2>Two rounds of analysis</h2>
		<p>A first round in 2025 used three models (GPT-5 mini, Gemini 3 Flash and Ministral 14B), for under €40 and a day of batch processing, replacing months of manual coding. A second round in 2026, with a revised prompt and five models, is now the default. The first stays online unchanged, so figures already cited from it still resolve.</p>

		<h2>Built with AI</h2>
		<p>I built the dashboard through natural-language collaboration with AI coding assistants, without writing the code by hand. It shows how researchers without programming training can now create serious analytical tools, lowering the barrier for scholars at institutions with little technical support.</p>
	`,
	imageUrl: '/images/digital-humanities/iwac-sentiment-analysis.webp',
	order: 2,
	links: [
		{ url: 'https://iwac.frederickmadore.com/sentiment-analysis/' },
		{
			url: 'https://github.com/fmadore/IWAC-sentiment-analysis',
			label: 'IWAC-sentiment-analysis',
			type: 'code'
		},
		{ url: 'https://doi.org/10.5281/zenodo.21806223', label: 'Software DOI (Zenodo)', type: 'code' }
	],
	skills: [
		'Svelte 5',
		'SvelteKit',
		'TypeScript',
		'Python',
		'ECharts',
		'MapLibre GL',
		'Tailwind CSS',
		'Data Visualisation',
		'LLM',
		'Prompt Engineering',
		'Sentiment analysis',
		'Inter-rater agreement'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'iwac-sentiment-analysis-embed',
			src: 'https://iwac.frederickmadore.com/sentiment-analysis/',
			title: 'IWAC Sentiment Analysis',
			showTitle: true,
			variant: 'responsive'
		}
	]
};
