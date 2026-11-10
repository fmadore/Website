import type { Communication } from '#lib/types/communication.ts';

// Teaching: Introduction to Research Data Management (BIGSAS, Bayreuth)
export const talkIntroductionResearchDataManagementBigsas2026: Communication = {
	id: 'introduction-research-data-management-bigsas-2026',
	title: 'Introduction to Research Data Management',
	authors: [
		'Frédérick Madore',
		{ name: 'Anke Schürer-Ries', personId: 'anke-schurer-ries' },
		{ name: 'Neeraj Thandayan Viswajith', personId: 'neeraj-thandayan-viswajith' }
	],
	date: '5 November 2026',
	dateISO: '2026-11-05',
	year: 2026,
	conference: 'Bayreuth International Graduate School of African Studies (BIGSAS)',
	location: 'University of Bayreuth',
	country: 'Germany',
	type: 'workshop',
	teaching: {
		institution: 'Universität Bayreuth (Germany)',
		course: 'Bayreuth International Graduate School of African Studies (BIGSAS)',
		level: 'graduate'
	},
	language: 'English',
	abstract:
		'This session introduced doctoral researchers at the Bayreuth International Graduate School of African Studies (BIGSAS) to research data management. It set out four goals: to gain a better understanding of research data management across the data life cycle; to understand how a data management plan (DMP) works, with a hands-on exercise in filling one in; to learn how to organise research data through folder structures and file-naming conventions; and to see why metadata matters for finding, interpreting and reusing data.',
	tags: [
		'Research Data Management',
		'Data Management Plan',
		'Metadata',
		'FAIR Data',
		'Digital Research Environment',
		'Training'
	],
	image: 'images/communications/BIGSAS-logo.webp',
	heroImage: {
		src: 'images/communications/BIGSAS-logo-hero.webp',
		alt: 'Logo of the Bayreuth International Graduate School of African Studies (BIGSAS): a stylised eye over a yellow and ochre field, with “BIGSAS” in large capitals and the school’s full name beneath.'
	},
	coordinates: {
		latitude: 49.9427,
		longitude: 11.5674
	},
	project: 'Digital Research Environment (University of Bayreuth)'
};
