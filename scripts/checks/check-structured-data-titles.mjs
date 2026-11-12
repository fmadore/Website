/**
 * Duplicate-`<title>` rule for `check-structured-data.mjs`, kept pure so it
 * can be tested without a build.
 *
 * Every indexable page needs a `<title>` of its own: a search engine shows one
 * result per title group, and a reader cannot tell the entries apart. Before
 * this rule, record titles were cut at their first colon, and 19 groups of
 * pages (45 in all) shared a title — "Beyond Keywords… | Frédérick Madore" on
 * five. Titles are now composed by `recordPageTitle()` in
 * `src/lib/utils/seoUtils.ts`.
 *
 * Exempt: the 404 and offline pages (served for many addresses by design) and
 * redirect stubs (a `<meta http-equiv="refresh">` page, with no title).
 */

/** Pages that stand in for many addresses and so may share a title with nothing. */
export const TITLE_EXEMPT_PAGES = new Set(['/404.html', '/offline.html']);

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };

/** The page's `<title>`, entity-decoded and trimmed; undefined when it has none. */
export function extractTitle(html) {
	const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
	if (!match) return undefined;
	return match[1]
		.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, name) => ENTITIES[name])
		.replace(/\s+/g, ' ')
		.trim();
}

/** True for a page the uniqueness rule does not apply to. */
export function isTitleExempt(path, html) {
	return TITLE_EXEMPT_PAGES.has(path) || /<meta\s[^>]*http-equiv=["']?refresh/i.test(html);
}

/**
 * Title → the pages that share it, for every title on more than one page.
 *
 * @param {Iterable<{ path: string, html: string }>} pages
 * @returns {Map<string, string[]>}
 */
export function duplicateTitles(pages) {
	/** @type {Map<string, string[]>} */
	const byTitle = new Map();
	for (const { path, html } of pages) {
		if (isTitleExempt(path, html)) continue;
		const title = extractTitle(html);
		if (!title) continue;
		byTitle.set(title, [...(byTitle.get(title) ?? []), path]);
	}
	return new Map([...byTitle].filter(([, paths]) => paths.length > 1));
}
