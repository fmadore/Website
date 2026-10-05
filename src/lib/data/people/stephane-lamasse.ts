import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'stephane-lamasse',
	name: 'Stéphane Lamassé',
	affiliations: [
		{
			institution: 'Université Paris 1 Panthéon-Sorbonne',
			years: [2026],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/reaf-2026.ts#L93',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Stéphane Lamassé',\n\t\t\t\t\taffiliation: 'LAMOP, PIREH, Université Paris 1 Panthéon-Sorbonne'"
				}
			],
			institutionId: 'universite-paris-1-pantheon-sorbonne',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
