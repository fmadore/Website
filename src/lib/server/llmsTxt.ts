/**
 * `/llms.txt` — the site map for language models and agents
 * (https://llmstxt.org/, v2 as of August 2026).
 *
 * Shape, as the convention and Lighthouse's `llms-txt` audit want it: one H1,
 * a blockquote summary, free-text context, then H2 sections of
 * `- [name](url): notes` lists. The file stays short and every detail sits
 * behind a link: entries point at the Markdown twins (`/…/*.md`), which are
 * complete where the HTML indexes show a page at a time, so an agent can read
 * the whole record from here without parsing HTML.
 *
 * Generated from the same data modules as the pages, so it cannot drift.
 */
import { author, website, contact, address, socialLinks } from '$lib/data/siteConfig';
import { allPublications } from '$lib/data/publications/index';
import { allCommunications } from '$lib/data/communications/index';
import { activitiesByDate } from '$lib/data/activities';
import { allDhProjects } from '$lib/data/digital-humanities';
import { allResearchProjects } from '$lib/data/research';
import { formatProjectPeriod } from '$lib/utils/projectPeriod';
import { entries } from '$lib/server/markdown/markdown';
import { markdownUrl, pageUrl } from '$lib/server/markdown/site';

const SITE = website.url;

/** The site's own MCP server: source and README, and the installable bundle. */
export const MCP_SERVER = {
	readme: 'https://github.com/fmadore/Website/tree/main/mcp',
	releases: 'https://github.com/fmadore/Website/releases?q=mcp-v',
	bundle: 'frederickmadore-website.mcpb'
} as const;

/** Collapse whitespace so multi-line source strings render as single Markdown lines. */
const oneLine = (value: string): string => value.replace(/\s+/g, ' ').trim();

const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;

