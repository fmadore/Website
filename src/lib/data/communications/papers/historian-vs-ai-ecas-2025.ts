import type { Communication } from '$lib/types/communication';

export const historianVsAiEcas2025: Communication = {
	id: 'historian-vs-ai-ecas-2025',
	title: 'Historian vs AI: who reads and analyses archives best?',
	authors: ['Vincent Hiribarren', 'Frédérick Madore'],
	date: '26 June 2025',
	dateISO: '2025-06-26',
	year: 2025,
	conference: '10th European Conference of African Studies (ECAS)',
	panelTitle:
		'Digital Humanities (DH) and AI in African Studies: Opportunities, Challenges, and Decolonial Perspectives',
	location: 'Prague',
	country: 'Czech Republic',
	type: 'conference',
	language: 'English',
	abstract:
		"This paper evaluates the potential of large language models in relation to human source criticism, examining two contrasting cases. First, we revisit the British Colonial Office files on the Cameroon War (1957–63), comparing a historian's interpretations with the summaries and targeted answers on chronology, agency and motive provided by Gemini 2.5 Pro. Secondly, we scale up to the Islam West Africa Collection, comprising 24 million words from 15,000 newspaper clippings and 1,500 Islamic publications. This collection is processed through custom pipelines that repair OCR errors, reconstruct layout, tag entities and measure sentiment. While AI excels at scale and pattern detection, it also perpetuates colonial framings, highlighting the necessity of human oversight and contextual judgement. Rather than victory for one side, the evidence points to a collaborative model in which historians design prompts, audit outputs, and ensure that interpretation remains accountable, while machines handle routine, corpus-wide tasks.",
	tags: ['ECAS', 'AI', 'Archives', 'Digital Humanities', 'History', 'Cameroon', 'IWAC', 'West Africa'],
	image: 'images/communications/ecas-2025.webp',
	heroImage: {
		src: 'images/communications/ecas-2025-hero.webp',
		alt: '10th European Conference of African Studies (ECAS)'
	},
	coordinates: {
		latitude: 50.08896481219099,
		longitude: 14.416024062407818
	},
	project: 'Digital Humanities and AI in African Studies'
};
