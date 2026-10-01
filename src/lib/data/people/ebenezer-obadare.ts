import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'ebenezer-obadare',
	name: 'Ebenezer Obadare',
	affiliations: [
		{
			institution: 'Council on Foreign Relations',
			years: [2024],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2024.ts#L42',
					label: 'Existing site data',
					quote:
						"name: 'Ebenezer Obadare',\n\t\t\trole: 'Critic',\n\t\t\taffiliation: 'Council on Foreign Relations'"
				}
			],
			note: 'Uncertain affiliation considered for 2024; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
