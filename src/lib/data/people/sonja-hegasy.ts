import type { Person } from '#lib/types/person.ts';

export const person: Person = {
	id: 'sonja-hegasy',
	name: 'Sonja Hegasy',
	affiliations: [
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://www.frederickmadore.com/communications/digital-humanities-ai-social-sciences-zmo-2026',
					label: 'Talk record (this site’s data)',
					quote: 'Sonja Hegasy (ZMO), co-presenter at the ZMO Projektversammlung, 12 November 2026'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			reviewNote:
				'Affiliation stated by Frédérick Madore (ZMO colleague) when adding the co-presenters on 2026-11-06.'
		}
	]
};
