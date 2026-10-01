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
					url: 'https://github.com/fmadore/Website/blob/main/static/images/communications/poster-launch-IWAC-hero.webp',
					label: 'Contemporaneous event poster',
					quote: 'Mauro Nobili (University of Illinois at Urbana-Champaign, USA)'
				}
			],
			institutionId: 'university-of-illinois-urbana-champaign',
			note: 'Evidence supports 2023; continuous employment is not inferred. Affiliation read directly from the ZMO launch poster dated 9 November 2023.'
		}
	]
};
