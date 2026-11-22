import type { ResearchProject } from '#lib/types/research.ts';

export const religiousActivismCampuses: ResearchProject = {
	id: 'religious-activism-campuses-togo-benin',
	title: 'Religious Activism on Campuses in Togo and Benin',
	shortTitle: 'Religious Activism on Campuses',
	years: '2021-2024',
	order: 4,
	shortDescription:
		"Examining how Christian and Muslim student associations transformed university life at the Université de Lomé and the Université d'Abomey-Calavi.",
	imageSrc: 'campus-activism.webp',
	imageAlt:
		'A two-storey cream building with green trim, arches and an outside staircase on bare sandy ground, framed by two large trees; a small green-domed tower is at left.',
	audioSrc: 'notebooklm/religious_activism_campus.mp3',
	projectName: 'Religious Activism on Campuses in Togo and Benin',
	// The page carries its own Funding panel, so the rail must not repeat it.
	showFunding: false,
	seoDescription:
		"Five decades of Christian and Muslim student associations at the Université de Lomé and the Université d'Abomey-Calavi, from one-party rule to mass enrolment."
};

export default religiousActivismCampuses;
