import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const zmoAiPipelines: DigitalHumanitiesProject = {
	id: 'zmo-ai-pipelines',
	title: 'ZMO AI Pipelines',
	years: '2025',
	shortDescription:
		'Google Colab notebooks that make AI accessible for researchers: transcribe audio/video, extract text from documents (OCR/HTR), and generate summaries—no installation required.',
	description:
		'<p>AI is already effective at handling time-consuming, repetitive tasks—transcribing interviews, deciphering handwriting, summarizing documents. Offloading this work creates more time for what matters: analysis and interpretation.</p>' +
		'<p>But technical barriers often get in the way. Managing Python environments and dependencies can be daunting, and many social scientists don\'t identify as "power users" of computers.</p>' +
		'<p>These Google Colab notebooks bridge that gap. The principle is simplicity: if you can click "Play," you can run these workflows. No installation required—everything runs in your browser. At the same time, all code is fully visible for anyone who wants to inspect, adapt, or extend it.</p>' +
		'<h3>Three Core Tools</h3>' +
		'<ul>' +
		'<li><strong>Audio & Video Transcription:</strong> Convert interviews, focus groups, and lectures into text with speaker identification. Supports MP3, WAV, MP4, and more.</li>' +
		'<li><strong>OCR/HTR:</strong> Extract text from printed and handwritten documents. Specialized modes for French and Arabic handwriting, plus multilingual support.</li>' +
		'<li><strong>Text Summarization:</strong> Generate summaries and extract keywords from large documents. Batch process hundreds of files via Excel integration.</li>' +
		'</ul>' +
		'<h3>Beyond Western Languages</h3>' +
		'<p>While most AI tools perform well on English and major European languages, these pipelines show promising results on more demanding material:</p>' +
		'<ul>' +
		'<li><strong>Handwritten text:</strong> Arabic manuscripts</li>' +
		'<li><strong>Printed documents:</strong> Hindi, Old Tatar</li>' +
		'<li><strong>Audio transcription:</strong> Hausa, Arabic, Swahili, Kurmanji</li>' +
		'</ul>' +
		'<p>The notebooks handle long archival files page by page and automatically chunk lengthy audio recordings.</p>' +
		'<h3>Get Started</h3>' +
		'<p>All tools are <a href="https://github.com/fmadore/zmo-ai-pipelines" target="_blank" rel="noopener noreferrer">available on GitHub</a>. You\'ll need a Gemini API key and optionally connect Google Drive to save your results.</p>',
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