export function buildLlmsTxt(): string {
	const lines: string[] = [];
	const item = (name: string, url: string, notes?: string) =>
		lines.push(`- [${name}](${url})${notes ? `: ${oneLine(notes)}` : ''}`);
	const heading = (title: string) => lines.push('', `## ${title}`, '');

	// Required H1 + blockquote summary.
	lines.push(`# ${author.name}`, '');
	lines.push(
		`> ${author.fullName} is a historian of Islam in francophone West Africa and a digital humanities specialist, working as ${author.jobTitle} at the Cluster of Excellence "Africa Multiple", University of Bayreuth. This is his academic website: his publications, talks, research projects, digital humanities work, activities and CV.`
	);
	lines.push('');
	lines.push(
		oneLine(`His work combines archival and field research with digital humanities and AI-assisted
		pipelines to study Islam in francophone West Africa (notably Benin, Burkina Faso, Côte d'Ivoire
		and Togo): Muslim activism on university campuses, Muslim minorities, religious authority, and
		the building of digital archives and tools for African studies.`)
	);
	lines.push('');
	lines.push(
		oneLine(`Every content page has a Markdown version at its own address with \`.md\` added
		(\`/index.md\` for the home page), generated from the same records as the HTML and announced in
		each page's head with \`<link rel="alternate" type="text/markdown">\`. The links below point at
		those Markdown versions; drop \`.md\` for the web page. Where the web indexes show a page at a
		time, the Markdown lists are complete, and links inside them point at other Markdown versions.
		Each publication's record carries its full reference and a BibTeX entry, the two citation
		formats the site produces. All URLs are absolute.`)
	);

	heading('Sections');
	item(
		'Home',
		markdownUrl('/'),
		'Profile and current work, with the latest entries in the activity log.'
	);
	item(
		'Publications',
		markdownUrl('/publications'),
		`Complete list of ${count(allPublications.length, 'publication')} (books, journal articles,
		book chapters, edited volumes and special issues, reports, encyclopedia entries), newest first.
		Each links to its record: full reference, abstract, DOI or ISBN, reviews, citing works, and
		BibTeX.`
	);
	item(
		'Talks and events',
		markdownUrl('/conference-activity'),
		`Complete list of ${count(allCommunications.length, 'talk')}: conference papers, invited
		lectures, seminars, workshops, panels, posters and podcasts, with abstracts and programmes.`
	);
	item(
		'Activities',
		markdownUrl('/activities'),
		`Complete activity log, ${entries(activitiesByDate.length)}:
		news on publications, grants, talks, workshops and visits, each with its full text.`
	);
	item(
		'Research',
		markdownUrl('/research'),
		'Research projects on Islam in West Africa and on digital humanities and AI, each with its full narrative, grants, publications and talks.'
	);
	item(
		'Digital humanities',
		markdownUrl('/digital-humanities'),
		'Digital archives, datasets, tools and AI workflows, including the Islam West Africa Collection (IWAC) and AMIRA.'
	);
	item(
		'CV',
		markdownUrl('/cv'),
		'Full curriculum vitae: appointments, education, publications, grants, awards, talks, teaching, service and languages.'
	);
	item('Teaching', pageUrl('/teaching'), 'Courses and guest lectures (web page).');

	heading('Research projects');
	for (const project of allResearchProjects) {
		item(
			project.title,
			markdownUrl(`/research/${project.id}`),
			`${formatProjectPeriod(project.years)}. ${project.shortDescription}`
		);
	}

	heading('Digital humanities projects');
	for (const project of allDhProjects) {
		item(project.title, markdownUrl(`/digital-humanities/${project.id}`), project.shortDescription);
	}

	heading('Tools for agents');
	item(
		'MCP server',
		MCP_SERVER.readme,
		`A Model Context Protocol server over this site's records, by the same author: search and read
		publications, talks, activities, research and digital humanities projects, read the CV, and cite
		a work as BibTeX or a formatted reference. For Claude Desktop, install the one-click
		\`${MCP_SERVER.bundle}\` bundle from GitHub Releases (${MCP_SERVER.releases}); any other MCP
		client can run it over stdio, as the README explains.`
	);
	item(
		'WebMCP',
		'https://webmachinelearning.github.io/webmcp/',
		`Every page registers read-only WebMCP tools (\`document.modelContext\`) when the browser
		supports them, so an agent browsing the site can search publications and talks, read a record,
		list research projects and get contact details without reading the page.`
	);

	heading('Feeds and data');
	item(
		'JSON API index',
		`${SITE}/api/index.json`,
		'Discovery manifest for the static JSON API: every dataset, its size and its URL.'
	);
	item(
		'Publications (JSON)',
		`${SITE}/api/publications.json`,
		'Full publication records with identifiers, abstracts, citing works and reviews.'
	);
	item(
		'Talks (JSON)',
		`${SITE}/api/communications.json`,
		'Full talk records with venue, coordinates and programme.'
	);
	item(
		'Activities (JSON)',
		`${SITE}/api/activities.json`,
		'Activity entries, including the full body of each.'
	);
	item(
		'Research projects (JSON)',
		`${SITE}/api/research.json`,
		'Project records with their narrative and the ids of the publications, talks, grants and fieldwork that belong to each.'
	);
	item(
		'Digital humanities projects (JSON)',
		`${SITE}/api/digital-humanities.json`,
		'Project records with skills, awards and reviews.'
	);
	item(
		'CV (JSON)',
		`${SITE}/api/cv.json`,
		'Career record: appointments, education, grants, awards, teaching, service, fieldwork and languages.'
	);
	item('Activities RSS feed', `${SITE}${website.rssPath}`, 'Latest activity entries.');
	item('Publications RSS feed', `${SITE}/publications/rss.xml`, 'Latest publications.');
	item('XML sitemap', `${SITE}/sitemap.xml`, 'Every indexable web page.');

	heading('Contact and profiles');
	lines.push(`- Email: ${contact.email}`);
	lines.push(
		`- Affiliation: ${address.institution} (${address.department}), ${address.city}, ${address.country}`
	);
	for (const profile of [
		socialLinks.orcid,
		socialLinks.googleScholar,
		socialLinks.researchGate,
		socialLinks.github,
		socialLinks.linkedIn,
		socialLinks.bluesky
	]) {
		item(profile.name, profile.url);
	}

	heading('Optional');
	item(
		'Publication visualisations',
		pageUrl('/publications/visualisations'),
		'Charts of the publications by year, type, language and co-author (web page).'
	);
	item(
		'Talk visualisations',
		pageUrl('/conference-activity/visualisations'),
		'Maps and networks of the talks (web page).'
	);
	item(
		'Slides',
		pageUrl('/conference-activity/slides'),
		'Gallery of presentation slide decks, each linked to its talk (web page).'
	);

	return `${lines.join('\n')}\n`;
}
