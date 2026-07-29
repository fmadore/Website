/**
 * Responsive-image helpers for the static/images tree.
 *
 * `scripts/generate-image-variants.mjs` (run by `predev`/`prebuild`) emits
 * downscaled webp copies of every raster image into static/images/_r/ at the
 * widths below, so a `srcset` can be constructed purely by convention — no
 * manifest, no per-image wiring. External URLs and non-raster files (svg)
 * return undefined and simply render without a srcset.
 */

export const VARIANT_WIDTHS = [400, 800, 1600] as const;

/**
 * The `sizes` HeroImageDisplay renders alongside its srcset. Shared so a
 * `<link rel="preload" as="image">` for the same hero can pass the identical
 * value as `imagesizes` — the preload only gets used if the scanner picks the
 * same srcset candidate the <img> later resolves to, and it cannot do that
 * without matching sizes.
 */
export const HERO_SIZES =
	'(max-width: 640px) 100vw, (max-width: 768px) 330px, (max-width: 1024px) 600px, 800px';

const IMAGE_PATH_RE = /^(.*\/images\/)(.+)\.(webp|jpe?g|png|avif)$/i;

/**
 * Normalise a data-file image path to the URL an <img> will actually request:
 * base-prefixed, no leading slash on the source, no doubled slashes. External
 * URLs pass through untouched. Shared with the hero preload so both sides
 * resolve to the same string.
 */
export function resolveImagePath(src: string | null | undefined, base: string): string | undefined {
	if (!src) return undefined;
	if (src.startsWith('http://') || src.startsWith('https://')) return src;
	const path = src.startsWith('/') ? src.slice(1) : src;
	return `${base}/${path}`.replace(/\/\//g, '/');
}

/**
 * Build the `srcset` for an image under /images/ (any base-prefixed or
 * relative form). Returns undefined for external URLs, svg, or paths outside
 * the images tree — callers can pass the result straight to the attribute.
 *
 * @example
 * buildSrcset(`${base}/images/activities/foo.webp`)
 * // → "/images/_r/activities/foo-400.webp 400w, …-800.webp 800w, …-1600.webp 1600w"
 */
export function buildSrcset(src: string | null | undefined): string | undefined {
	if (!src || src.startsWith('http://') || src.startsWith('https://')) return undefined;
	const match = src.match(IMAGE_PATH_RE);
	if (!match) return undefined;
	const prefix = match[1];
	const name = match[2];
	if (!name || name.startsWith('_r/')) return undefined;
	return VARIANT_WIDTHS.map((w) => `${prefix}_r/${name}-${w}.webp ${w}w`).join(', ');
}
