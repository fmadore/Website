/**
 * Markdown twins of the talks: `/conference-activity.md`, every talk the
 * HTML index pages through, and `/communications/<id>.md`, one talk with its
 * abstract, programme and participants.
 */
import type { Communication } from '$lib/types/communication';
import { author } from '$lib/data/siteConfig';
import { formatCommunicationCitation } from '$lib/utils/citationFormatter';
import { getContributorNames } from '$lib/utils/contributor';
import { joinNames } from '$lib/utils/nameUtils';
import {
	COMMUNICATION_TYPE_LIST_LABELS,
	COMMUNICATION_TYPE_SEO_LABELS
} from '$lib/utils/typeUtils';
import { paragraphsToMarkdown } from './htmlToMarkdown';
import { bullets, document, entries, fields, groupByYear, inline, link, section } from './markdown';
import { projectField } from './publications';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';

/** "Conference paper", "Lecture", "Podcast": sentence case, as the record describes itself. */
export function talkTypeLabel(type: Communication['type']): string | undefined {
	if (!type) return undefined;
	return COMMUNICATION_TYPE_SEO_LABELS[type] ?? COMMUNICATION_TYPE_LIST_LABELS[type] ?? type;
}

const text = (value: string | number | undefined | null) =>
	value === undefined || value === null || value === '' ? undefined : inline(value);

function programme(talk: Communication): string {
	return (talk.papers ?? [])
		.map((paper, index) => {
			const byline = paper.authors
				.map((person) =>
					person.affiliation ? `${person.name} (${person.affiliation})` : person.name
				)
				.join(', ');
			const head = `${index + 1}. **${inline(paper.title)}**${byline ? `, ${inline(byline)}` : ''}`;
			return paper.abstract ? `${head}\n\n   ${inline(paper.abstract)}` : head;
		})
		.join('\n');
}

function participants(talk: Communication): string {
	return bullets(
		(talk.participants ?? []).map((person) => {
			const role = person.role ? `${inline(person.role)}: ` : '';
			const affiliation = person.affiliation ? ` (${inline(person.affiliation)})` : '';
			return `${role}${inline(person.name)}${affiliation}`;
		})
	);
}

function talkLinks(talk: Communication): string {
	const seen = new Set<string>();
	return bullets(
		[
			{ label: talk.urlLabel ?? 'Presentation', url: talk.url },
			{ label: 'Slides', url: talk.slidesUrl },
			{ label: 'Poster (PDF)', url: talk.poster?.pdf },
			{ label: 'DOI', url: talk.doi ? `https://doi.org/${talk.doi}` : undefined },
			...(talk.additionalUrls ?? [])
		].map(({ label, url }) => {
			if (!url) return undefined;
			const address = resolveLink(url);
			if (seen.has(address)) return undefined;
			seen.add(address);
			return link(label, address);
		})
	);
}

/** `/communications/<id>.md` */
export function communicationMarkdown(talk: Communication): string {
	const language = Array.isArray(talk.language) ? talk.language.join(', ') : talk.language;
	return document(
		`# ${inline(talk.title)}`,
		fields([
			['Type', text(talkTypeLabel(talk.type))],
			['Speakers', text(joinNames(getContributorNames(talk.authors)))],
			['Event', text(talk.conference)],
			[talk.type === 'conference' ? 'Panel' : 'Series', text(talk.panelTitle)],
			['Episode', text(talk.episode)],
			['Location', text(talk.location)],
			['Country', text(talk.country)],
			['Date', text(talk.date)],
			['Language', text(language)],
			['DOI', talk.doi ? link(talk.doi, `https://doi.org/${talk.doi}`) : undefined],
			['Project', projectField(talk.project)],
			['Tags', text((talk.tags ?? []).join(', '))],
			['Web page', pageUrl(`/communications/${talk.id}`)]
		]),
		section(
			'Abstract',
			talk.abstract && paragraphsToMarkdown(talk.abstract, { resolveHref: resolveLink })
		),
		section(talk.type === 'panel' ? 'Papers in this panel' : 'Papers', programme(talk)),
		section('Participants', participants(talk)),
		section('Links', talkLinks(talk))
	);
}

/** `/conference-activity.md`: every talk, newest first, grouped by year. */
export function talksIndexMarkdown(talks: readonly Communication[]): string {
	return document(
		'# Talks and events',
		`Conference papers, lectures, seminars, workshops, panels, posters, podcasts and events by ${author.name}, newest first: ${entries(talks.length)}. This is the complete list; the [web page](${pageUrl('/conference-activity')}) shows it a page at a time, with filters and a map. Each title links to the talk's Markdown record, with its abstract and programme. The same records are available as JSON at ${SITE}/api/communications.json.`,
		...groupByYear(talks).map(([year, items]) =>
			section(
				year,
				bullets(
					items.map((talk) => {
						const title = link(talk.title, markdownUrl(`/communications/${talk.id}`));
						const type = talkTypeLabel(talk.type);
						return `${title}${type ? ` · ${inline(type)}` : ''}\n${inline(formatCommunicationCitation(talk))}`;
					})
				)
			)
		)
	);
}
