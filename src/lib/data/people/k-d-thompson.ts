import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'k-d-thompson',
	name: 'K. D. Thompson',
	affiliations: [
		{
			institution: 'University of Wisconsin–Madison',
			years: [2024],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2024.ts#L62',
					label: 'Existing site data',
					quote:
						"name: 'K. D. Thompson',\n\t\t\trole: 'Chair',\n\t\t\taffiliation: 'University of Wisconsin-Madison'"
				}
			],
			institutionId: 'university-of-wisconsin-madison',
			note: 'Evidence supports 2024; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
