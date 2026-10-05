import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'ashley-e-leinweber',
	name: 'Ashley E. Leinweber',
	affiliations: [
		{
			institution: 'Missouri State University',
			years: [2019],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/asa-2019.ts#L26',
					label: 'Event record (this site’s data)',
					quote: "name: 'Ashley E. Leinweber', affiliation: 'Missouri State University'"
				}
			],
			institutionId: 'missouri-state-university',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
