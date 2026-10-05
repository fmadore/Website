import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'benjamin-n-lawrance',
	name: 'Benjamin N. Lawrance',
	affiliations: [
		{
			institution: 'University of Arizona',
			years: [2024],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/asa-2024.ts#L52',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Benjamin N. Lawrance',\n\t\t\trole: 'Critic',\n\t\t\taffiliation: 'University of Arizona'"
				}
			],
			institutionId: 'university-of-arizona',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
