import type { CitationContextSet } from '#lib/types/index.ts';

// Pilot run of 12 October 2026 (see src/lib/types/citationContext.ts).
export const spherePubliqueMusulmaneContexts: CitationContextSet = {
	id: 'sphere-publique-musulmane',
	model: 'Claude Haiku 5.5',
	extracted: '2026-10-12',
	contexts: [
		{
			citing: 'Q116777856',
			language: 'fr',
			status: 'unread'
		},
		{
			citing: 'Q124645581',
			language: 'fr',
			status: 'quoted',
			passages: [
				{
					text: 'En dehors du domaine doctrinal, il investit les questions sociales, culturelles et politiques (F. Madore, 2016b).',
					page: '13',
					citedAs: 'F. Madore, 2016b'
				}
			]
		},
		{
			citing: 'Q141697076',
			language: 'fr',
			status: 'bibliography-only'
		}
	]
};
