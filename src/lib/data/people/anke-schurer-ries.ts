import type { Person } from '#lib/types/person.ts';

export const person: Person = {
	id: 'anke-schurer-ries',
	name: 'Anke Schürer-Ries',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://data.africamultiple.uni-bayreuth.de/s/amira/item/37695',
					label: 'Institutional authority record',
					quote: 'Schürer-Ries, Anke: University of Bayreuth'
				}
			],
			institutionId: 'university-of-bayreuth',
			reviewNote:
				'AMIRA authority record is undated. The 2026 affiliation was confirmed by Frédérick Madore on 2026-11-06 and by the BIGSAS research data management session they co-taught at the University of Bayreuth on 2026-11-05 (Digital Research Environment, EXC Africa Multiple).'
		}
	]
};
