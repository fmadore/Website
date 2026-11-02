/**
 * Markdown twins of the digital humanities projects and applications:
 * `/digital-humanities.md` and `/digital-humanities/<id>.md`, with the
 * record's full description, addresses, methods and apparatus.
 */
import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';
import { author } from '#lib/data/siteConfig.ts';
import {
	applicationPlatform,
	applicationStatusLabel,
	splitProjectGroups
} from '#lib/utils/projectGroups.ts';
import { formatProjectPeriod } from '#lib/utils/projectPeriod.ts';
import { htmlToMarkdown } from './htmlToMarkdown';
import { bullets, document, entries, fields, inline, link, section } from './markdown';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';

const toMarkdown = (html: string) => htmlToMarkdown(html, { resolveHref: resolveLink });

/** Inline HTML (a review's reference, an award line) as one Markdown line. */
const inlineHtml = (html: string) => toMarkdown(html).replace(/\n+/g, ' ');

/** A labelled address, the HTML wrapped in a link to it. */
const linkedHtml = (html: string, url: string) =>
	`[${inlineHtml(html)}](${resolveLink(url).replace(/ /g, '%20')})`;

function addresses(project: DigitalHumanitiesProject): string {
	const seen = new Set<string>();
	return bullets(
		[
			project.linkUrl ? { url: project.linkUrl, label: 'Project site' } : undefined,
			...(project.links ?? []).map((address) => ({
				url: address.url,
				label: address.label ?? address.url.replace(/^https?:\/\/(?:www\.)?/, '').replace(/\/$/, '')
			}))
		].map((address) => {
			if (!address) return undefined;
			const url = resolveLink(address.url);
			if (seen.has(url)) return undefined;
			seen.add(url);
			return link(address.label, url);
		})
	);
}

function embeds(project: DigitalHumanitiesProject): string {
	return bullets(
		(project.embeddableContent ?? []).map((embed) => {
			const title = embed.title ?? (embed.type === 'image' ? embed.alt : embed.id);
			const target = embed.type === 'image' ? (embed.linkUrl ?? embed.src) : embed.src;
			const description = embed.description ? `: ${inlineHtml(embed.description)}` : '';
			return `${link(title, resolveLink(target))}${description}`;
		})
	);
}

/** An application's platform, status, licence and interface, as the record rail prints them. */
function applicationFields(project: DigitalHumanitiesProject): [string, string | undefined][] {
	const app = project.application;
	if (!app) return [];
	return [
		['Application', inline(applicationPlatform(app))],
		['Status', inline(applicationStatusLabel(app.status))],
		['Licence', app.licence && inline(app.licence)],
		[
			'Interface',
			app.interfaceLanguages?.length ? inline(app.interfaceLanguages.join(', ')) : undefined
		]
	];
}

/** `/digital-humanities/<id>.md` */
export function dhProjectMarkdown(project: DigitalHumanitiesProject): string {
	return document(
		`# ${inline(project.title)}`,
		fields([
			['Years', inline(formatProjectPeriod(project.years))],
			...applicationFields(project),
			['Methods', project.skills?.length ? inline(project.skills.join(', ')) : undefined],
			['Web page', pageUrl(`/digital-humanities/${project.id}`)]
		]),
		`*${inline(project.shortDescription)}*`,
		toMarkdown(project.description),
		section('Addresses', addresses(project)),
		section('Embedded views', embeds(project)),
		section('Award', project.award && inlineHtml(project.award)),
		section(
			'Related publication',
			project.publication && linkedHtml(project.publication.text, project.publication.url)
		),
		section(
			'Reviews',
			bullets(
				(project.reviews ?? []).map((review) => {
					const quote = review.quote ? `\n\n> ${inline(review.quote)}` : '';
					return `${linkedHtml(review.text, review.url)}${quote}`;
				})
			)
		)
	);
}

/** One record of the index: its title, period and summary. */
function indexEntry(project: DigitalHumanitiesProject): string {
	const title = link(project.title, markdownUrl(`/digital-humanities/${project.id}`));
	return `${title} · ${inline(formatProjectPeriod(project.years))}\n${inline(project.shortDescription)}`;
}

/**
 * `/digital-humanities.md`: every record, in the order the index prints them,
 * in its two groups.
 */
export function dhIndexMarkdown(records: readonly DigitalHumanitiesProject[]): string {
	const { projects, applications } = splitProjectGroups(records);
	return document(
		'# Digital humanities and software',
		`Digital archives, datasets, research tools and AI workflows built by ${author.name}, and open-source applications for researchers: ${entries(records.length)}. The [web page](${pageUrl('/digital-humanities')}) shows the same records a page at a time. Each title links to the record's Markdown version, with its full description. The same records are available as JSON at ${SITE}/api/digital-humanities.json, where each names its \`group\`.`,
		section('Digital humanities projects', bullets(projects.map(indexEntry))),
		section('Software and applications', bullets(applications.map(indexEntry)))
	);
}
