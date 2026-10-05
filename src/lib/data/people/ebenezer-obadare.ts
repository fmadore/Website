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
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/asa-2024.ts#L42',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Ebenezer Obadare',\n\t\t\trole: 'Critic',\n\t\t\taffiliation: 'Council on Foreign Relations'"
				}
			],
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
