import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const zmoAiPipelines: DigitalHumanitiesProject = {
	id: 'zmo-ai-pipelines',
	title: 'ZMO AI Pipelines',
	years: '2025-2026',
	shortDescription:
		'Google Colab notebooks that let researchers transcribe interviews, read scanned and handwritten documents, and summarise sources with AI, with no installation and a record of how every result was made.',
	description: `
		<p>Transcribing interviews, deciphering handwriting and summarising documents devour research time. AI can now do much of this well, but technical barriers get in the way: many social scientists are put off by Python environments and dependencies, and do not see themselves as "power users".</p>
		<p>These Google Colab notebooks remove that barrier. If you can click "Play", you can run them: no installation and no setup, everything in the browser, with plain-language steps from start to finish. The code stays fully visible for anyone who wants to inspect, adapt or extend it.</p>

		<h2>Three tools</h2>
		<ul>
			<li><strong>Transcription</strong>: turn interviews, focus groups and lectures into text, word for word or lightly cleaned up, with speakers identified</li>
			<li><strong>OCR and HTR</strong>: read printed and handwritten documents, either exactly as written or with the spelling normalised, including French and Arabic handwriting</li>
			<li><strong>Summaries and keywords</strong>: summarise long documents and extract keywords, for hundreds of files at once from a spreadsheet, at half the price when run as a batch</li>
		</ul>

		<h2>Beyond Western languages</h2>
		<p>Most AI tools perform well on English and the major European languages. These notebooks have been tested on more demanding material:</p>
		<ul>
			<li><strong>Handwritten text</strong>: Arabic manuscripts</li>
			<li><strong>Printed documents</strong>: Hindi, Old Tatar</li>
			<li><strong>Audio</strong>: Hausa, Arabic, Swahili, Kurmanji</li>
		</ul>
		<p>Long archival files are processed page by page, and long recordings in manageable pieces.</p>

		<h2>Built to be checked</h2>
		<p>AI output is not ground truth, so the notebooks are designed to be audited. Every result comes with a record of the source file, the exact model and prompt, and the settings used. Models are pinned rather than silently updated, and long runs save their progress, so an interrupted session picks up where it left off.</p>

		<h2>Get started</h2>
		<p>All three tools open in Colab from <a href="https://github.com/fmadore/zmo-ai-pipelines" target="_blank" rel="noopener noreferrer">GitHub</a>. You need a Gemini API key, and can connect Google Drive to keep your results. For research material, use an institutional, billing-enabled account and obtain any ethics or data-protection approval the material needs: Google's terms differ by region and by whether the service is paid.</p>
	`,
	imageUrl: `/images/digital-humanities/zmo-ai-pipelines.webp`,
	order: 5,
	links: [{ url: 'https://github.com/fmadore/zmo-ai-pipelines', type: 'code' }],
	skills: [
		'Python',
		'Google Colab',
		'Gemini API',
		'LLM',
		'Prompt Engineering',
		'OCR',
		'HTR',
		'Audio transcription',
		'NLP',
		'Reproducible Research'
	],
	seoKeywords: [
		'AI tools',
		'transcription',
		'OCR',
		'HTR',
		'handwriting recognition',
		'Google Gemini',
		'qualitative research',
		'digital humanities',
		'text analysis',
		'audio transcription',
		'Google Colab',
		'multilingual AI',
		'provenance',
		'reproducible research'
	]
};
