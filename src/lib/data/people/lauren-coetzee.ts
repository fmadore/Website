import type { Person } from '$lib/types/person';

export const person: Person = {
	"id": "lauren-coetzee",
	"name": "Lauren Coetzee",
	"affiliations": [
		{
			"institution": "University of Luxembourg",
			"years": [
				2026
			],
			"confidence": "verified",
			"sources": [
				{
					"url": "https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/lauren-coetzee.ts",
					"label": "Organizer website source",
					"quote": "name: 'Lauren Coetzee',\n\taffiliation: {\n\t\ten: 'University of Luxembourg'"
				}
			],
			"institutionId": "university-of-luxembourg",
			"note": "Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment."
		}
	]
};
