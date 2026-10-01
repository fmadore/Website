import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'yunus-dumbe',
	name: 'Yunus Dumbe',
	affiliations: [
		{
			institution: 'Kwame Nkrumah University of Science and Technology',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{\n\t\t\tname: 'Yunus Dumbe',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Kwame Nkrumah University of Science & Technology, Ghana'\n\t\t}"
				}
			],
			institutionId: 'kwame-nkrumah-university-of-science-and-technology',
			note: 'Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Kwame Nkrumah University of Science and Technology, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
