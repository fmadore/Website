/**
 * Internal links and static files for paths the site holds as plain strings.
 *
 * SvelteKit 3 dropped `base` from `$app/paths`: a link goes through `resolve`
 * and a static file through `asset`, both typed against the routes and the
 * `static` directory. Write a literal route or file with those directly
 * (`resolve('/publications')`, `asset('images/x.webp')`). The data, though,
 * carries its paths as strings (`/communications/x`, `images/…`), which
 * neither type admits; these take such a string, with or without its leading
 * slash, and hand it on.
 *
 * Call them while rendering, never at module scope: with `paths.relative` on,
 * the prefix they add depends on the page being rendered (`.` or `..` while
 * prerendering, the absolute base on the client).
 */
import { asset, resolve } from '$app/paths';
import type { AssetPath, Path } from '$app/types';

const unrooted = (path: string): string => path.replace(/^\/+/, '');

// `resolve` is typed per route, so a union of pathnames will not satisfy any
// one overload; the pathname form it takes for all of them is this.
const resolvePathname = resolve as (pathname: Path) => string;

/** An internal page, from a pathname that may carry a query or a hash. */
export function pageHref(path: string): string {
	return resolvePathname(unrooted(path) as Path);
}

/** A file in `static/`. */
export function assetHref(file: string): string {
	return asset(unrooted(file) as AssetPath);
}

/**
 * The prefix the two above add, for the pure helpers that join a path to it
 * themselves (`resolveImagePath`, `locationItemHref`, `getFullUrl`, …), so
 * they stay testable with a plain string.
 */
export function basePrefix(): string {
	return assetHref('').slice(0, -1);
}
