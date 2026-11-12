/**
 * Which navigation entry stands for the current page. Shared by the desktop
 * bar (`NavItemWithDropdown`) and the mobile sheet (`MobileNavItem`), which
 * used to carry a copy each.
 */

/** The part of a nav entry the matcher reads. */
export interface MatchableNavItem {
	path: string;
	/** Further path prefixes the section owns (records filed outside its path). */
	match?: readonly string[];
}

/** Drops a trailing slash, except from the root `/`. */
export const normalizeNavPath = (path: string): string =>
	path.length > 1 ? path.replace(/\/$/, '') : path;

function isAtOrBeneath(prefix: string, current: string): boolean {
	const base = normalizeNavPath(prefix);
	if (base === '/') return current === '/';
	return current === base || current.startsWith(`${base}/`);
}

/**
 * A section is current when the route is its path, nested beneath it, or
 * under one of its `match` prefixes. The root `/` matches only itself, so the
 * home link is not lit everywhere; an external link is never current.
 */
export function isNavItemCurrent(item: MatchableNavItem, currentPath: string): boolean {
	if (/^https?:/.test(item.path)) return false;
	const current = normalizeNavPath(currentPath);
	return [item.path, ...(item.match ?? [])].some((prefix) => isAtOrBeneath(prefix, current));
}
