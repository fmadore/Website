/**
 * The site as the Markdown twins see it: which pages have a twin, where a
 * link inside a twin should point, and how a twin is served.
 *
 * Links between twins point at twins, so an agent that starts at
 * `/llms.txt` can walk the whole record without parsing a line of HTML; a
 * page with no twin (the visualisations, the slides gallery) is linked as the
 * page itself. Every address is absolute on the production origin, like the
 * rest of the machine-readable surface (`/llms.txt`, `/api/*.json`), so a
 * twin quoted out of context still resolves.
 */
import { website } from '$lib/data/siteConfig';
import { allPublications } from '$lib/data/publications/index';
import { allCommunications } from '$lib/data/communications/index';
import { allActivities } from '$lib/data/activities';
import { allDhProjects } from '$lib/data/digital-humanities';
import { allResearchProjects } from '$lib/data/research';
import { markdownPathFor } from '$lib/utils/markdownTwin';

export const SITE = website.url;
const SITE_ORIGIN = new URL(SITE).origin;

/** The section pages with a twin; `MARKDOWN_TWIN_ROUTE_IDS` names their routes. */
export const SECTION_TWIN_PATHS = [
	'/',
	'/publications',
	'/conference-activity',
	'/activities',
	'/research',
	'/digital-humanities',
	'/cv'
] as const;

/** Every page with a twin, by pathname: exactly what the `*.md` routes prerender. */
export const TWIN_PAGE_PATHS: ReadonlySet<string> = new Set([
	...SECTION_TWIN_PATHS,
	...allPublications.map(({ id }) => `/publications/${id}`),
	...allCommunications.map(({ id }) => `/communications/${id}`),
	...allActivities.map(({ id }) => `/activities/${id}`),
	...allResearchProjects.map(({ id }) => `/research/${id}`),
	...allDhProjects.map(({ id }) => `/digital-humanities/${id}`)
]);

/** The page at `path` on the live site. */
export function pageUrl(path: string): string {
	return path === '/' ? `${SITE}/` : `${SITE}${path}`;
}

/** The twin of the page at `path`. Throws for a page that has none: a dead link is a build bug. */
export function markdownUrl(path: string): string {
	if (!TWIN_PAGE_PATHS.has(path)) throw new Error(`No Markdown twin for ${path}`);
	return `${SITE}${markdownPathFor(path)}`;
}

/**
 * Where a link written in page markup should point from inside a twin: an
 * internal page with a twin → that twin; any other site address → absolute
 * on the live site; anything external → untouched.
 */
export function resolveLink(href: string): string {
	if (/^(?:mailto|tel):/i.test(href)) return href;
	let url: URL;
	try {
		url = new URL(href, `${SITE}/`);
	} catch {
		return href;
	}
	if (url.origin !== SITE_ORIGIN) return href;
	const path = url.pathname.replace(/\/+$/, '') || '/';
	if (!url.search && !url.hash && TWIN_PAGE_PATHS.has(path)) return markdownUrl(path);
	return url.href;
}

/**
 * Serve a twin. `adapter-static` keeps only the body — on GitHub Pages the
 * `.md` extension sets the type — but the header is right for dev and preview.
 */
export function markdownResponse(body: string): Response {
	return new Response(body, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
