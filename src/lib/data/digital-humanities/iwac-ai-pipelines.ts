import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacAiPipelines: DigitalHumanitiesProject = {
	id: 'iwac-ai-pipelines',
	title: 'IWAC AI Pipelines',
	years: '2026',
	shortDescription:
		'Python workflows for processing the Islam West Africa Collection using Large Language Models—automating OCR, NER, transcription, and summarization at scale.',
	description:
		'<p>With over 14,500 items and 28 million words—the equivalent of more than 300 books—the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer">Islam West Africa Collection</a> has long exceeded what any individual researcher could process manually. What began as years of fieldwork accumulation risked becoming "digital clutter": thousands of documents gathered but never fully accessible.</p>' +
		'<p>These open-source Python pipelines address that challenge by integrating Large Language Models (Google Gemini, OpenAI, Mistral) into document processing workflows. They automate labor-intensive tasks that would otherwise consume months of work—or simply never get done. The goal is not to replace scholarly judgment, but to make large documentary collections tractable so researchers can focus on interpretation rather than data wrangling.</p>' +
		'<h3>What the pipelines do</h3>' +
		'<ul>' +
		'<li><strong>OCR extraction & correction:</strong> Extract text from PDF scans using multimodal vision models, and correct errors in legacy OCR including ALTO XML with coordinate preservation</li>' +
		'<li><strong>Named entity recognition:</strong> Identify people, places, and organizations with authority reconciliation and fuzzy matching to handle variant spellings common in West African names</li>' +
		'<li><strong>Summarization:</strong> Generate French summaries for document discovery across large collections</li>' +
		'<li><strong>Audio & video processing:</strong> Transcribe interviews and oral histories (including Hausa content) and summarize videos with visual descriptions</li>' +
		'<li><strong>Handwritten text recognition:</strong> Read manuscripts in French, Arabic, or mixed scripts</li>' +
		'<li><strong>Magazine indexing:</strong> Extract and index individual articles from digitized periodicals with complex layouts</li>' +
		'</ul>' +
		'<h3>AI-NER-Validator</h3>' +
		'<p>A companion web application (<a href="https://github.com/fmadore/AI-NER-Validator" target="_blank" rel="noopener noreferrer">AI-NER-Validator</a>) provides quality control for automatically extracted entities. Researchers can review articles with AI-extracted entities side by side, validate or reject each entity, add missing ones manually, and export clean CSV files. The tool ensures human oversight remains central to the workflow.</p>' +
		'<h3>Open source</h3>' +
		'<p>The code is open source and documented for adaptation. As lightweight open-source models improve, these workflows could eventually run locally without relying on commercial APIs—an important consideration for data sovereignty and long-term sustainability.</p>' +
		'<h3>Limitations</h3>' +
		'<p>These tools are research aids, not replacements for scholarly judgment. LLMs operate as black boxes with algorithmic opacity. Models trained predominantly on Western data may misrepresent African contexts and naming conventions. Unlike traditional OCR, which signals failure through garbled text, AI-generated errors appear as fluent prose—shifting the burden from fixing visible mistakes to detecting hidden ones. Effective use requires domain expertise and familiarity with the source material.</p>' +
		'<p><a href="https://github.com/fmadore/iwac-ai-pipelines" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View on GitHub</a></p>',
	imageUrl: `/images/digital-humanities/iwac-ai-pipelines.webp`,
	order: 2,
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
