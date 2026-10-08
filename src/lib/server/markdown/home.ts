/**
 * `/index.md`: the home page's Markdown twin — the nameplate, the prose read
 * from the page's own markup, the latest entries in the log, and a way into
 * every other twin.
 */
import { author, address, contact, socialLinks } from '$lib/data/siteConfig';
import { activitiesByDate } from '$lib/data/activities';
import { allPublications } from '$lib/data/publications/index';
import { allCommunications } from '$lib/data/communications/index';
import { bullets, document, entries, fields, inline, link, section } from './markdown';
import { markdownUrl, pageUrl, SITE } from './site';
import { pageProseMarkdown } from './svelteProse';

/** How many log entries the home page's rail prints. */
const LATEST_ACTIVITIES = 5;

export function homeMarkdown(): string {
	const latest = activitiesByDate.slice(0, LATEST_ACTIVITIES);

	return document(
		`# ${inline(author.fullName)}`,
		`*${inline(author.tagline)}*`,
		pageProseMarkdown('/src/routes/+page.svelte', 'ContentBody'),
		section(
			'Latest activities',
			bullets(
				latest.map(
					(activity) =>
						`${link(activity.title, markdownUrl(`/activities/${activity.id}`))} · ${inline(activity.date)}`
				)
			),
			`${link(`All ${entries(activitiesByDate.length)} in the log`, markdownUrl('/activities'))}`
		),
		section(
			'Sections',
			bullets([
				`${link('Publications', markdownUrl('/publications'))}: the complete list, ${entries(allPublications.length)}, each with its reference and BibTeX.`,
				`${link('Talks and events', markdownUrl('/conference-activity'))}: every talk, panel, workshop and podcast, ${entries(allCommunications.length)}.`,
				`${link('Activities', markdownUrl('/activities'))}: news and notes, ${entries(activitiesByDate.length)}.`,
				`${link('Research', markdownUrl('/research'))}: research projects and their narratives.`,
				`${link('Digital humanities', markdownUrl('/digital-humanities'))}: archives, datasets, tools and AI workflows.`,
				`${link('CV', markdownUrl('/cv'))}: the full curriculum vitae.`,
				`${link('Teaching', pageUrl('/teaching'))}: courses and guest lectures (web page).`,
				`${link('llms.txt', `${SITE}/llms.txt`)}: a map of the site for language models, with the JSON API and the MCP server.`
			])
		),
		section(
			'Contact',
			fields([
				['Email', `<${contact.email}>`],
				[
					'Affiliation',
					inline(
						[address.department, address.institution, address.city, address.country]
							.filter(Boolean)
							.join(', ')
					)
				],
				[
					'Profiles',
					[
						socialLinks.orcid,
						socialLinks.googleScholar,
						socialLinks.github,
						socialLinks.bluesky,
						socialLinks.linkedIn
					]
						.map((profile) => link(profile.name, profile.url))
						.join(', ')
				]
			])
		)
	);
}
