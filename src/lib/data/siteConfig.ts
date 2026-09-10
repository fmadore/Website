/**
 * Centralized site configuration
 * Single source of truth for contact info, social links, and author details
 */

// Types for social links
export interface SocialLink {
	name: string;
	url: string;
	icon: string;
	username?: string; // For display purposes (e.g., 'fmadore' for GitHub)
}

// Types for address
export interface Address {
	institution: string;
	institutionAbbreviation: string;
	institutionUrl: string;
	department?: string; // Optional department/research center line
	street?: string; // Optional street address
	room?: string; // Optional room number
	postalCode: string;
	city: string;
	country: string;
	mapsUrl: string;
}

// Types for author info
export interface AuthorInfo {
	name: string;
	fullName: string; // With title
	position: string;
	positionShort: string; // Without institution name
	jobTitle: string; // Precise current role for Person JSON-LD
	kicker: string; // Two-word standing epithet — the masthead dateline and the home <title>
	tagline: string; // Descriptive hero standfirst — subject + affiliation, not a role list
	nationality: string; // Used in Person JSON-LD structured data
}

export const author: AuthorInfo = {
	name: 'Frédérick Madore',
	fullName: 'Frédérick Madore, Ph.D.',
	position: 'Historian | Digital Humanities & AI | Data Curator, University of Bayreuth',
	positionShort: 'Historian & Data Curator',
	jobTitle: 'Data Curator',
	kicker: 'Historian & Digital Humanist',
	tagline:
		'Historian of Islam in francophone West Africa, working with digital humanities and AI · Data Curator, Cluster of Excellence “Africa Multiple”, University of Bayreuth',
	nationality: 'Canada'
};

/**
 * Curated research topics for the Person JSON-LD `knowsAbout` field.
 * This list is editorial (it summarises the research profile for search
 * engines), so it lives here rather than being derived from tag data.
 */
export const researchTopics: string[] = [
	'Islam',
	'West Africa',
	'Muslim Societies',
	'History',
	'Religious Activism',
	'Secularism',
	'Muslim Politics',
	'Digital Humanities',
	'Benin',
	'Togo',
	"Côte d'Ivoire",
	'Burkina Faso'
];

export const address: Address = {
	institution: 'Universität Bayreuth',
	institutionAbbreviation: 'UBT',
	institutionUrl: 'https://www.africamultiple.uni-bayreuth.de/en/index.html',
	department: 'Forschungszentrum für Afrikastudien',
	street: 'Universitätsstraße 30',
	room: 'Room 1.08',
	postalCode: '95447',
	city: 'Bayreuth',
	country: 'Germany',
	mapsUrl: 'https://maps.app.goo.gl/ZLoe7FJALUqaQ23m6'
};

/**
 * Stable external entities used to reconcile the Person schema with linked
 * data. Keep volatile biography in the local CV datasets; this small list is
 * only for durable identity concepts that benefit from an explicit `@id`.
 */
export const linkedData = {
	person: {
		wikidataId: 'Q55725595'
	},
	employer: {
		name: address.institution,
		url: 'https://www.uni-bayreuth.de/en/',
		wikidataId: 'Q702482'
	},
	nationality: {
		name: author.nationality,
		wikidataId: 'Q16'
	},
	occupations: [
		{ name: 'Historian', wikidataId: 'Q201788' },
		{ name: 'Digital Humanist', wikidataId: 'Q107619185' }
	]
} as const;

/**
 * Human-edited profile metadata; update only when the biography changes.
 * A plain `YYYY-MM-DD` is the intended form — `createWebPageSchema` widens it
 * to the full ISO 8601 date-time Google's Profile page report demands.
 */
export const profile = {
	dateModified: '2026-08-12'
} as const;

export const contact = {
	email: 'frederick.madore@uni-bayreuth.de'
};

export const website = {
	url: 'https://www.frederickmadore.com',
	domain: 'www.frederickmadore.com',
	rssPath: '/rss.xml'
};

// Social links with icons for Iconify (registered in $lib/icons.ts; academic
// profiles use the Academicons set so the trio shares one optical weight)
export const socialLinks = {
	email: {
		name: 'Email',
		url: `mailto:${contact.email}`,
		icon: 'mdi:email',
		username: contact.email
	} as SocialLink,
	linkedIn: {
		name: 'LinkedIn',
		url: 'https://www.linkedin.com/in/frederickmadore/',
		icon: 'mdi:linkedin',
		username: 'frederickmadore'
	} as SocialLink,
	github: {
		name: 'GitHub',
		url: 'https://github.com/fmadore',
		icon: 'mdi:github',
		username: 'fmadore'
	} as SocialLink,
	orcid: {
		name: 'ORCID',
		url: 'https://orcid.org/0000-0003-0959-2092',
		icon: 'academicons:orcid',
		username: '0000-0003-0959-2092'
	} as SocialLink,
	googleScholar: {
		name: 'Google Scholar',
		url: 'https://scholar.google.com/citations?user=naUK0RQAAAAJ',
		icon: 'academicons:google-scholar'
	} as SocialLink,
	researchGate: {
		name: 'ResearchGate',
		url: 'https://www.researchgate.net/profile/Frederick-Madore',
		icon: 'academicons:researchgate'
	} as SocialLink,
	bluesky: {
		name: 'Bluesky',
		url: 'https://bsky.app/profile/fmadore.bsky.social',
		icon: 'simple-icons:bluesky',
		username: 'fmadore.bsky.social'
	} as SocialLink
};

// Pre-grouped links for the Footer colophon. Four groups, in reading order:
// how to reach the person, where the scholarly record is indexed, where he
// posts, and how a machine reads this site. `withAddress` marks the one group
// that also prints the postal <address> block (rendered by Footer.svelte from
// `address`, so the street lines stay a record rather than becoming one
// six-line anchor). The Footer is the only consumer.
export interface FooterGroup {
	title: string;
	links: SocialLink[];
	withAddress?: boolean;
}

export const socialGroups: FooterGroup[] = [
	{
		title: 'Contact',
		links: [socialLinks.email],
		withAddress: true
	},
	{
		title: 'Academic',
		links: [socialLinks.googleScholar, socialLinks.orcid, socialLinks.researchGate]
	},
	{
		title: 'Social',
		links: [socialLinks.linkedIn, socialLinks.github, socialLinks.bluesky]
	},
	{
		// The machine-readable exits this site already ships — the colophon of a
		// site that claims to be a structured record should say how to read it
		// without a browser.
		title: 'The record',
		links: [
			{ name: 'RSS feed', url: website.rssPath, icon: 'mdi:rss' },
			{ name: 'Sitemap', url: '/sitemap.xml', icon: 'lucide:map' },
			{ name: 'llms.txt', url: '/llms.txt', icon: 'lucide:file-text' },
			{
				name: 'MCP server',
				url: 'https://github.com/fmadore/Website/tree/main/mcp',
				icon: 'mdi:github'
			},
			{ name: 'Style guide', url: '/style-guide', icon: 'lucide:contrast' }
		]
	}
];
