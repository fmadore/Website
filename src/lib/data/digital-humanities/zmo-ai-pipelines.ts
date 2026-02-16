import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const zmoAiPipelines: DigitalHumanitiesProject = {
	id: 'zmo-ai-pipelines',
	title: 'ZMO AI Pipelines',
	years: '2025',
	shortDescription:
		'Google Colab notebooks that make AI accessible for researchers: transcribe audio/video, extract text from documents (OCR/HTR), and generate summaries—no installation required.',
	description:
		'<p>Tasks such as transcribing interviews, deciphering handwriting and summarising documents devour research time. AI can handle them well, but technical barriers often get in the way. Many social scientists are intimidated by the prospect of managing Python environments and dependencies, as they don\'t see themselves as "power users".</p>' +
		'<p>These Google Colab notebooks remove that barrier. If you can click "Play," you can run them. No installation, no setup — everything runs in your browser. The code stays fully visible for anyone who wants to inspect, adapt, or extend it.</p>' +
		'<h3>Three Core Tools</h3>' +
		'<ul>' +
		'<li><strong>Audio & Video Transcription:</strong> Convert interviews, focus groups, and lectures into text with speaker identification. Supports MP3, WAV, MP4, and more.</li>' +
		'<li><strong>OCR/HTR:</strong> Extract text from printed and handwritten documents. Specialised modes for French and Arabic handwriting, plus multilingual support.</li>' +
		'<li><strong>Text Summarisation:</strong> Generate summaries and extract keywords from large documents. Batch-process hundreds of files via Excel integration.</li>' +
		'</ul>' +
		'<h3>Beyond Western Languages</h3>' +
		'<p>Most AI tools perform well on English and major European languages. These pipelines tackle more demanding material:</p>' +
		'<ul>' +
		'<li><strong>Handwritten text:</strong> Arabic manuscripts</li>' +
		'<li><strong>Printed documents:</strong> Hindi, Old Tatar</li>' +
		'<li><strong>Audio transcription:</strong> Hausa, Arabic, Swahili, Kurmanji</li>' +
		'</ul>' +
		'<p>The notebooks handle long archival files page by page and automatically chunk lengthy audio recordings.</p>' +
		'<h3>Get Started</h3>' +
		'<p>All tools are <a href="https://github.com/fmadore/zmo-ai-pipelines" target="_blank" rel="noopener noreferrer">available on GitHub</a>. You need a Gemini API key and can optionally connect Google Drive to save your results.</p>',
	imageUrl: `/images/digital-humanities/zmo-ai-pipelines.webp`,
	order: 4,
	skills: [
		'Python',
		'Google Colab',
		'NLP',
		'OCR',
		'HTR',
		'LLM',
		'Prompt Engineering',
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
		'multilingual AI'
	]
};
