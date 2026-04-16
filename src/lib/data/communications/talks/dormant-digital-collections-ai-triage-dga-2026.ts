import type { Communication } from '$lib/types/communication';

// Talk: Dormant Digital Collections, AI Triage: Lessons from the Islam West Africa Collection and Beyond
export const talkDormantDigitalCollectionsAiTriageDga2026: Communication = {
	id: 'dormant-digital-collections-ai-triage-dga-2026',
	title:
		'Dormant Digital Collections, AI Triage: Lessons from the Islam West Africa Collection and Beyond',
	authors: ['Frédérick Madore'],
	date: '6 May 2026',
	dateISO: '2026-05-06',
	year: 2026,
	conference: 'German Society of Asia Studies (DGA)',
	location: 'Leibniz-Zentrum Moderner Orient',
	country: 'Germany',
	type: 'lecture',
	language: 'English',
	abstract:
		'Recent advances in large language models (LLMs) have significantly improved AI capabilities for non-Western languages and scripts. Drawing on my experience building and curating the Islam West Africa Collection (IWAC), a digital repository of over 14,500 newspaper articles and archival documents in French, English, Arabic, Hausa, and Ewe, I present a practical walkthrough of an AI-assisted research pipeline: from raw scans to interactive visualisation. The challenges I encountered with West African sources have direct parallels for scholars working with Asian languages and scripts.\n\nI outline three stages of a "datafication" workflow: (1) text extraction through OCR and HTR, where multimodal LLMs increasingly outperform traditional engines on degraded documents in non-Western scripts; (2) data enrichment, including named entity recognition; and (3) data visualisation, where scholars without programming expertise can use AI-assisted coding to build interactive dashboards and explore their data.\n\nI demonstrate this workflow through a sentiment analysis dashboard analysing how 12,000+ IWAC newspaper articles portray Islam across five West African countries. Featuring temporal trends, cross-country comparisons, and multi-model agreement metrics, the dashboard was developed without writing manually a single line of code, through iterative dialogue with AI assistants. I also introduce Google\'s NotebookLM for source analysis and synthesis.\n\nWhere Arlette Farge (2013) located the "allure" of the archive in the slow, tactile encounter with the document, AI offers a pragmatic complement: rapid triage of the ever-growing personal collections of scans that scholars accumulate, serving as an intuition pump for thinking with sources rather than automating their consumption. Rather than a theoretical discussion, this talk is an invitation to experiment, turning dormant digital collections into active research instruments.',
	tags: [
		'AI',
		'Digital Humanities',
		'IWAC',
		'Large Language Models',
		'OCR',
		'Named Entity Recognition',
		'Sentiment Analysis',
		'West Africa',
		'Archives'
	],
	coordinates: {
		latitude: 52.42814222811816,
		longitude: 13.202338657893593
	},
	project:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
};
