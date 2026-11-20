/**
 * Social-tag rule for `check-structured-data.mjs`, kept pure so it can be
 * tested without a build.
 *
 * Open Graph (`og:*`, `article:*`) is written with `property=`, Twitter Cards
 * (`twitter:*`) with `name=`, and each key appears once per page. Before this
 * rule, talk and activity pages carried a second set through their MetaTags
 * (`name="og:*"`, `name="article:*"`) that disagreed with the one in
 * `SEO.svelte`: `og:type` was `website` in one and `article` in the other.
 * `SEO.svelte` now owns every social tag.
 */

/** Keys the Open Graph protocol lets a page repeat (arrays). */
export const REPEATABLE_SOCIAL_KEYS = new Set([
	'article:author',
	'article:tag',
	'og:locale:alternate'
]);

const SOCIAL_KEY = /^(og|article|twitter):/;

/** `{ attribute: value }` for one start tag; names lower-cased. */
function attributes(tag) {
	const attrs = {};
	for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>/]+))/g)) {
		attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5];
	}
	return attrs;
}

/**
 * Every social-tag defect on one page: a key under the wrong attribute, or a
 * key that appears more than once.
 *
 * @param {string} html
 * @returns {string[]}
 */
export function socialTagProblems(html) {
	const problems = [];
	/** @type {Map<string, number>} */
	const seen = new Map();
	for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
		const attrs = attributes(tag);
		for (const attribute of ['property', 'name']) {
			const key = attrs[attribute];
			if (!key || !SOCIAL_KEY.test(key)) continue;
			const expected = key.startsWith('twitter:') ? 'name' : 'property';
			if (attribute !== expected) {
				problems.push(`social tag ${key} written as ${attribute}=, expected ${expected}=`);
			}
			seen.set(key, (seen.get(key) ?? 0) + 1);
		}
	}
	for (const [key, count] of seen) {
		if (count > 1 && !REPEATABLE_SOCIAL_KEYS.has(key)) {
			problems.push(`social tag ${key} appears ${count} times`);
		}
	}
	return problems;
}
