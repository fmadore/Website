import type { ResearchProject } from '$lib/types/research';

export const islamsPeripheries: ResearchProject = {
	id: 'islams-peripheries-dh-ai-west-africa-central-asia',
	title:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia",
	shortTitle: "Islam's 'Peripheries'",
	cardTitle: "Islam's 'Peripheries': DH & AI in West Africa and Central Asia",
	years: '2026-2028',
	current: true,
	order: 1,
	shortDescription:
		'Testing what AI can do with two multilingual collections, to compare Islamic discourse and responses to modernity in West Africa and Central Asia.',
	imageSrc: 'islams-peripheries.webp',
	imageAlt:
		'Collage of three documents: a Central Asian newspaper page in Perso-Arabic script, and two West African Islamic magazine covers in Arabic and French',
	figCaption:
		'Fig. 1 — Documents from the two collections: the Central Asian press, and West African Islamic magazines in Arabic and French',
	subtitle:
		'Experimenting with AI on two multilingual collections, West African and Central Asian Islam, to read them at a scale close reading cannot reach, and to find where the methods mislead.',
	projectName:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia",
	programme: 'Open Up — New Research Spaces for the Humanities and Cultural Studies',
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
		}
	],
	seoDescription:
		'A research project testing what AI can do with two multilingual collections on Islamic communities in West Africa and Central Asia, and comparing Islamic discourse across the two regions.',
	seoKeywords:
		'Digital Humanities, AI, West Africa, Central Asia, Islam, Archives, Comparative History, Algorithmic Analysis'
};

export default islamsPeripheries;
