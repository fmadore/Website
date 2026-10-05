import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'marius-kothor',
	name: 'Marius Kothor',
	affiliations: [
		{
			institution: 'Harvard University',
			years: [2024],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/asa-2024.ts#L47',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Marius Kothor',\n\t\t\trole: 'Critic',\n\t\t\taffiliation: 'Harvard University'"
				}
			],
			institutionId: 'harvard-university',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
