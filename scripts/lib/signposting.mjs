/**
 * Pure checks for the FAIR Signposting links (https://signposting.org/FAIR/) a
 * built page carries, used by `scripts/check-structured-data.mjs` and tested in
 * `scripts/signposting.test.mjs`.
 *
 * - A `describedby` link names the media type of its target, and when the
 *   target is on this site, the build ships it.
 * - A Signposting landing page (one that types itself `AboutPage`) names at
 *   least one metadata document with `describedby`, which level 1 requires.
 */

const ABOUT_PAGE = 'https://schema.org/AboutPage';

const decodeEntities = (value) =>
	value
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');

/** Every `<link>` element in a page, as its attributes (names lower-cased, entities decoded). */
export function extractLinks(html) {
	return [...html.matchAll(/<link\b([^>]*)>/gi)].map(([, attributes]) =>
		Object.fromEntries(
			[...attributes.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
				([, name, double, single]) => [name.toLowerCase(), decodeEntities(double ?? single)]
			)
		)
	);
}

/** True when `rel` (a space-separated list) includes `relation`. */
const hasRel = (link, relation) => (link.rel ?? '').toLowerCase().split(/\s+/).includes(relation);

/**
 * One page's Signposting problems, plus the site paths its `describedby` links
 * name (so the caller can find metadata files no page points at).
 *
 * @param {{ html: string, origin: string, ships: (path: string) => boolean }} options
 * @returns {{ problems: string[], described: string[] }}
 */
export function signpostingProblems({ html, origin, ships }) {
	const links = extractLinks(html);
	const describedby = links.filter((link) => hasRel(link, 'describedby'));
	const problems = [];
	const described = [];

	for (const link of describedby) {
		if (!link.type) problems.push(`describedby ${link.href} names no media type`);
		if (link.href?.startsWith(`${origin}/`)) {
			const path = decodeURI(link.href.slice(origin.length).split('#')[0]);
			described.push(path);
			if (!ships(path)) problems.push(`describedby ${link.href}, which the build did not ship`);
		}
	}

	const isLandingPage = links.some((link) => hasRel(link, 'type') && link.href === ABOUT_PAGE);
	if (isLandingPage && describedby.length === 0) {
		problems.push('a Signposting landing page (type AboutPage) with no describedby link');
	}

	return { problems, described };
}
