import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "marius-kothor",
	"name": "Marius Kothor",
	"affiliations": [
		{
			"institution": "Harvard University",
			"years": [
				2024
			],
			"confidence": "uncertain",
			"sources": [
				{
					"url": "https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2024.ts#L47",
					"label": "Existing site data",
					"quote": "name: 'Marius Kothor',\n\t\t\trole: 'Critic',\n\t\t\taffiliation: 'Harvard University'"
				}
			],
			"institutionId": "harvard-university",
			"note": "Evidence supports 2024; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected."
		}
	]
};
