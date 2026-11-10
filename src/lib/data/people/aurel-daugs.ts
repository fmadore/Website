import type { Person } from '#lib/types/person.ts';

export const person: Person = {
	id: 'aurel-daugs',
	name: 'Aurel Daugs',
	affiliations: [
		{
			institution: 'Humboldt University of Berlin',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://www.frederickmadore.com/communications/soundscapes-digital-history-madore',
					label: 'Podcast record (this site’s data)',
					quote:
						'Aurel Daugs (Humboldt-Universität zu Berlin), co-creator of the Soundscapes of Digital History episode with Frédérick Madore'
				}
			],
			institutionId: 'humboldt-university-of-berlin',
			reviewNote:
				'Affiliation stated by Frédérick Madore when adding the Soundscapes of Digital History episode on 2026-11-10.'
		}
	]
};
