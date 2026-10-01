import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'yssoufou-traore',
	name: 'Yssoufou Traoré',
	affiliations: [
		{
			institution: 'Université Félix Houphouët-Boigny',
			years: [2018],
			confidence: 'verified',
			sources: [
				{
					url: 'https://journals.openedition.org/etudesafricaines/21880',
					label: 'Publisher publication author affiliation',
					quote:
						'Yssoufou Traoré — Université Félix Houphouët-Boigny, Abidjan (Côte d’Ivoire) (CIRAM), Université Laval (Canada) ;'
				},
				{
					url: 'https://doi.org/10.4000/etudesafricaines.21880',
					label: 'Publication DOI'
				}
			],
			note: 'Evidence supports 2018; continuous employment is not inferred. Publisher author section explicitly names Université Félix Houphouët-Boigny for Yssoufou Traoré in issue229, published 2018-03-15 (online 2020-03-15). Only the unambiguous Félix Houphouët-Boigny affiliation is normalized as verified. The appended CIRAM/Laval phrase appears duplicated from Madore’s preceding author record and remains uncertain. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
