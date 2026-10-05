import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'andree-ann-brassard',
	name: 'Andrée-Ann Brassard',
	affiliations: [
		{
			institution: 'Université Laval',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://scienceetbiencommun.pressbooks.pub/projetthese/chapter/faire-une-table-des-matieres/',
					label: 'Publisher publication author affiliation',
					quote: 'Andrée-Ann Brassard est chargée de cours à l’Université Laval (Québec, Canada).'
				}
			],
			institutionId: 'universite-laval',
			role: 'Chargée de cours',
			reviewNote:
				'Publisher chapter contains an explicit coauthor biography in its author presentation. The chapter is bibliographically dated 2021; the live chapter has no separate biography revision date. Supports affiliation stated for this chapter, not a continuous tenure.'
		}
	]
};
