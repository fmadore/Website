import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const zmoAiPipelines: DigitalHumanitiesProject = {
	id: 'zmo-ai-pipelines',
	title: 'ZMO AI Pipelines',
	years: '2025',
	shortDescription:
		'Easy-to-use AI tools for researchers: transcribe audio/video, extract text from documents (OCR/HTR), and generate summaries using Google Gemini AI.',
	description:
		'<p>Easy-to-use AI tools for researchers and social scientists, powered by Google Gemini AI. All tools run as <a href="https://github.com/fmadore/zmo-ai-pipelines" target="_blank" rel="noopener noreferrer">Google Colab notebooks</a>—no installation required, just run them in your browser.</p>' +
		'<h3>Three Core Tools</h3>' +
		'<ul>' +
		'<li><strong>Audio & Video Transcription:</strong> Convert interviews, meetings, and lectures into text with speaker labels. Supports MP3, WAV, MP4, and more.</li>' +
		'<li><strong>OCR/HTR:</strong> Extract text from printed and handwritten documents (French, Arabic, multilingual). Works with PDFs and images.</li>' +
		'<li><strong>Text Summarization:</strong> Generate summaries and extract keywords from large documents. Batch process hundreds of files.</li>' +
		'</ul>' +
		'<p>Perfect for qualitative research, archival digitization, and text analysis. Free GPU access, easy sharing, and always up-to-date with the latest AI models.</p>' +
		'<p><a href="https://github.com/fmadore/zmo-ai-pipelines" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View on GitHub →</a></p>',
	imageUrl: `/images/digital-humanities/zmo-ai-pipelines.webp`,
	order: 4,
	skills: [
		'Python',
		'Google Gemini AI',
		'Google Colab',
		'NLP',
		'OCR',
		'HTR',
		'LLM',
		'Prompt Engineering'
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
		'Google Colab'
	]
};
