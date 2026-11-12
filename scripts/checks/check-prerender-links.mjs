/**
 * The internal link graph of a build, for the orphan gate in
 * `check-prerender.mjs`: every URL the sitemap advertises must be the target
 * of at least one `<a href>` on another advertised page.
 *
 * A sitemap entry is a request to index a page; a page nothing links to is one
 * a crawler only reaches through that request, and one a reader never reaches
 * at all. The audit that added this gate found 36 records in that state (29
 * talks, 4 publications, 3 projects): the indexes paginate on the client, so
 * the prerendered HTML links only their first page, and `/cv`, which names
 * every record, linked none of them.
 *
 * Pure functions over file paths and markup, so the script runs them against
 * `build/` and the tests against fixtures.
 */

/** Decode the few entities Svelte writes inside an attribute value. */
function decodeAttribute(value) {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

/** The `href` of every `<a>` in a document, entity-decoded, in document order. */
export function anchorHrefs(html) {
	const hrefs = [];
	for (const [, attributes] of html.matchAll(/<a\b([^>]*)>/gi)) {
		const match = attributes.match(/(?:^|\s)href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i);
		if (match) hrefs.push(decodeAttribute(match[1] ?? match[2] ?? match[3] ?? ''));
	}
	return hrefs;
}

/**
 * The URL a build file is served at, which is what its relative links resolve
 * against: `index.html` → `/`, `cv.html` → `/cv`, `cv/index.html` → `/cv/`
 * (a directory index is served with its trailing slash, so `./x` from it is
 * `/cv/x`, not `/x`).
 */
export function servedPathOf(file) {
	const path = `/${file.replace(/\\/g, '/')}`;
	if (path.endsWith('/index.html')) return path.slice(0, -'index.html'.length);
	return path.replace(/\.html$/, '');
}

/** A site path in one spelling: decoded, no trailing slash, `/` for the root. */
export function normalisePath(pathname) {
	let path = pathname;
	try {
		path = decodeURI(pathname);
	} catch {
		// A malformed escape stays as written; it simply matches nothing.
	}
	path = path.replace(/\/+$/, '');
	return path === '' ? '/' : path;
}

/**
 * The site path an href on the page served at `servedPath` points to, or null
 * for a link off the site (another origin, `mailto:`, `tel:`, `javascript:`)
 * or a bare fragment, which stays on the page. Query and fragment are dropped:
 * `/publications?type=book#x` is a link to `/publications`.
 */
export function resolveHref(href, servedPath, origin) {
	const trimmed = href.trim();
	if (trimmed === '' || trimmed.startsWith('#')) return null;
	let url;
	try {
		url = new URL(trimmed, `${origin}${servedPath}`);
	} catch {
		return null;
	}
	if (url.origin !== origin) return null;
	return normalisePath(url.pathname);
}

/**
 * Advertised URLs that no other advertised page links to.
 *
 * `urls` are the sitemap's `<loc>`s; `files` every file under the build
 * directory (relative, either separator); `read` returns a file's text;
 * `origin` is the production origin the sitemap is written against. Only
 * advertised pages count as sources: a link from a page the sitemap does not
 * list (the 404 page, the offline fallback) is not a way in. A page's links to
 * itself do not count either. `exempt` paths (the home page, the root of
 * every crawl) are never reported.
 *
 * Returns the orphans as normalised paths, sorted.
 */
export function findOrphans({ urls, files, read, origin, exempt = ['/'] }) {
	const advertised = new Set(urls.map((url) => normalisePath(new URL(url).pathname)));
	const linked = new Set();

	for (const file of files) {
		if (!file.endsWith('.html')) continue;
		const servedPath = servedPathOf(file);
		const self = normalisePath(servedPath);
		if (!advertised.has(self)) continue;
		for (const href of anchorHrefs(read(file))) {
			const target = resolveHref(href, servedPath, origin);
			if (target && target !== self) linked.add(target);
		}
	}

	const exempted = new Set(exempt.map(normalisePath));
	return [...advertised].filter((path) => !linked.has(path) && !exempted.has(path)).sort();
}
