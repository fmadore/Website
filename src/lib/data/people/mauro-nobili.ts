import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'mauro-nobili',
	name: 'Mauro Nobili',
	affiliations: [
		{
			institution: 'University of Illinois Urbana-Champaign',
			years: [2023],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/static/images/communications/poster-launch-IWAC-hero.webp',
					label: 'Contemporaneous event poster',
					quote: 'Mauro Nobili (University of Illinois at Urbana-Champaign, USA)'
				}
			],
			institutionId: 'university-of-illinois-urbana-champaign',
			reviewNote: 'Affiliation read directly from the ZMO launch poster dated 9 November 2023.'
		}
	]
};
