import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'munyao-kilolo',
	name: 'Munyao Kilolo',
	affiliations: [
		{
			institution: 'Ituĩka',
			years: [2026],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/talks/ai-africa-symposium-kansas-2026.ts',
					label: 'Existing site data',
					quote:
						"{\n\t\t\tname: 'Munyao Kilolo',\n\t\t\trole: 'Panellist, Panel II: African Writers Discuss AI',\n\t\t\taffiliation: 'Translator and Editor at Ituĩka'\n\t\t}"
				}
			],
			note: 'Uncertain affiliation considered for 2026; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Existing role description identifies the organization Ituĩka, but neither the affiliation nor a public institutional address was independently verified. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
