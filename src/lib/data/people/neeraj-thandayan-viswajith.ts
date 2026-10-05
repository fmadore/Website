import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'neeraj-thandayan-viswajith',
	name: 'Neeraj Thandayan Viswajith',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://data.africamultiple.uni-bayreuth.de/s/amira/item/37696',
					label: 'Institutional authority record',
					quote: 'Thandayan-Viswajith, Neeraj: University of Bayreuth'
				}
			],
			institutionId: 'university-of-bayreuth',
			reviewNote:
				'Undated source; excluded from historical maps until an affiliation year is established. AMIRA institutional authority record confirms affiliation, but supplies no affiliation dates; its applicability to the event year remains uncertain. Retrieved 2026-10-01.'
		}
	]
};
