import type { ResearchProject } from '$lib/types/research';

export const religiousActivismCampuses: ResearchProject = {
	id: 'religious-activism-campuses-togo-benin',
	title: 'Religious Activism on Campuses in Togo and Benin',
	shortTitle: 'Religious Activism on Campuses',
	years: '2021-2024',
	order: 3,
	shortDescription:
		"Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
	imageSrc: 'campus-activism.webp',
	imageAlt: 'Religious Activism on Campuses in Togo and Benin',
	audioSrc: 'notebooklm/religious_activism_campus.mp3',
	projectName: 'Religious Activism on Campuses in Togo and Benin',
	// The page carries its own Funding panel, so the rail must not repeat it.
	showFunding: false
};

export default religiousActivismCampuses;
