import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'promise-dodzi-kpoglu',
	name: 'Promise Dodzi Kpoglu',
	affiliations: [
		{
			institution: 'LLACAN, Centre national de la recherche scientifique',
			years: [2026],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/reaf-2026.ts#L66',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Promise Dodzi Kpoglu',\n\t\t\t\t\taffiliation: 'LLACAN, Centre national de la recherche scientifique'"
				}
			],
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
