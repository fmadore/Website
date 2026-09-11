import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { buildSrcset, imageDimensions, resolveImagePath, VARIANT_WIDTHS } from './imageVariants';

const manifest = {
	'activities/talk.webp': { sourceWidth: 1280, sourceHeight: 720, widths: [400, 800] },
	'foo.jpg': { sourceWidth: 640, sourceHeight: 480, widths: [400] },
	'small.png': { sourceWidth: 320, sourceHeight: 320, widths: [] }
} as const;

describe('imageDimensions', () => {
	it('reads the intrinsic size from the manifest, base path or not', () => {
		expect(imageDimensions('/images/activities/talk.webp', manifest)).toEqual({
			width: 1280,
			height: 720
		});
		expect(imageDimensions('./images/foo.jpg', manifest)).toEqual({ width: 640, height: 480 });
	});

	it('is undefined for unknown, external and vector paths', () => {
		expect(imageDimensions('/images/unknown.webp', manifest)).toBeUndefined();
		expect(imageDimensions('https://example.com/images/foo.jpg', manifest)).toBeUndefined();
		expect(imageDimensions('/images/logo.svg', manifest)).toBeUndefined();
	});
});

describe('buildSrcset', () => {
	it('uses generated derivatives and the original at its intrinsic width', () => {
		expect(buildSrcset('/images/activities/talk.webp', manifest)).toBe(
			'/images/_r/activities/talk-400.webp 400w, /images/_r/activities/talk-800.webp 800w, /images/activities/talk.webp 1280w'
		);
	});

	it('preserves a base-path prefix', () => {
		expect(buildSrcset('/site/images/foo.jpg', manifest)).toBe(
			'/site/images/_r/foo-400.webp 400w, /site/images/foo.jpg 640w'
		);
	});

	it('returns undefined when downscaling would add no useful candidate', () => {
		expect(buildSrcset('/images/small.png', manifest)).toBeUndefined();
	});

	it('returns undefined for unknown, external, vector, and non-image paths', () => {
		expect(buildSrcset('/images/unknown.webp', manifest)).toBeUndefined();
		expect(buildSrcset('https://example.com/images/foo.webp', manifest)).toBeUndefined();
		expect(buildSrcset('/images/logo.svg', manifest)).toBeUndefined();
		expect(buildSrcset('/files/paper.pdf', manifest)).toBeUndefined();
	});

	it('never derives variants of a generated variant', () => {
		expect(buildSrcset('/images/_r/foo-400.webp', manifest)).toBeUndefined();
	});
});

describe('resolveImagePath', () => {
	it('prefixes the base path', () => {
		expect(resolveImagePath('images/activities/talk.webp', '/site')).toBe(
			'/site/images/activities/talk.webp'
		);
	});

	it('handles an empty base and a leading slash on either side', () => {
		expect(resolveImagePath('images/activities/talk.webp', '')).toBe(
			'/images/activities/talk.webp'
		);
		expect(resolveImagePath('/images/activities/talk.webp', '')).toBe(
			'/images/activities/talk.webp'
		);
	});

	it('passes external URLs through untouched', () => {
		expect(resolveImagePath('https://example.com/images/foo.webp', '/site')).toBe(
			'https://example.com/images/foo.webp'
		);
	});

	it('returns undefined for empty and nullish input', () => {
		expect(resolveImagePath('', '')).toBeUndefined();
		expect(resolveImagePath(null, '')).toBeUndefined();
		expect(resolveImagePath(undefined, '')).toBeUndefined();
	});
});

describe('VARIANT_WIDTHS', () => {
	it('matches the ladder the generator writes files for', () => {
		// The generator is a top-level-await script that walks static/images and
		// writes derivatives, so it cannot be imported; its ladder is read as
		// source text instead. A drift between the two silently points srcset
		// candidates at files that were never generated.
		const generator = readFileSync(
			fileURLToPath(new URL('../../../scripts/generate-image-variants.mjs', import.meta.url)),
			'utf8'
		);
		const declared = generator.match(/export const VARIANT_WIDTHS = \[([^\]]*)\]/);
		expect(declared).not.toBeNull();
		const widths = (declared?.[1] ?? '').split(',').map((part) => Number(part.trim()));
		expect(widths).toEqual([...VARIANT_WIDTHS]);
	});

	it('is sorted ascending and free of duplicates', () => {
		expect([...VARIANT_WIDTHS]).toEqual([...new Set(VARIANT_WIDTHS)].sort((a, b) => a - b));
	});
});
