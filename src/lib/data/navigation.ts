import type { NavItem } from '#lib/types/navigation.ts';

/** A top-level entry, plus the paths outside its own that it stands for. */
export interface SiteNavItem extends NavItem {
	/**
	 * Further path prefixes that light this entry: records the section owns
	 * but files under another path (`menu/navMatch.ts`).
	 */
	match?: readonly string[];
}

// Root pathnames: the site deploys at the domain root (no `paths.base`), and
// these are read at module scope, where `resolve` has no page to be relative to.
export const navItems: SiteNavItem[] = [
	{
		name: 'Research',
		path: '/research',
		dropdown: [
			{
				name: "Islam's 'Peripheries': DH & AI in West Africa and Central Asia",
				path: '/research/islams-peripheries-dh-ai-west-africa-central-asia'
			},
			{
				name: 'Digital Humanities and AI in African Studies',
				path: '/research/dh-ai-african-studies'
			},
			{
				name: 'Digital Research Environment (Africa Multiple)',
				path: '/research/digital-research-environment'
			},
			{
				name: 'Religious Activism on Campuses in Togo and Benin',
				path: '/research/religious-activism-campuses-togo-benin'
			},
			{
				name: 'Muslim Minorities in Southern Cities of Benin and Togo',
				path: '/research/muslim-minorities-southern-cities-benin-togo'
			},
			{
				name: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso",
				path: '/research/youth-womens-islamic-activism-cote-divoire-burkina-faso'
			}
		]
	},
	{
		name: 'Publications',
		path: '/publications',
		dropdown: [
			{ name: 'All Publications', path: '/publications' },
			{ name: 'Visualisations', path: '/publications/visualisations' },
			{ name: 'Citations in Context', path: '/publications/citations' }
		]
	},
	{ name: 'Activities', path: '/activities' },
	{
		// One section, two groups: the applications are a section of the same
		// page (`#software`), not a page of their own, until there are enough of
		// them to need one (docs/digital-humanities-and-software.md). The page
		// spells the name out; the bar abbreviates it, because "Digital
		// Humanities & Software" pushes the theme toggle off a 1280px header.
		name: 'DH & Software',
		path: '/digital-humanities',
		dropdown: [
			{ name: 'All Projects & Software', path: '/digital-humanities' },
			{ name: 'Software & Applications', path: '/digital-humanities#software' },
			{ name: 'Islam West Africa Collection', path: 'https://islam.zmo.de/s/westafrica/' }
		]
	},
	{
		name: 'Talks & Events',
		path: '/conference-activity',
		// The index is `/conference-activity`; each talk's record is
		// `/communications/[id]`.
		match: ['/communications'],
		dropdown: [
			{ name: 'All Talks & Events', path: '/conference-activity' },
			{ name: 'Slides', path: '/conference-activity/slides' },
			{ name: 'Visualisations', path: '/conference-activity/visualisations' },
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
	{ name: 'Teaching', path: '/teaching' },
	{ name: 'CV', path: '/cv' }
];
