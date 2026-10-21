import type { CitationContextSet } from '#lib/types/index.ts';

// Pilot run of 12 October 2026 (see src/lib/types/citationContext.ts).
export const islamUniversityCampusesCoteDivoire2023Contexts: CitationContextSet = {
	id: 'islam-university-campuses-cote-divoire-2023',
	model: 'Claude Haiku 5.5',
	extracted: '2026-10-12',
	contexts: [
		{
			citing: 'Q141697091',
			language: 'id',
			status: 'quoted',
			passages: [
				{
					text: 'para ulama sejak awal sudah menegaskan bahwa terorisme tidak memiliki legitimasi dalam Islam.',
					page: '242',
					citedAs: 'note 27'
				}
			]
		}
	]
};
