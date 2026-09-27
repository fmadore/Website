/** Static documents share one offline entry across search/filter URLs. */
export function documentCacheKey(href: string): string {
	const url = new URL(href);
	url.search = '';
	url.hash = '';
	return url.href;
}

/** Only a prerendered document on this origin may be requested by a client. */
export function navigationTarget(
	href: unknown,
	origin: string,
	pages: ReadonlySet<string>
): string | null {
	if (typeof href !== 'string') return null;
	try {
		const url = new URL(href);
		if (url.origin !== origin || url.username || url.password || !pages.has(url.pathname))
			return null;
		return documentCacheKey(url.href);
	} catch {
		return null;
	}
}
