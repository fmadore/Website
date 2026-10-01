import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'naomi-bell',
	name: 'Naomi Bell',
	affiliations: [
		{
			institution: 'Institut des mondes africains (IMAF)',
			years: [2026],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/reaf-2026.ts#L91',
					label: 'Existing site data',
					quote: "name: 'Naomi Bell', affiliation: 'Institut des Mondes Africains (IMAF)'"
				}
			],
			note: 'Uncertain affiliation considered for 2026; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
