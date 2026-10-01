import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'jessica-r-holland',
	name: 'Jessica R. Holland',
	affiliations: [
		{
			institution: 'British School at Athens',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/ecas-2025.ts#L58',
					label: 'Existing site data',
					quote: "name: 'Jessica R. Holland', affiliation: 'British School at Athens'"
				}
			],
			note: 'Evidence supports 2025; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
