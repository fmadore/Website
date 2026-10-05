import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'kai-kresse',
	name: 'Kai Kresse',
	affiliations: [
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2023],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/static/images/communications/poster-launch-IWAC-hero.webp',
					label: 'Contemporaneous event poster',
					quote: 'Kai Kresse (Leibniz-Zentrum Moderner Orient)'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			reviewNote: 'Affiliation read directly from the ZMO launch poster dated 9 November 2023.'
		}
	]
};
