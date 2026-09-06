/** Responsive-image helpers for the static/images tree. */

import {
	imageVariantManifest,
	type ImageVariantManifestEntry
} from '$lib/data/imageVariants.generated';

export const VARIANT_WIDTHS = [400, 800, 1600] as const;

export const HERO_SIZES =
	'(max-width: 640px) 100vw, (max-width: 768px) 330px, (max-width: 1024px) 600px, 800px';

const IMAGE_PATH_RE = /^(.*\/images\/)(.+)\.(webp|jpe?g|png|avif)$/i;

/** Intrinsic pixel size of a static/images source, for `<img width height>`. */
export interface ImageDimensions {
	readonly width: number;
	readonly height: number;
}

export function resolveImagePath(src: string | null | undefined, base: string): string | undefined {
	if (!src) return undefined;
	if (src.startsWith('http://') || src.startsWith('https://')) return src;
	const path = src.startsWith('/') ? src.slice(1) : src;
	return `${base}/${path}`.replace(/\/\//g, '/');
}

function decodeManifestKey(path: string): string {
	try {
		return decodeURI(path);
	} catch {
		return path;
	}
}

function manifestEntryFor(
	src: string | null | undefined,
	manifest: Readonly<Record<string, ImageVariantManifestEntry>>
):
	| { entry: ImageVariantManifestEntry; prefix: string; name: string; extension: string }
	| undefined {
	if (!src || src.startsWith('http://') || src.startsWith('https://')) return undefined;
	const match = src.match(IMAGE_PATH_RE);
	if (!match) return undefined;

	const prefix = match[1];
	const name = match[2];
	const extension = match[3];
	if (!prefix || !name || !extension || name.startsWith('_r/')) return undefined;

	const entry = manifest[decodeManifestKey(`${name}.${extension}`)];
	return entry ? { entry, prefix, name, extension } : undefined;
}

/**
 * Intrinsic width/height of a source image, read from the generated manifest,
 * so an `<img>` can reserve its box before the file loads. Undefined for
 * external, vector, and unknown paths.
 */
export function imageDimensions(
	src: string | null | undefined,
	manifest: Readonly<Record<string, ImageVariantManifestEntry>> = imageVariantManifest
): ImageDimensions | undefined {
	const found = manifestEntryFor(src, manifest);
	return found ? { width: found.entry.sourceWidth, height: found.entry.sourceHeight } : undefined;
}

/**
 * Build a srcset whose descriptors match the intrinsic width of every file.
 * Small images without a useful downscaled derivative simply use `src`.
 */
export function buildSrcset(
	src: string | null | undefined,
	manifest: Readonly<Record<string, ImageVariantManifestEntry>> = imageVariantManifest
): string | undefined {
	const found = manifestEntryFor(src, manifest);
	if (!found || found.entry.widths.length === 0) return undefined;
	const { entry, prefix, name } = found;

	const candidates = entry.widths.map((width) => `${prefix}_r/${name}-${width}.webp ${width}w`);
	candidates.push(`${src} ${entry.sourceWidth}w`);
	return candidates.join(', ');
}
