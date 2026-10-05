import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'muhammad-wildan',
	name: 'Muhammad Wildan',
	affiliations: [
		{
			institution: 'UIN Sunan Kalijaga Yogyakarta',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Muhammad Wildan',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'UIN Sunan Kalijaga Yogyakarta, Indonesia'\n\t\t}"
				}
			],
			institutionId: 'uin-sunan-kalijaga-yogyakarta',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Sunan Kalijaga Islamic University, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
