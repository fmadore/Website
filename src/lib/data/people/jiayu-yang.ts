import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'jiayu-yang',
	name: 'Jiayu Yang',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/jiayu-yang.ts',
					label: 'Organizer website source',
					quote: "name: 'Jiayu Yang',\n\taffiliation: {\n\t\ten: 'University of Bayreuth'"
				}
			],
			institutionId: 'university-of-bayreuth',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment. Evidence is a same-year workshop biography, not this communication’s own program.'
		}
	]
};
