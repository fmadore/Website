import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'leonardo-a-villalon',
	name: 'Leonardo A. Villalón',
	affiliations: [
		{
			institution: 'University of Florida',
			years: [2024],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/asa-2024.ts#L57',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Leonardo A. Villalón',\n\t\t\trole: 'Critic',\n\t\t\taffiliation: 'University of Florida'"
				}
			],
			institutionId: 'university-of-florida',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
