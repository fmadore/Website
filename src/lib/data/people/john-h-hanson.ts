import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'john-h-hanson',
	name: 'John H. Hanson',
	affiliations: [
		{
			institution: 'Indiana University Bloomington',
			years: [2019],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/asa-2019.ts#L56',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'John H. Hanson',\n\t\t\trole: 'Discussant',\n\t\t\taffiliation: 'Indiana University-Bloomington'"
				}
			],
			institutionId: 'indiana-university-bloomington',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
