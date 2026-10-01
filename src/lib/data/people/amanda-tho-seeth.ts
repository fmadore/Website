import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'amanda-tho-seeth',
	name: 'Amanda tho Seeth',
	affiliations: [
		{
			institution: 'German Institute for Global and Area Studies',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{\n\t\t\tname: 'Amanda tho Seeth',\n\t\t\trole: 'Discussant',\n\t\t\taffiliation: 'German Institute for Global and Area Studies, Germany'\n\t\t}"
				}
			],
			institutionId: 'german-institute-for-global-and-area-studies',
			note: 'Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists German Institute for Global and Area Studies, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
