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
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/reaf-2026.ts#L66',
					label: 'Existing site data',
					quote:
						"name: 'Promise Dodzi Kpoglu',\n\t\t\t\t\taffiliation: 'LLACAN, Centre national de la recherche scientifique'"
				}
			],
			note: 'Uncertain affiliation considered for 2026; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
