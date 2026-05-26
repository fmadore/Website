/**
 * Shared utilities for MetaTags components (publications, communications, activities).
 * Provides common meta tag creation, author name formatting, and tag validation.
 */

import { toLastFirstFormat } from '$lib/utils/nameUtils';

// Name-string helpers live in nameUtils; re-exported here so existing
// `$lib/utils/metaTags` imports keep working unchanged.
export { toLastFirstFormat, splitNames, parseAuthorName } from '$lib/utils/nameUtils';

export interface MetaTag {
	name: string;
	content: string;
}

/**
 * Creates a meta tag only if content exists and condition is met.
 */
export function createConditionalTag(
	name: string,
	content: string | undefined,
	condition: boolean = true
): MetaTag[] {
	if (!content || !condition) return [];
	return [{ name, content }];
}

/**
 * Creates meta tags for authors/editors with "Last, First" formatting.
 */
export function createAuthorTags(authors: string[] | undefined, tagName: string): MetaTag[] {
	if (!authors) return [];
	return authors.map((author) => ({
		name: tagName,
		content: toLastFirstFormat(author)
	}));
}

/**
 * Generates a full URL from a relative path, using the site origin and base path.
 */
export function getFullUrl(
	origin: string,
	basePath: string,
	path: string | undefined
): string | undefined {
	if (!path) return undefined;
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	return `${origin}${basePath}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Removes duplicate tags and filters out empty content.
 */
export function deduplicateAndFilterTags(tags: MetaTag[]): MetaTag[] {
	const uniqueTags = tags.filter((tag, index) => {
		const key = `${tag.name}:${tag.content}`;
		return tags.findIndex((t) => `${t.name}:${t.content}` === key) === index;
	});

	return uniqueTags.filter((tag) => {
		if (!tag.content) return false;
		if (typeof tag.content === 'string') {
			return tag.content.trim() !== '';
		}
		return String(tag.content).trim() !== '';
	});
}

/**
 * Seeds an OpenURL/COinS parameter set with the common scaffold params
 * (`url_ver`, `ctx_ver`, `rfr_id`) in their canonical order. Callers append
 * format-specific fields afterwards; `URLSearchParams.toString()` preserves
 * insertion order so the serialized output is stable.
 *
 * @param rfrId - The referrer id; publications historically use a different
 *   value from the rest, so it is parameterised to keep output unchanged.
 */
export function createCoinsParams(rfrId: string = 'info:sid/frederickmadore.com'): URLSearchParams {
	const params = new URLSearchParams();
	params.set('url_ver', 'Z39.88-2004');
	params.set('ctx_ver', 'Z39.88-2004');
	params.set('rfr_id', rfrId);
	return params;
}
