import { base } from '$app/paths';
import type { NavItem } from '$lib/types/navigation';

export const navItems: NavItem[] = [
	{
		name: 'Research',
		path: `${base}/research`,
		dropdown: [
			{
				name: "Islam's 'Peripheries': DH & AI in West Africa and Central Asia",
				path: `${base}/research/islams-peripheries-dh-ai-west-africa-central-asia`
			},
			{
				name: 'Digital Humanities and AI in African Studies',
				path: `${base}/research/dh-ai-african-studies`
			},
			{
				name: 'Religious Activism on Campuses in Togo and Benin',
				path: `${base}/research/religious-activism-campuses-togo-benin`
			},
			{
				name: 'Muslim Minorities in Southern Cities of Benin and Togo',
				path: `${base}/research/muslim-minorities-southern-cities-benin-togo`
			},
			{
				name: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso",
				path: `${base}/research/youth-womens-islamic-activism-cote-divoire-burkina-faso`
			}
		]
	},
	{
		name: 'Publications',
		path: `${base}/publications`,
		dropdown: [
			{ name: 'All Publications', path: `${base}/publications` },
			{ name: 'Visualisations', path: `${base}/publications/visualisations` }
		]
	},
	{ name: 'Activities', path: `${base}/activities` },
	{
		name: 'Digital Humanities',
		path: `${base}/digital-humanities`,
		dropdown: [{ name: 'Islam West Africa Collection', path: 'https://islam.zmo.de/s/westafrica/' }]
	},
	{
		name: 'Conference Activity',
		path: `${base}/conference-activity`,
		dropdown: [
			{ name: 'All Conference Activity', path: `${base}/conference-activity` },
			{ name: 'Visualisations', path: `${base}/conference-activity/visualisations` },
			{
				name: 'STIAS DH & AI Workshop 2026',
				path: 'https://fmadore.github.io/stias-dh-ai-workshop-2026/',
				rel: 'me'
			},
			{
				name: 'DH & AI in African Studies 2026',
				path: 'https://fmadore.github.io/dh-ai-african-studies-2026/',
				rel: 'me'
			}
		]
	},
	{ name: 'Teaching', path: `${base}/teaching` },
	{ name: 'CV', path: `${base}/cv` }
];
