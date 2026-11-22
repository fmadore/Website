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

/** The formats a card image may carry: no major platform renders an SVG card, several reject AVIF. */
const CARD_FORMATS = /\.(webp|png|jpe?g)$/i;

/** The first `content` of a social key on the page. */
function socialValue(html, key) {
	for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
		const attrs = attributes(tag);
		if (attrs.property === key || attrs.name === key) return attrs.content;
	}
	return undefined;
}

/**
 * The card image's defects on one page (#217), plus what the caller still has
 * to measure: a site image's path and the size the page declares for it.
 *
 * @param {string} html
 * @param {{ origin: string, ships: (path: string) => boolean }} site
 * @returns {{ problems: string[], measure?: { path: string, width: number, height: number, card: string } }}
 */
export function socialImageProblems(html, { origin, ships }) {
	const problems = [];
	const image = socialValue(html, 'og:image');
	// A page with no social tags at all (a redirect stub) has no card to check.
	if (!image) return { problems: socialValue(html, 'og:title') ? ['no og:image'] : [] };
	let url;
	try {
		url = new URL(image);
	} catch {
		return { problems: [`og:image is not an absolute URL: ${image}`] };
	}
	if (!CARD_FORMATS.test(url.pathname)) {
		problems.push(`og:image is not WebP, PNG or JPEG: ${image}`);
	}
	if (socialValue(html, 'twitter:image') !== image) {
		problems.push('twitter:image differs from og:image');
	}
	const card = socialValue(html, 'twitter:card');
	if (url.origin !== origin) return { problems };

	const path = decodeURI(url.pathname);
	if (!ships(path)) problems.push(`og:image does not ship: ${path}`);
	const width = Number(socialValue(html, 'og:image:width'));
	const height = Number(socialValue(html, 'og:image:height'));
	if (!width || !height) {
		problems.push('og:image on this site declares no og:image:width / og:image:height');
		return { problems };
	}
	return { problems, measure: { path, width, height, card } };
}

/**
 * Whether the declared size matches the file, and the card fits its shape: the
 * large card crops a portrait image to a band across its middle.
 *
 * @param {{ width: number, height: number, card: string }} declared
 * @param {{ width: number, height: number }} actual
 * @returns {string[]}
 */
export function socialImageSizeProblems(declared, actual) {
	const problems = [];
	if (declared.width !== actual.width || declared.height !== actual.height) {
		problems.push(
			`og:image declares ${declared.width}×${declared.height}, the file is ${actual.width}×${actual.height}`
		);
	}
	const expected = actual.height > actual.width ? 'summary' : 'summary_large_image';
	if (declared.card !== expected) {
		problems.push(`twitter:card is ${declared.card} for a ${actual.width}×${actual.height} image`);
	}
	return problems;
}
