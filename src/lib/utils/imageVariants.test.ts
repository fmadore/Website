import { describe, it, expect } from 'vitest';
import { buildSrcset, imageDimensions, resolveImagePath } from './imageVariants';

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
