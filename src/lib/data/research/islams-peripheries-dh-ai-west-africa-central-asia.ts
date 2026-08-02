import type { ResearchProject } from '$lib/types/research';

export const islamsPeripheries: ResearchProject = {
	id: 'islams-peripheries-dh-ai-west-africa-central-asia',
	title:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia",
	shortTitle: "Islam's 'Peripheries'",
	cardTitle: "Islam's 'Peripheries': DH & AI in West Africa and Central Asia",
	years: '2026-2027',
	current: true,
	order: 1,
	shortDescription:
		'Applying AI and computational methods to compare Islamic discourse and responses to modernity in the multilingual archives of West Africa and Central Asia.',
	imageSrc: 'islams-peripheries.webp',
	imageAlt:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia",
	subtitle:
		'Using AI to read two multilingual archives against each other — West African and Central Asian Islam, made computationally legible.',
	projectName:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia",
	programme: 'Open Up · 2026–28',
	regions: ['West Africa', 'Central Asia'],
	sourceLanguages: [
		'Russian',
		'Arabic',
		'Hausa',
		'Tajik',
		'Uzbek',
		'Persian',
		'Turki',
		'French',
		'Ewe',
		'Kabyè',
		'German'
	],
	ctas: [
		{
			label: 'Islam West Africa Collection',
			href: 'https://islam.zmo.de/s/westafrica/',
			external: true,
			primary: true
		},
		{
			label: 'Reinhard Eisener Collection',
			href: 'https://www.zmo.de/en/library/special-collection-1/translate-to-english-reinhard-eisener-bestand',
			external: true
		},
		{
			label: 'AI-NER-Validator · GitHub',
			href: 'https://github.com/fmadore/AI-NER-Validator',
			external: true
		}
	],
	seoDescription:
		'A research project using AI to unlock historical collections about Islamic communities in West Africa and Central Asia, focusing on comparative analysis of Islamic discourse and responses to modernity.',
	seoKeywords:
		'Digital Humanities, AI, West Africa, Central Asia, Islam, Archives, Comparative History, Algorithmic Analysis'
};

export default islamsPeripheries;
