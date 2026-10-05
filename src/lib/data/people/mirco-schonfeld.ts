import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'mirco-schonfeld',
	name: 'Mirco Schönfeld',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://data.africamultiple.uni-bayreuth.de/s/amira/item/392',
					label: 'Institutional authority record',
					quote: 'Schönfeld, Mirco: University of Bayreuth'
				}
			],
			institutionId: 'university-of-bayreuth',
			reviewNote:
				'Undated source; excluded from historical maps until an affiliation year is established. AMIRA institutional authority record confirms affiliation, but supplies no affiliation dates; its applicability to the event year remains uncertain. Retrieved 2026-10-01.'
		}
	]
};
