import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'david-maina',
	name: 'David Maina',
	affiliations: [
		{
			institution: 'British Institute of Eastern Africa',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/ecas-2025.ts#L59',
					label: 'Event record (this site’s data)',
					quote: "name: 'David Maina', affiliation: 'British Institute of Eastern Africa'"
				}
			],
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
