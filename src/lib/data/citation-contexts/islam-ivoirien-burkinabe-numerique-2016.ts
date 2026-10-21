import type { CitationContextSet } from '#lib/types/index.ts';

// Pilot run of 12 October 2026 (see src/lib/types/citationContext.ts).
export const islamIvoirienBurkinabeNumerique2016Contexts: CitationContextSet = {
	id: 'islam-ivoirien-burkinabe-numerique-2016',
	model: 'Claude Haiku 5.5',
	extracted: '2026-10-12',
	contexts: [
		{
			citing: 'Q123908032',
			language: 'en',
			status: 'quoted',
			passages: [
				{
					text: 'On this social network, where religious leaders, young influencers and Muslim faith-based media have accounts followed by thousands of subscribers, the messages, and videos—initially oriented towards the da’wa (literally "call to Islam" in Arabic)—included information and awareness around Covid-19.',
					page: '174',
					citedAs: 'note 3'
				}
			]
		},
		{
			citing: 'Q113528286',
			language: 'fr',
			status: 'quoted',
			passages: [
				{
					text: 'Entre 2000 et 2015, le nombre d’utilisateurs d’Internet a fortement progressé en Côte d’Ivoire passant de 40. à 5.. (Madore, 2016a).',
					page: '54–55',
					citedAs: 'Madore, 2016a'
				},
				{
					text: 'Le CNI que Marie Miran (2006) qualifia de superstructure disposait, en collaboration avec le COSIM, d’un site web (Madore, 2016a).',
					page: '60',
					citedAs: 'Madore, 2016a'
				}
			]
		},
		{
			citing: 'Q141697076',
			language: 'fr',
			status: 'bibliography-only'
		},
		{
			citing: 'Q141697091',
			language: 'id',
			status: 'quoted',
			passages: [
				{
					text: 'Dalam situasi ancaman ekstremisme yang terjadi pemanfaatan media digital dapat memungkinkan ulama dan organisasi Islam menyebarkan kontra-narasi secara cepat, terutama untuk menjangkau pemuda urban dan masyarakat yang aktif di ruang digital.',
					page: '242',
					citedAs: 'note 28'
				}
			]
		}
	]
};
