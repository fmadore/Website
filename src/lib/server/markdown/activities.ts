/**
 * Markdown twins of the activity log: `/activities.md`, every entry the HTML
 * log pages through, and `/activities/<id>.md`, one entry with its full body
 * converted from the HTML it is authored in.
 */
import type { Activity } from '$lib/types/activity';
import { author } from '$lib/data/siteConfig';
import { ACTIVITY_TYPE_BADGE_LABELS } from '$lib/utils/typeUtils';
import { htmlToMarkdown } from './htmlToMarkdown';
import { citationsToLinks } from './svelteProse';
import { bullets, document, entries, fields, groupByYear, inline, link, section } from './markdown';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';

/** The record's kind in sentence case: "Research grant", "Academic visit". */
export function activityTypeLabel(activity: Pick<Activity, 'type'>): string {
	const label = activity.type
		? (ACTIVITY_TYPE_BADGE_LABELS[activity.type] ?? activity.type)
		: 'Activity';
	return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

/**
 * An activity body as Markdown. A body may cite a publication or talk inline
 * (`<ItemReference id>`), which becomes a link carrying the citation the
 * page prints, as in the research prose.
 */
export function activityBodyMarkdown(content: string): string {
	return htmlToMarkdown(citationsToLinks(content), { resolveHref: resolveLink });
}

function activityLinks(activity: Activity): string {
	const seen = new Set<string>();
	const primary =
		activity.urlLabel ?? (activity.type === 'publication' ? 'Open publication' : 'Open the source');
	return bullets(
		[
			{ label: primary, url: activity.url },
			{ label: activity.pdfTitle ?? 'Document (PDF)', url: activity.pdfPath },
			...(activity.additionalUrls ?? [])
		].map(({ label, url }) => {
			if (!url) return undefined;
			const address = resolveLink(url);
			if (seen.has(address)) return undefined;
			seen.add(address);
			return link(label, address);
		})
	);
}

/** `/activities/<id>.md` */
export function activityMarkdown(activity: Activity): string {
	return document(
		`# ${inline(activity.title)}`,
		fields([
			['Type', inline(activityTypeLabel(activity))],
			['Date', activity.date && inline(activity.date)],
			['Tags', activity.tags?.length ? inline(activity.tags.join(', ')) : undefined],
			['Web page', pageUrl(`/activities/${activity.id}`)]
		]),
		activity.description && `*${inline(activity.description)}*`,
		activity.content && activityBodyMarkdown(activity.content),
		section('Links', activityLinks(activity))
	);
}

/** `/activities.md`: every entry, newest first, grouped by year. */
export function activitiesIndexMarkdown(activities: readonly Activity[]): string {
	return document(
		'# Activities',
		`News and notes from ${author.name}'s work: publications, grants, talks, workshops and visits, newest first: ${entries(activities.length)}. This is the complete log; the [web page](${pageUrl('/activities')}) shows it a page at a time, with filters. Each title links to the entry's Markdown record, with its full text. The same records are available as JSON at ${SITE}/api/activities.json.`,
		...groupByYear(activities).map(([year, items]) =>
			section(
				year,
				bullets(
					items.map((activity) => {
						const title = link(activity.title, markdownUrl(`/activities/${activity.id}`));
						const meta = [activityTypeLabel(activity), activity.date].filter(Boolean).join(', ');
						return `${title} · ${inline(meta)}\n${inline(activity.description)}`;
					})
				)
			)
		)
	);
}
