/**
 * Markdown twins of the digital humanities projects: `/digital-humanities.md`
 * and `/digital-humanities/<id>.md`, with the project's full description,
 * addresses, methods and apparatus.
 */
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import { author } from '$lib/data/siteConfig';
import { formatProjectPeriod } from '$lib/utils/projectPeriod';
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

/** `/digital-humanities/<id>.md` */
export function dhProjectMarkdown(project: DigitalHumanitiesProject): string {
	return document(
		`# ${inline(project.title)}`,
		fields([
			['Years', inline(formatProjectPeriod(project.years))],
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

/** `/digital-humanities.md`: every project, in the order the index prints them. */
export function dhIndexMarkdown(projects: readonly DigitalHumanitiesProject[]): string {
	return document(
		'# Digital humanities',
		`Digital archives, datasets, research tools and AI workflows built by ${author.name}: ${entries(projects.length)}. The [web page](${pageUrl('/digital-humanities')}) shows the same projects a page at a time. Each title links to the project's Markdown record, with its full description. The same records are available as JSON at ${SITE}/api/digital-humanities.json.`,
		bullets(
			projects.map((project) => {
				const title = link(project.title, markdownUrl(`/digital-humanities/${project.id}`));
				return `${title} · ${inline(formatProjectPeriod(project.years))}\n${inline(project.shortDescription)}`;
			})
		)
	);
}
