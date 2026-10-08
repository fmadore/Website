/**
 * Which pages ship a Markdown twin, and where it lives.
 *
 * Every content page has a prerendered Markdown version at its own address
 * with `.md` in place of the (implicit) `.html` — `/publications/x` →
 * `/publications/x.md`, and the home page, which has no filename, at
 * `/index.md` — following llms.txt v2 (https://llmstxt.org/). `SEO.svelte`
 * announces it with `<link rel="alternate" type="text/markdown">`.
 *
 * Keyed by route id rather than pathname so a static sibling of a record
 * route (`/publications/visualisations` beside `/publications/[id]`) can never
 * be mistaken for a record. The twins themselves are the `*.md` server routes
 * under `src/routes/`; `npm run check:prerender` fails if any page announces a
 * twin the build did not ship.
 *
 * Kept free of datasets: the page head imports it on every route.
 */

/** Route ids whose pages have a twin. Research projects are matched by prefix below. */
export const MARKDOWN_TWIN_ROUTE_IDS: ReadonlySet<string> = new Set([
	'/',
	'/publications',
	'/publications/[id]',
	'/conference-activity',
	'/communications/[id]',
	'/activities',
	'/activities/[id]',
	'/research',
	'/digital-humanities',
	'/digital-humanities/[id]',
	'/cv'
]);

/**
 * Each research project is its own literal route (`/research/<id>`), since its
 * prose is authored in the route page; any route directly under `/research`
 * is a project. A route that only redirects never renders the page head.
 */
const RESEARCH_PROJECT_ROUTE = /^\/research\/[^/[\]]+$/;

/** The Markdown address for a page's pathname: `/` → `/index.md`, `/cv` → `/cv.md`. */
export function markdownPathFor(pathname: string): string {
	const path = pathname.replace(/\/+$/, '');
	return path === '' ? '/index.md' : `${path}.md`;
}

/** The twin of the page at `pathname` under route `routeId`, or null when it has none. */
export function markdownTwinPath(routeId: string | null, pathname: string): string | null {
	if (!routeId) return null;
	if (!MARKDOWN_TWIN_ROUTE_IDS.has(routeId) && !RESEARCH_PROJECT_ROUTE.test(routeId)) return null;
	return markdownPathFor(pathname);
}
