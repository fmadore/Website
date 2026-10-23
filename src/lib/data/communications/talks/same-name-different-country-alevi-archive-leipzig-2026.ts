import type { Communication } from '#lib/types/communication.ts';

// Talk: Same Name, Different Country: AI Agents, Human Oversight and Entity Disambiguation in the Islam West Africa Collection
export const talkSameNameDifferentCountryAleviArchiveLeipzig2026: Communication = {
	id: 'same-name-different-country-alevi-archive-leipzig-2026',
	title:
		'Same Name, Different Country: AI Agents, Human Oversight and Entity Disambiguation in the Islam West Africa Collection',
	authors: ['Frédérick Madore'],
	date: '3 December 2026',
	dateISO: '2026-12-03',
	year: 2026,
	conference: 'Data Modelling in the Project Alevi Archive',
	panelTitle: 'Panel 1',
	location: 'Sächsische Akademie der Wissenschaften zu Leipzig, Leipzig',
	country: 'Germany',
	type: 'workshop',
	language: 'English',
	abstract:
		"The Islam West Africa Collection (IWAC), curated by one person, holds more than 20,000 items and over 32 million words. Its press articles, Islamic publications and scholarly references are linked to a single set of more than 6,000 authority records for persons, organisations, places, events and subjects across six countries: Benin, Burkina Faso, Côte d'Ivoire, Niger, Nigeria and Togo. This authority file is the collection's model of identity: each record asserts that one entity exists, under one preferred name, with a type and a country. The same name often belongs to different people or bodies in different countries, and a script that matches names merges them. This talk discusses an AI-assisted workflow in which a language model extracts the names, deterministic scripts match them against the authority records, and AI agents reread each article to decide which country and which record every name refers to, or leave it unlinked, while the curator writes the rules the agents follow and approves every new record, merge or split. Cases where the workflow went wrong or could not decide show the modelling decisions it forced, such as putting the country into a record's title and accepting an unlinked mention as an outcome, and raise wider questions: how to keep a mention distinct from an identity, how to record who or what made a link, and what human oversight means at this scale.",
	tags: [
		'AI',
		'AI Agents',
		'Digital Humanities',
		'IWAC',
		'Entity Linking',
		'Large Language Models',
		'Metadata',
		'West Africa',
		'Archives'
	],
	url: 'https://aleviarchive.saw-leipzig.de',
	urlLabel: 'Project Website',
	coordinates: {
		latitude: 51.3328,
		longitude: 12.3684
	},
	project:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
};
