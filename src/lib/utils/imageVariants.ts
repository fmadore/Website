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

const IMAGE_PATH_RE = /^(.*\/images\/)(.+)\.(webp|jpe?g|png|avif)$/i;

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
	const [, prefix, name] = match;
	if (name.startsWith('_r/')) return undefined;
	return VARIANT_WIDTHS.map((w) => `${prefix}_r/${name}-${w}.webp ${w}w`).join(', ');
}
