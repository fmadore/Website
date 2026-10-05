import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'aurelie-campana',
	name: 'Aurélie Campana',
	affiliations: [
		{
			institution: 'Université Laval',
			years: [2016],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/static/images/communications/evolutions-nouvelles-formes-islam-afrique-ouest-hero.webp',
					label: 'Contemporaneous event poster',
					quote: 'Aurélie Campana, Professeure, Dép de science politique, Université Laval'
				}
			],
			institutionId: 'universite-laval',
			reviewNote: 'Affiliation read directly from the organizer’s poster, dated 24 March 2016.'
		}
	]
};
