import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "john-h-hanson",
	"name": "John H. Hanson",
	"affiliations": [
		{
			"institution": "Indiana University Bloomington",
			"years": [
				2019
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2019.ts#L56",
					"label": "Existing site data",
					"quote": "name: 'John H. Hanson',\n\t\t\trole: 'Discussant',\n\t\t\taffiliation: 'Indiana University-Bloomington'"
				}
			],
			"institutionId": "indiana-university-bloomington",
			"note": "Evidence supports 2019; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected."
		}
	]
};
