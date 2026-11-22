/**
 * The image a page's social card (Open Graph, Twitter) shows, and how.
 *
 * A card has to be a raster every platform renders, so a page's own image is
 * not always usable as it stands (#217). Three outcomes:
 *
 * - a WebP, PNG or JPEG under `static/images` is used as is, with its
 *   intrinsic size from the image manifest;
 * - an AVIF is swapped for its widest WebP derivative (the image generator
 *   writes one at every ladder width narrower than the source), since several
 *   platforms reject AVIF;
 * - a vector (programme logos), an AVIF too small to have a derivative, or a
 *   format nothing renders falls back to the site's default card, the
 *   portrait. No major platform renders an SVG card.
 *
 * The card type follows the shape: a landscape image gets the large card, a
 * portrait one (a book cover) the summary card, where a large card would crop
 * it to a band across the middle.
 */
import {
	imageVariantManifest,
	type ImageVariantManifestEntry
} from '#lib/data/imageVariants.generated.ts';
import { author, website } from '#lib/data/siteConfig.ts';
import { VARIANT_WIDTHS } from '#lib/utils/imageVariants.ts';

/** The site's default card: the portrait the home page sets. */
export const DEFAULT_SOCIAL_IMAGE = 'Profile-picture.webp';
export const DEFAULT_SOCIAL_IMAGE_ALT = `Portrait of ${author.name}`;

/** The formats a card may carry. */
export const SOCIAL_IMAGE_FORMATS = /\.(webp|png|jpe?g)$/i;

export type TwitterCard = 'summary' | 'summary_large_image';

export interface SocialImage {
	/** Absolute URL on the production origin (or the external address as given). */
	url: string;
	width?: number;
	height?: number;
	card: TwitterCard;
	/** True when the page's own image could not be used and the default stands in. */
	fallback: boolean;
}

const IMAGES_PREFIX = '/images/';

function decode(path: string): string {
	try {
		return decodeURI(path);
	} catch {
		return path;
	}
}

const cardFor = (width?: number, height?: number): TwitterCard =>
	width && height && height > width ? 'summary' : 'summary_large_image';

function onSite(
	key: string,
	manifest: Readonly<Record<string, ImageVariantManifestEntry>>
): SocialImage | undefined {
	const entry = manifest[key];
	if (SOCIAL_IMAGE_FORMATS.test(key)) {
		const [width, height] = entry ?? [];
		return {
			url: `${website.url}${IMAGES_PREFIX}${encodeURI(key)}`,
			width,
			height,
			card: cardFor(width, height),
			fallback: false
		};
	}
	if (/\.avif$/i.test(key) && entry) {
		const [sourceWidth, sourceHeight] = entry;
		const width = [...VARIANT_WIDTHS].reverse().find((w) => w < sourceWidth);
		if (!width) return undefined;
		// sharp keeps the aspect ratio and rounds the derived side.
		const height = Math.round((sourceHeight * width) / sourceWidth);
		const derivative = `_r/${key.replace(/\.avif$/i, '')}-${width}.webp`;
		return {
			url: `${website.url}${IMAGES_PREFIX}${encodeURI(derivative)}`,
			width,
			height,
			card: cardFor(width, height),
			fallback: false
		};
	}
	return undefined;
}

/**
 * Resolve a page's card image. `src` is what the page passed — usually a
 * page-relative path from `asset()`/`assetHref()` — and `pageUrl` the page's
 * absolute canonical address, against which a relative `src` resolves.
 */
export function socialImage(
	src: string | undefined,
	pageUrl: string,
	manifest: Readonly<Record<string, ImageVariantManifestEntry>> = imageVariantManifest
): SocialImage {
	const fallback = (): SocialImage => ({
		...onSite(DEFAULT_SOCIAL_IMAGE, manifest)!,
		fallback: true
	});
	if (!src) return fallback();

	const url = new URL(src, pageUrl);
	if (url.origin !== new URL(website.url).origin) {
		// An external image is used as given when its format is safe; its size
		// is unknown, so it keeps the large card the site has always declared.
		return SOCIAL_IMAGE_FORMATS.test(url.pathname)
			? { url: url.href, card: 'summary_large_image', fallback: false }
			: fallback();
	}
	if (!url.pathname.startsWith(IMAGES_PREFIX)) return fallback();
	return onSite(decode(url.pathname.slice(IMAGES_PREFIX.length)), manifest) ?? fallback();
}
