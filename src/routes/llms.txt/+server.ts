import type { RequestHandler } from '@sveltejs/kit';
import { author, website, contact, address, socialLinks } from '$lib/data/siteConfig';
import { publicationsByDate } from '$lib/data/publications/index';
import { communicationsByDate } from '$lib/data/communications/index';
import { allDhProjects } from '$lib/data/digital-humanities';

// Prerender as a static text file for the agentic-browsing / llms.txt convention.
export const prerender = true;

/**
 * /llms.txt endpoint
 *
 * Implements the llms.txt convention (https://llmstxt.org/): a Markdown file that
 * gives large language models and AI agents a curated, machine-readable map of the
 * site. The file is generated from the same data sources as the rest of the site so
 * it never drifts out of sync.
 *
 * Structure follows the spec:
 *   - a single H1 with the site/project name (required)
 *   - a blockquote one-line summary
 *   - optional free-text context
 *   - H2 sections containing curated lists of links
 */

const SITE = website.url;

/** Curated research projects (mirrors the Research landing page). */
const researchProjects: Array<{ id: string; title: string }> = [
	{
		id: 'islams-peripheries-dh-ai-west-africa-central-asia',
		title:
			"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
	},
	{
		id: 'dh-ai-african-studies',
		title: 'Digital Humanities and Artificial Intelligence in African Studies'
	},
	{
		id: 'religious-activism-campuses-togo-benin',
		title: 'Religious Activism on Campuses in Togo and Benin'
	},
	{
		id: 'muslim-minorities-southern-cities-benin-togo',
		title: 'Muslim Minorities in Southern Cities of Benin and Togo'
	},
	{
		id: 'youth-womens-islamic-activism-cote-divoire-burkina-faso',
		title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso"
	}
];

/** Collapse whitespace so multi-line source strings render as single Markdown lines. */
const oneLine = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const GET: RequestHandler = async () => {
	const recentPublications = publicationsByDate.slice(0, 20);
	const recentCommunications = communicationsByDate.slice(0, 15);

	const lines: string[] = [];

	// Required H1 + blockquote summary.
	lines.push(`# ${author.name}`);
	lines.push('');
	lines.push(
		`> ${author.fullName} is a historian of Islam in francophone West Africa and a digital humanities specialist working as Data Curator at the "Africa Multiple" Cluster of Excellence, University of Bayreuth. This is his academic website, collecting his publications, conference activity, teaching, and digital humanities projects.`
	);
	lines.push('');
	lines.push(
		oneLine(`Frédérick Madore combines archival and field research with digital humanities and
		AI-enhanced computational pipelines to study Islam in francophone West Africa (notably Benin,
		Burkina Faso, Côte d'Ivoire, and Togo). His work covers Muslim activism on university campuses,
		Muslim minorities, religious authority, and the building of digital archives and tools for
		African studies.`)
	);
	lines.push('');
	lines.push(
		oneLine(`This file follows the llms.txt convention (https://llmstxt.org/) to help AI agents and
		large language models discover the most relevant pages. All URLs are absolute and resolve to
		the live site. Structured data (JSON-LD), an RSS feed, and an XML sitemap are also available.`)
	);
	lines.push('');

	// Key pages.
	lines.push('## Key pages');
	lines.push('');
	lines.push(`- [Home](${SITE}/): Overview, current position, and latest activity.`);
	lines.push(
		`- [Publications](${SITE}/publications): Complete, filterable list of books, journal articles, book chapters, edited volumes, reports, and encyclopedia entries, with citation export (BibTeX, APA, MLA, Chicago).`
	);
	lines.push(
		`- [Research](${SITE}/research): Current and past research projects on Islam in West Africa and digital humanities.`
	);
	lines.push(
		`- [Digital Humanities](${SITE}/digital-humanities): Digital archives, datasets, and AI tools, including the Islam West Africa Collection (IWAC).`
	);
	lines.push(
		`- [Activities](${SITE}/activities): News, talks, workshops, and other scholarly activities.`
	);
	lines.push(
		`- [Talks & Events](${SITE}/conference-activity): Conference papers, invited lectures, seminars, workshops, panels, podcasts, and presentation slides.`
	);
	lines.push(`- [Teaching](${SITE}/teaching): Courses, guest lectures, and syllabi.`);
	lines.push(`- [CV](${SITE}/cv): Full curriculum vitae.`);
	lines.push('');

	// Research projects.
	lines.push('## Research projects');
	lines.push('');
	for (const project of researchProjects) {
		lines.push(`- [${project.title}](${SITE}/research/${project.id})`);
	}
	lines.push('');

	// Digital humanities projects.
	lines.push('## Digital humanities projects');
	lines.push('');
	for (const project of allDhProjects) {
		const summary = project.shortDescription ? `: ${oneLine(project.shortDescription)}` : '';
		lines.push(`- [${project.title}](${SITE}/digital-humanities/${project.id})${summary}`);
	}
	lines.push('');

	// Selected recent publications.
	lines.push('## Selected recent publications');
	lines.push('');
	for (const pub of recentPublications) {
		lines.push(
			`- [${oneLine(pub.title)}](${SITE}/publications/${pub.id}) (${pub.year}) — ${pub.type}`
		);
	}
	lines.push('');

	// Selected recent talks & events.
	lines.push('## Selected recent talks & events');
	lines.push('');
	for (const comm of recentCommunications) {
		const venue = [comm.conference, comm.location].filter(Boolean).join(', ');
		const suffix = venue ? ` — ${oneLine(venue)}` : '';
		lines.push(
			`- [${oneLine(comm.title)}](${SITE}/communications/${comm.id}) (${comm.year})${suffix}`
		);
	}
	lines.push('');

	// Feeds and machine-readable data.
	lines.push('## Feeds and data');
	lines.push('');
	lines.push(`- [RSS feed](${SITE}/rss.xml): Latest activities and updates.`);
	lines.push(`- [XML sitemap](${SITE}/sitemap.xml): Full list of indexable pages.`);
	lines.push('');

	// Contact and scholarly profiles.
	lines.push('## Contact and profiles');
	lines.push('');
	lines.push(`- Email: ${contact.email}`);
	lines.push(
		`- Affiliation: ${address.institution} (${address.department}), ${address.city}, ${address.country}`
	);
	lines.push(`- [ORCID](${socialLinks.orcid.url})`);
	lines.push(`- [Google Scholar](${socialLinks.googleScholar.url})`);
	lines.push(`- [ResearchGate](${socialLinks.researchGate.url})`);
	lines.push(`- [GitHub](${socialLinks.github.url})`);
	lines.push(`- [LinkedIn](${socialLinks.linkedIn.url})`);
	lines.push(`- [Bluesky](${socialLinks.bluesky.url})`);
	lines.push('');

	const body = lines.join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=3600, s-maxage=3600',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
