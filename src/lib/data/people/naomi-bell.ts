import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'naomi-bell',
	name: 'Naomi Bell',
	affiliations: [
		{
			institution: 'Institut des mondes africains (IMAF)',
			years: [2026],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/reaf-2026.ts#L91',
					label: 'Event record (this site’s data)',
					quote: "name: 'Naomi Bell', affiliation: 'Institut des Mondes Africains (IMAF)'"
				}
			],
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
