import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const iwacAiPipelines: DigitalHumanitiesProject = {
	id: 'iwac-ai-pipelines',
	title: 'IWAC AI Pipelines',
	years: '2026',
	shortDescription:
		'Open-source Python pipelines that use AI models to transcribe, index, summarise and analyse the Islam West Africa Collection, with every result traceable to the model that produced it.',
	description: `
		<p>With nearly 21,000 items and more than 32 million words, the equivalent of over 300 books, the <a href="/digital-humanities/iwac">Islam West Africa Collection</a> has long outgrown what one researcher could read, transcribe and catalogue by hand. Without help, much of it would remain "digital clutter": gathered, but never truly accessible.</p>
		<p>These pipelines put large language models to work on the tasks that would otherwise take months, or never get done. They draw on commercial models from Google, OpenAI and Mistral, and on open-weight models such as Qwen, DeepSeek and Gemma, which can also run on a university's own servers. The aim is to make a large collection workable, so that researchers can spend their time on interpretation rather than data wrangling. The code is open source and modular, with its prompts kept as plain text files, so other collections can adapt it.</p>

		<h2>What the pipelines do</h2>
		<ul>
			<li><strong>Read scans</strong>: extract the text of scanned newspapers and magazines, and correct the errors left by older OCR software</li>
			<li><strong>Read handwriting</strong>: transcribe manuscripts in French, Arabic or both</li>
			<li><strong>Listen</strong>: transcribe interviews, oral histories and YouTube videos, including in Hausa, and describe what videos show</li>
			<li><strong>Index</strong>: find the people, places and organisations in each document and link them to the collection's index despite variant spellings, and give academic references their subject keywords</li>
			<li><strong>Summarise</strong>: write short French and English summaries that make documents easier to find</li>
			<li><strong>Split magazines</strong> into their individual articles</li>
			<li><strong>Read press attitudes</strong>: rate how each article portrays Islam and Muslims, with a <a href="/digital-humanities/iwac-sentiment-analysis">panel of five models</a></li>
		</ul>

		<h2>Careful by design</h2>
		<p>The pipelines write to the live archive, so each one is built to be cautious. It can first report what it would change, saves a copy of every record before editing it, and asks for confirmation before a bulk update. Every AI-generated text and link also records the model that produced it, using a small <a href="https://github.com/fmadore/iwac-vocabulary" target="_blank" rel="noopener noreferrer">vocabulary</a> built for the purpose, so readers can always tell machine work from human cataloguing.</p>
		<p>A companion web app, <a href="https://github.com/fmadore/AI-NER-Validator" target="_blank" rel="noopener noreferrer">AI-NER-Validator</a>, keeps human judgement at the centre of entity extraction. Researchers review each article with the extracted names highlighted, accept or reject each one, add what the model missed and export a clean list.</p>

		<h2>Limitations</h2>
		<p>These tools are research aids, not substitutes for scholarly judgement. The models are black boxes, and the same text run twice may not give the same answer. Trained mostly on Western data, they can misread African contexts and names. Their mistakes are also harder to spot: where old OCR produced visible gibberish, an AI error reads as fluent prose. Using them well takes expertise and close knowledge of the sources.</p>
	`,
	imageUrl: `/images/digital-humanities/iwac-ai-pipelines.webp`,
	order: 3,
	links: [
		{
			url: 'https://github.com/fmadore/iwac-ai-pipelines',
			label: 'iwac-ai-pipelines',
			type: 'code'
		},
		{ url: 'https://github.com/fmadore/AI-NER-Validator', label: 'AI-NER-Validator', type: 'code' },
		{ url: 'https://doi.org/10.5281/zenodo.21804210', label: 'Software DOI (Zenodo)', type: 'code' }
	],
	skills: [
		'Python',
		'LLM',
		'Open-weight models',
		'Prompt Engineering',
		'OCR',
		'HTR',
		'NER',
		'NLP',
		'Audio transcription',
		'Sentiment analysis',
		'Omeka S API',
		'Docker'
	],
	seoKeywords: [
		'AI pipelines',
		'LLM',
		'OCR',
		'NER',
		'named entity recognition',
		'handwritten text recognition',
		'audio transcription',
		'digital humanities',
		'Islam West Africa',
		'IWAC',
		'Google Gemini',
		'OpenAI',
		'Mistral',
		'Qwen',
		'DeepSeek',
		'open-weight models',
		'sentiment analysis',
		'archival processing'
	]
};
