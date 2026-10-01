import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "sadia-mahmood",
	"name": "Sadia Mahmood",
	"affiliations": [
		{
			"institution": "Quaid-i-Azam University",
			"years": [
				2023
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts",
					"label": "Existing site data",
					"quote": "{\n\t\t\tname: 'Sadia Mahmood',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Quaid-i-Azam University, Islamabad, Pakistan'\n\t\t}"
				}
			],
			"institutionId": "quaid-i-azam-university",
			"note": "Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Quaid-i-Azam University, but has no per-person date; this does not independently verify the event-year affiliation."
		}
	]
};
