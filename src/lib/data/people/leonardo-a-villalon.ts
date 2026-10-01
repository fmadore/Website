import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "leonardo-a-villalon",
	"name": "Leonardo A. Villalón",
	"affiliations": [
		{
			"institution": "University of Florida",
			"years": [
				2024
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2024.ts#L57",
					"label": "Existing site data",
					"quote": "name: 'Leonardo A. Villalón',\n\t\t\trole: 'Critic',\n\t\t\taffiliation: 'University of Florida'"
				}
			],
			"institutionId": "university-of-florida",
			"note": "Evidence supports 2024; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected."
		}
	]
};
