import type { CitationContextSet } from '#lib/types/index.ts';

// Pilot run of 12 October 2026 (see src/lib/types/citationContext.ts).
export const religiosityUniversityCampusesContexts: CitationContextSet = {
	id: 'religiosity-university-campuses',
	model: 'Claude Haiku 5.5',
	extracted: '2026-10-12',
	contexts: [
		{
			citing: 'Q124645581',
			language: 'fr',
			status: 'quoted',
			passages: [
				{
					text: 'Que ce soit aux États-Unis (C. Cherry, DB. DeBerg, et A. Porterfield, 2001) ou en Afrique (A. Sounaye et F. Madore, 2023 ; V. Favier, 2022 ; S.S. Timbely, 2022 ; L. A. Villalón, M. Bodian, et B. Soares, 2020 ; L. Le Pape, 2014), ces nouveaux phénomènes ont suscité la curiosité des chercheurs en sciences sociales qu’ils soient anthropologues, historiens ou sociologues.',
					page: '1',
					citedAs: 'A. Sounaye et F. Madore, 2023'
				},
				{
					text: 'Que ça soit en Occident (C. Cherry et al. 2001 ; B. Senelle, 2005), en Asie ou en Afrique (A. Sounaye et F. Madore, 2023 ; M. Bello Adamou et A. Oumarou, 2022 ; S. S. Timbely 2022 ; V. Favier, 2022 ; A. Idrissa 2021 ; L. A. Villalón et al. 2020 ; A. Sounaye 2018 ; K. Amo 2018), les idéologies marxistes sont en perte de vitesse, si toutefois elles n’ont pas disparu dans certaines universités.',
					page: '21',
					citedAs: 'A. Sounaye et F. Madore, 2023'
				},
				{
					text: 'Une partie des données de ce chapitre a inspiré la rédaction d’un chapitre dans un ouvrage collectif (A. Sounaye et F. Madore, 2023).',
					page: '139',
					citedAs: 'A. Sounaye et F. Madore, 2023',
					inNote: true
				}
			]
		}
	]
};
