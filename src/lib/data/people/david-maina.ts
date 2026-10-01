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
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/ecas-2025.ts#L59',
					label: 'Existing site data',
					quote: "name: 'David Maina', affiliation: 'British Institute of Eastern Africa'"
				}
			],
			note: 'Uncertain affiliation considered for 2025; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
