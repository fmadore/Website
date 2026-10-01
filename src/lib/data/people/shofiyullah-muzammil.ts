import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'shofiyullah-muzammil',
	name: 'Shofiyullah Muzammil',
	affiliations: [
		{
			institution: 'UIN Sunan Kalijaga Yogyakarta',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{\n\t\t\tname: 'Shofiyullah Muzammil',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'UIN Sunan Kalijaga Yogyakarta, Indonesia'\n\t\t}"
				}
			],
			institutionId: 'uin-sunan-kalijaga-yogyakarta',
			note: 'Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Sunan Kalijaga Islamic University, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
