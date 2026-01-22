import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacAiPipelines: DigitalHumanitiesProject = {
	id: 'iwac-ai-pipelines',
	title: 'IWAC AI Pipelines',
	years: '2026',
	shortDescription:
		'Python workflows for processing the Islam West Africa Collection using Large Language Models—automating OCR, NER, transcription, and summarization at scale.',
	description:
		'<p>The <em>IWAC AI Pipelines</em> are Python workflows designed to process the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer">Islam West Africa Collection</a> using Large Language Models from Google Gemini, OpenAI, and Mistral. At 14,500+ items and 28 million words, traditional manual processing is no longer viable—these pipelines automate labor-intensive tasks that would otherwise leave much of the corpus inaccessible.</p>' +
		'<h3>Processing Pipelines</h3>' +
		'<ul>' +
		'<li><strong>OCR Extraction & Correction:</strong> Extract text from PDF scans using Gemini vision or Mistral Document AI, and fix errors in machine-generated text including ALTO XML with coordinate preservation.</li>' +
		'<li><strong>Named Entity Recognition:</strong> Extract people, places, and organizations with authority reconciliation and fuzzy matching.</li>' +
		'<li><strong>Summarization:</strong> Generate French summaries for document discovery and batch process large collections.</li>' +
		'<li><strong>Audio & Video Processing:</strong> Transcribe interviews and oral histories (including Hausa content), and summarize videos with visual descriptions.</li>' +
		'<li><strong>Handwritten Text Recognition:</strong> Read manuscripts in French, Arabic, or mixed languages.</li>' +
		'<li><strong>Magazine Article Extraction:</strong> Index individual articles within digitized periodicals.</li>' +
		'</ul>' +
		'<h3>AI-NER-Validator</h3>' +
		'<p>A companion web application (<a href="https://github.com/fmadore/AI-NER-Validator" target="_blank" rel="noopener noreferrer">AI-NER-Validator</a>) provides quality control for automatically extracted entities. It allows researchers to review articles with AI-extracted entities side by side, validate or reject each entity, add missing entities manually, track progress across sessions, and export clean CSV files with validated data. The Docker-based tool ensures human oversight remains central to the workflow.</p>' +
		'<h3>Limitations & Critical Perspective</h3>' +
		'<p>These tools are research aids, not replacements for scholarly judgment. LLMs operate as black boxes with algorithmic opacity. Models trained predominantly on Western data may misrepresent African contexts and naming conventions. Unlike traditional OCR which signals failure through garbled text, AI-generated errors appear as fluent prose—shifting the burden from fixing visible mistakes to detecting hidden ones. Effective use requires domain expertise and prior familiarity with the source material.</p>' +
		'<p><a href="https://github.com/fmadore/iwac-ai-pipelines" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View on GitHub</a></p>',
	imageUrl: `/images/digital-humanities/iwac-ai-pipelines.webp`,
	order: 6,
	skills: [
		'Python',
		'LLM',
		'Prompt Engineering',
		'OCR',
		'HTR',
		'NER',
		'NLP',
		'Docker',
		'Omeka S API'
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
		'archival processing'
	]
};
