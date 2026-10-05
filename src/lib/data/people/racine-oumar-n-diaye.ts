import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'racine-oumar-n-diaye',
	name: "Racine Oumar N'Diaye",
	affiliations: [
		{
			institution: 'Université de Nouadhibou',
			years: [2026],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/reaf-2026.ts#L78',
					label: 'Event record (this site’s data)',
					quote: "name: \"Racine Oumar N'Diaye\", affiliation: 'Université de Nouadhibou'"
				}
			],
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
