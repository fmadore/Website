import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'rudiger-seesemann',
	name: 'Rüdiger Seesemann',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/ecas-2025.ts#L49',
					label: 'Existing site data',
					quote: "name: 'Rüdiger Seesemann', affiliation: 'University of Bayreuth'"
				}
			],
			institutionId: 'university-of-bayreuth',
			note: 'Evidence supports 2025; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
