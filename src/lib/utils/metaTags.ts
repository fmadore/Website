/**
 * Shared utilities for MetaTags components (publications, communications, activities).
 * Provides common meta tag creation, author name formatting, and tag validation.
 */

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
 * Converts "First Last" to "Last, First" format for citation managers (Zotero).
 * Names already in "Last, First" format are returned as-is.
 */
export function toLastFirstFormat(name: string): string {
	if (name.includes(',')) return name;
	const parts = name.trim().split(/\s+/);
	if (parts.length <= 1) return name;
	const lastName = parts[parts.length - 1];
	const firstName = parts.slice(0, -1).join(' ');
	return `${lastName}, ${firstName}`;
}

/**
 * Splits a comma/and-separated name string into individual names.
 */
export function splitNames(names: string): string[] {
	return names
		.split(/,\s*|\s+and\s+/)
		.map((name) => name.trim())
		.filter(Boolean);
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
 * Parses an author name into first/last parts for COinS metadata.
 * Handles both "Last, First" and "First Last" formats.
 */
export function parseAuthorName(author: string): { first?: string; last?: string } {
	if (author.includes(',')) {
		const [last, first] = author.split(',').map((s) => s.trim());
		return { first, last };
	}
	const parts = author.trim().split(/\s+/);
	if (parts.length > 1) {
		return {
			last: parts[parts.length - 1],
			first: parts.slice(0, -1).join(' ')
		};
	}
	return { last: author };
}
