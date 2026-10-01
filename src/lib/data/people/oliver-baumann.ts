import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'oliver-baumann',
	name: 'Oliver Baumann',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://data.africamultiple.uni-bayreuth.de/s/amira/item/30661',
					label: 'Institutional authority record',
					quote: 'Baumann, Oliver: University of Bayreuth'
				}
			],
			institutionId: 'university-of-bayreuth',
			note: 'Undated source; excluded from historical maps until an affiliation year is established. AMIRA institutional authority record confirms affiliation, but supplies no affiliation dates; its applicability to the event year remains uncertain. Retrieved 2026-10-01.'
		}
	]
};
