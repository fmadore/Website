import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "olutayo-c-adesina",
	"name": "Olutayo C. Adesina",
	"affiliations": [
		{
			"institution": "University of Ibadan",
			"years": [
				2023
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts",
					"label": "Existing site data",
					"quote": "{ name: 'Olutayo C. Adesina', role: 'Speaker', affiliation: 'University of Ibadan, Nigeria' }"
				}
			],
			"institutionId": "university-of-ibadan",
			"note": "Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained."
		}
	]
};
