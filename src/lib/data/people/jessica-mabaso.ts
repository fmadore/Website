import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'jessica-mabaso',
	name: 'Jessica Mabaso',
	affiliations: [
		{
			institution: 'South African Centre for Digital Language Resources (SADiLaR)',
			years: [2024],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/DHCSSza/escalator-sadilar/blob/65d6f2113fbb44b0ab23f9e48086144e56b6a550/content/dh-ignite/contact.md',
					label: 'Institutional website source',
					quote: 'Jessica Mabaso (SADiLaR)'
				}
			],
			reviewNote:
				'The SADiLaR ESCALATOR programme website explicitly lists this person as SADiLaR. The pinned source revision is dated 2024-08-27. This is historical corroboration for 2024, not independent verification for the ECAS 2025 event or current employment.'
		},
		{
			institution: 'South African Centre for Digital Language Resources (SADiLaR)',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/ecas-2025.ts#L72',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Jessica Mabaso',\n\t\t\t\t\taffiliation: 'South African Centre for Digital Language Resources'"
				}
			],
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		}
	]
};
