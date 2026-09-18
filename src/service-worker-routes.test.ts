import { describe, it, expect } from 'vitest';
import {
	CACHE_FIRST_ROUTES,
	STALE_WHILE_REVALIDATE_ROUTES,
	VERSION_FILE,
	chooseStrategy,
	matchesRoute
} from './service-worker-routes';

/**
 * The tripwire for the worker's routing table. Both regressions it has produced
 * were silent at the call site and surfaced as something else entirely, so the
 * first two blocks below pin them by name rather than by coincidence.
 */

describe('the version file is never cached', () => {
	/* The regression: `/app/version.json` matched the `/app/` prefix, the fetch
	 * handler tested cache-first before stale-while-revalidate, and the cached
	 * copy then reported "no new version" across a deploy that had renamed every
	 * chunk — turning SvelteKit's own redeploy recovery off and rendering
	 * `Error 500` on a page that was merely one deploy old. */
	it('is passed through, not cache-first', () => {
		expect(chooseStrategy('/app/version.json')).toBe('passthrough');
	});

	it('is still passed through under a configured base path', () => {
		expect(chooseStrategy('/Website/app/version.json')).toBe('passthrough');
	});

	it('is a path some cache table would otherwise claim', () => {
		// Documents *why* the exception has to be decided before the tables: the
		// file matches both of them. If this ever stops being true the exception
		// is merely redundant, not wrong — but the guard above must still hold.
		const claimed = [...CACHE_FIRST_ROUTES, ...STALE_WHILE_REVALIDATE_ROUTES].some((route) =>
			matchesRoute(VERSION_FILE, route)
		);
		expect(claimed).toBe(true);
	});
});

describe('extensions match the end of the path, prefixes match anywhere', () => {
	/* The earlier regression: '.json' was substring-matched and so was captured
	 * by the '.js' cache-first rule, which routed all JSON to cache-first and
	 * made the stale-while-revalidate table dead code. */
	it('does not let the .js rule swallow .json', () => {
		expect(chooseStrategy('/data/publications.json')).toBe('stale-while-revalidate');
	});

	it('still routes real scripts cache-first', () => {
		expect(chooseStrategy('/app/immutable/nodes/12.Ab3dEf9x.js')).toBe('cache-first');
	});

	it('treats a dotted entry as a suffix, not a substring', () => {
		expect(matchesRoute('/a.json/b', '.json')).toBe(false);
		expect(matchesRoute('/a/b.json', '.json')).toBe(true);
	});

	it('treats an undotted entry as a substring', () => {
		expect(matchesRoute('/nested/images/hero.txt', '/images/')).toBe(true);
	});
});

describe('the remaining strategies', () => {
	it.each([
		['/', 'network-first'],
		['/publications', 'network-first'],
		['/publications/some-book', 'network-first'],
		['/offline.html', 'network-first'],
		['/manifest.webmanifest', 'network-first'],
		['/api/search', 'stale-while-revalidate'],
		['/images/hero.webp', 'cache-first'],
		['/icons/icon-192.png', 'cache-first'],
		['/app/immutable/assets/app.DxY1.css', 'cache-first']
	])('routes %s to %s', (pathname, expected) => {
		expect(chooseStrategy(pathname)).toBe(expected);
	});

	it.each(['/fonts/web/archivo-latin.woff2', '/fonts/web/newsreader.woff'])(
		'passes %s straight to the browser so the preload cache is consulted',
		(pathname) => {
			expect(chooseStrategy(pathname)).toBe('passthrough');
		}
	);

	it('passes a font through on its destination even when the path does not say so', () => {
		expect(chooseStrategy('/assets/inline-face', 'font')).toBe('passthrough');
		expect(chooseStrategy('/assets/inline-face')).toBe('network-first');
	});
});
