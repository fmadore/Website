/**
 * The service worker's routing table, extracted from `service-worker.js` so the
 * decision it encodes can be unit-tested.
 *
 * It lives here rather than under `$lib` because nothing but the worker uses it,
 * and it is deliberately pure: no `$service-worker`, no `caches`, no `fetch`.
 * The worker keeps the strategies themselves; this module only answers which one
 * a path gets.
 *
 * The extraction is not tidying. This table has silently mis-routed traffic
 * twice — once when `.json` was matched as a substring and so was swallowed by
 * the `.js` rule, once when `/app/version.json` was swallowed by the `/app/`
 * prefix — and both times the symptom appeared somewhere else entirely (stale
 * data until the next deploy; `Error 500` on a page that was merely one deploy
 * old). A mis-route is invisible at the call site, so it belongs under test.
 */

export type SwStrategy = 'passthrough' | 'cache-first' | 'stale-while-revalidate' | 'network-first';

// Entries starting with '.' are file extensions and must match the END of the
// pathname; everything else is a path-prefix substring. (Substring-matching
// extensions is how '.json' used to match the '.js' rule, which routed all JSON
// to cache-first and made stale-while-revalidate dead code — data was served
// stale until the next deploy.)
//
// Fonts are intentionally NOT listed. `<link rel="preload" as="font">` in
// app.html starts the three latin subsets at parse time, but a request answered
// by a service worker never consults the browser's preload cache, so Firefox
// reported all three preloads as fetched-and-unused on every repeat visit. The
// host already serves fonts with `max-age=2678400` (31 days) and a repeat visit
// measured `transferSize: 0` either way, so letting them go straight to the HTTP
// cache costs nothing and lets the preload actually be consumed.
export const CACHE_FIRST_ROUTES = [
	'/images/',
	'/icons/',
	// Does NOT capture the version file: see VERSION_FILE below.
	'/_app/',
	'/app/',
	'.css',
	'.js',
	'.png',
	'.jpg',
	'.jpeg',
	'.webp',
	'.svg',
	'.ico'
];

export const STALE_WHILE_REVALIDATE_ROUTES = ['/api/', '.json'];

// Passed straight to the browser with no respondWith() at all — see the note on
// CACHE_FIRST_ROUTES for why a passthrough response is not good enough.
export const FONT_EXTENSIONS = ['.woff2', '.woff', '.ttf', '.otf'];

/**
 * SvelteKit's freshness oracle, and so the one file that must never be answered
 * from a cache.
 *
 * When a node module fails to import — the redeploy case, where the chunk it
 * names has just been renamed — SvelteKit fetches this file with `no-cache` and
 * hard-navigates instead of rendering the error page if the version moved. A
 * service-worker response discards those request headers, so a cache hit here
 * reports "no new version" across a deploy that has already renamed every chunk:
 * no reload, and `Error 500` on a page whose only problem was being one deploy
 * old. Matched as a suffix so a configured `paths.base` still resolves; the
 * `app/` segment tracks `appDir` in svelte.config.js.
 */
export const VERSION_FILE = '/app/version.json';

/** Extensions match the end of the path; prefixes match anywhere in it. */
export function matchesRoute(pathname: string, route: string): boolean {
	return route.startsWith('.') ? pathname.endsWith(route) : pathname.includes(route);
}

/**
 * Which strategy the worker should apply to `pathname`.
 *
 * Order is load-bearing: the two passthrough cases are decided before either
 * cache table is consulted, because both paths also match a cache-first entry
 * and the tables cannot express an exception.
 *
 * `destination` is the request's own `destination`, which catches a font served
 * from a path whose extension says nothing.
 */
export function chooseStrategy(pathname: string, destination?: string): SwStrategy {
	if (destination === 'font' || FONT_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
		return 'passthrough';
	}

	if (pathname.endsWith(VERSION_FILE)) {
		return 'passthrough';
	}

	if (CACHE_FIRST_ROUTES.some((route) => matchesRoute(pathname, route))) {
		return 'cache-first';
	}

	if (STALE_WHILE_REVALIDATE_ROUTES.some((route) => matchesRoute(pathname, route))) {
		return 'stale-while-revalidate';
	}

	return 'network-first';
}
