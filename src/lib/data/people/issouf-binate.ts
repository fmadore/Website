import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'issouf-binate',
	name: 'Issouf Binaté',
	affiliations: [
		{
			institution: 'Université Alassane Ouattara',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/launch-islam-west-africa-collection.ts',
					label: 'Existing site event record',
					quote:
						"name: 'Issouf Binaté', role: 'Speaker', affiliation: \"Université Alassane Ouattara, Côte d'Ivoire\""
				}
			],
			institutionId: 'universite-alassane-ouattara',
			note: 'Uncertain affiliation considered for 2023; continuous employment is not inferred. Affiliation exists in an event record. Publisher verification and exact publication-year coverage remain unconfirmed; no employment interval inferred. DOI/publisher response redirects to a ZMO proof-of-work challenge despite HTTP200. Existing event affiliation is contextual and has not been verified against the 2023 chapter.'
		},
		{
			institution: 'Université Alassane Ouattara',
			years: [2023],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/static/images/communications/poster-launch-IWAC-hero.webp',
					label: 'Contemporaneous event poster',
					quote: 'Issouf Binaté (Université Alassane Ouattara, Côte d’Ivoire)'
				}
			],
			institutionId: 'universite-alassane-ouattara',
			note: 'Evidence supports 2023; continuous employment is not inferred. Affiliation read directly from the ZMO launch poster dated 9 November 2023.'
		}
	]
};
