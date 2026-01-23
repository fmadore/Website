import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacSentimentAnalysis: DigitalHumanitiesProject = {
	id: 'iwac-sentiment-analysis',
	title: 'IWAC Sentiment Analysis',
	years: '2025',
	shortDescription:
		'Interactive visualization of sentiment patterns in 12,280+ West African press articles on Islam, with multi-model comparison (ChatGPT, Gemini, Mistral) and third-party arbitration.',
	description: `
		<p>An interactive dashboard exploring how West African newspapers portray Islam and Muslims, using AI-powered sentiment analysis of the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer">Islam West Africa Collection (IWAC)</a> corpus. Three large language models (LLMs) analyzed over 12,000 Francophone press articles to assess their tone, objectivity, and thematic focus on Islam.</p>

		<h3>Corpus</h3>
		<p><strong>12,280+ articles</strong> from <strong>56 newspapers</strong> across <strong>5 countries</strong> (Benin, Burkina Faso, Côte d'Ivoire, Niger, Togo), sourced from the <a href="https://huggingface.co/datasets/fmadore/iwac-newspaper-articles" target="_blank" rel="noopener noreferrer">IWAC Hugging Face dataset</a>.</p>

		<h3>Methodology</h3>
		<p>Each article was analyzed by three LLMs using a task-specific French-language prompt:</p>
		<ul>
			<li><strong>OpenAI GPT-5 mini</strong> (ChatGPT)</li>
			<li><strong>Google Gemini 3.0 Flash</strong></li>
			<li><strong>Mistral Ministral 3 14B</strong></li>
		</ul>
		<p>The models evaluated each article across three analytical dimensions:</p>
		<ol>
			<li><strong>Polarity</strong>: Stance toward Islam and Muslims (very negative → very positive)</li>
			<li><strong>Subjectivity</strong>: Density of opinion vs. reported fact (1-5 scale)</li>
			<li><strong>Centrality</strong>: Thematic prominence of Islamic topics (marginal → very central)</li>
		</ol>
		<p>Each model was required to generate concise justifications for its classifications, producing an auditable dataset documenting both conclusions and inferential reasoning.</p>
		<p><strong>Cost</strong>: ~€16 each for Gemini and ChatGPT, €6 for Mistral, with 24 hours of batch processing—replacing months of potential manual coding.</p>

		<h3>Features</h3>
		<h4>Eight visualization views</h4>
		<ol>
			<li><strong>Charts</strong>: Polarity and subjectivity distribution by newspaper</li>
			<li><strong>Trends</strong>: Temporal evolution of sentiments over the decades</li>
			<li><strong>Distribution</strong>: Cross-tabulation of polarity × subjectivity</li>
			<li><strong>Volume</strong>: Article counts by country over time</li>
			<li><strong>Heatmap</strong>: Centrality of Islam/Muslims by country and year</li>
			<li><strong>Table</strong>: Searchable article list with full details and AI justifications</li>
			<li><strong>Comparison</strong>: Side-by-side analysis of how different AI models interpreted the same articles</li>
			<li><strong>Extremes</strong>: Keywords associated with the most positive/negative portrayals</li>
		</ol>

		<h4>Multi-model comparison</h4>
		<p>To audit AI reliability, the dashboard compares how the three models interpreted each article. When models disagree, a more powerful AI (Gemini 3.0 Pro) serves as arbiter to evaluate which interpretation better fits the source text. This revealed that Gemini 3.0 Flash was the most reliable model overall.</p>

		<h4>Interface</h4>
		<ul>
			<li>Bilingual (French/English)</li>
			<li>Filter by country, newspaper, and sentiment criteria</li>
			<li>Shareable URLs and CSV export for further analysis</li>
		</ul>

		<h3>A "vibe coding" experiment</h3>
		<p>This dashboard was built entirely through natural-language collaboration with AI coding assistants (Claude Sonnet and Opus), without manually writing code. This approach demonstrates how researchers without programming expertise can now develop sophisticated analytical tools by articulating their vision in plain language—lowering barriers to digital humanities work for scholars at institutions with limited technical support.</p>
	`,
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
