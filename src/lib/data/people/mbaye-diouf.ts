import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "mbaye-diouf",
	"name": "Mbaye Diouf",
	"affiliations": [
		{
			"institution": "Cheikh Anta Diop University",
			"years": [
				2026
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/reaf-2026.ts#L54",
					"label": "Existing site data",
					"quote": "name: 'Mbaye Diouf', affiliation: 'Université Cheikh Anta Diop de Dakar'"
				}
			],
			"institutionId": "cheikh-anta-diop-university",
			"note": "Evidence supports 2026; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected."
		}
	]
};
