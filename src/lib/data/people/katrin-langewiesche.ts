import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'katrin-langewiesche',
	name: 'Katrin Langewiesche',
	affiliations: [
		{
			institution: 'Johannes Gutenberg University Mainz',
			years: [2019],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/asa-2019.ts#L41',
					label: 'Existing site data',
					quote:
						"name: 'Katrin Langewiesche', affiliation: 'Johannes Gutenberg University of Mainz'"
				}
			],
			institutionId: 'johannes-gutenberg-university-mainz',
			note: 'Uncertain affiliation considered for 2019; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		},
		{
			institution: 'Johannes Gutenberg University Mainz',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/Pageboy/amalion/blob/a715afc3dab2a6e69f4839499f1b3c0e3a2900f4/_catalogue/rencontres-religieuses-et-dynamiques-sociales-au-burkina-faso.md',
					label: 'Publisher website source',
					quote:
						'Katrin Langewiesche est anthropologue à l’Institut d’ethnologie et des études africaines de l’Université Johannes Gutenberg de Mayence (Allemagne).'
				}
			],
			institutionId: 'johannes-gutenberg-university-mainz',
			note: 'Evidence supports 2021; continuous employment is not inferred. Amalion’s publisher catalogue contains an explicit author biography in the inspected historical revision dated 2021-06-28. The page identifies a 2019 book. This corroborates the institution in 2021 but does not independently verify the ASA 2019 affiliation date or any continuous employment interval.'
		}
	]
};
