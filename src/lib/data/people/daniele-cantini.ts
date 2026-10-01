import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "daniele-cantini",
	"name": "Daniele Cantini",
	"affiliations": [
		{
			"institution": "Martin Luther University Halle-Wittenberg",
			"years": [
				2023
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts",
					"label": "Existing site data",
					"quote": "{\n\t\t\tname: 'Daniele Cantini',\n\t\t\trole: 'Discussant',\n\t\t\taffiliation: 'Martin-Luther-Universität Halle-Wittenberg, Germany'\n\t\t}"
				}
			],
			"institutionId": "martin-luther-university-halle-wittenberg",
			"note": "Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists University of Halle-Wittenberg, but has no per-person date; this does not independently verify the event-year affiliation."
		}
	]
};
