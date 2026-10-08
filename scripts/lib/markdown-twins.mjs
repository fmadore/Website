/**
 * Build-output checks for the Markdown twins (llms.txt v2): every page that
 * announces a twin with `<link rel="alternate" type="text/markdown">` must
 * have it shipped, every twin shipped beside a page must be announced by that
 * page, and every link `/llms.txt` makes into the site must resolve.
 *
 * Pure functions over file paths and markup, so `check-prerender.mjs` can run
 * them against `build/` and the tests can run them against fixtures.
 */

/** Attributes of every `<link>` tag in a document. */
export function linkTags(html) {
	return [...html.matchAll(/<link\b([^>]*)>/gi)].map(([, attributes]) =>
		Object.fromEntries(
			[...attributes.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g)].map(
				(match) => [match[1].toLowerCase(), match[3] ?? match[4] ?? match[5] ?? '']
			)
		)
	);
}

/** The Markdown twin a page announces, or null. */
export function announcedTwin(html) {
	const tag = linkTags(html).find(
		(link) =>
			/(?:^|\s)alternate(?:\s|$)/i.test(link.rel ?? '') &&
			/^text\/markdown\b/i.test(link.type ?? '')
	);
	return tag?.href ?? null;
}

/**
 * The page a build file is, by URL path: `index.html` → `/`,
 * `publications/x.html` → `/publications/x`, `cv/index.html` → `/cv`.
 */
export function pagePathOf(file) {
	const path = `/${file.replace(/\\/g, '/')}`.replace(/(?:\/index)?\.html$/, '');
	return path === '' ? '/' : path;
}

/** The twin path a page would have: `/` → `/index.md`, `/cv` → `/cv.md`. */
export function twinPathOf(pagePath) {
	return pagePath === '/' ? '/index.md' : `${pagePath}.md`;
}

/**
 * Check a build. `files` lists every file under the build directory (relative,
 * either separator); `read` returns a file's text; `origin` is the production
 * origin the absolute links are written against.
 */
export function checkMarkdownTwins({ files, read, origin }) {
	const shipped = new Set(files.map((file) => `/${file.replace(/\\/g, '/')}`));
	const pages = files.filter((file) => file.endsWith('.html'));
	const announced = new Map(); // twin path → announcing page
	const missing = [];
	const foreign = [];

	for (const file of pages) {
		const href = announcedTwin(read(file));
		if (!href) continue;
		const page = pagePathOf(file);
		let url;
		try {
			url = new URL(href);
		} catch {
			foreign.push({ page, href });
			continue;
		}
		if (url.origin !== origin) {
			foreign.push({ page, href });
			continue;
		}
		announced.set(url.pathname, page);
		if (!shipped.has(url.pathname)) missing.push({ page, href });
	}

	// A `.md` file beside a page of the same name is that page's twin; a stray
	// README is not, since no page sits beside it.
	const unannounced = files
		.filter((file) => file.endsWith('.md'))
		.map((file) => `/${file.replace(/\\/g, '/')}`)
		.filter((twin) => {
			const page = twin === '/index.md' ? '/' : twin.replace(/\.md$/, '');
			const html = page === '/' ? '/index.html' : `${page}.html`;
			return shipped.has(html) && !announced.has(twin);
		});

	return { announced: announced.size, missing, foreign, unannounced };
}

/** Links in `/llms.txt` that point into the site but at nothing the build ships. */
export function brokenLlmsLinks({ text, files, origin }) {
	const shipped = new Set(files.map((file) => `/${file.replace(/\\/g, '/')}`));
	const exists = (path) =>
		shipped.has(path) ||
		shipped.has(`${path.replace(/\/$/, '')}.html`) ||
		shipped.has(`${path.replace(/\/$/, '')}/index.html`) ||
		(path === '/' && shipped.has('/index.html'));

	return [...text.matchAll(/\]\(([^)\s]+)\)/g)]
		.map(([, href]) => href)
		.filter((href) => href.startsWith(origin))
		.filter((href) => !exists(new URL(href).pathname));
}
