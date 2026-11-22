import { describe, expect, it } from 'vitest';
import { website } from '#lib/data/siteConfig.ts';
import { imageVariantManifest } from '#lib/data/imageVariants.generated.ts';
import { DEFAULT_SOCIAL_IMAGE, socialImage } from './socialImage';

const PAGE = `${website.url}/communications/some-talk`;
const manifest = {
	'Profile-picture.webp': [854, 742],
	'communications/landscape.webp': [1200, 600],
	'publications/cover.webp': [400, 600],
	'publications/cover.avif': [410, 648],
	'publications/tiny.avif': [120, 180],
	'communications/logo.svg': [303, 176]
} as const;

describe('socialImage', () => {
	it('uses a landscape raster as is, with its size, on the large card', () => {
		expect(socialImage('../images/communications/landscape.webp', PAGE, manifest)).toEqual({
			url: `${website.url}/images/communications/landscape.webp`,
			width: 1200,
			height: 600,
			card: 'summary_large_image',
			fallback: false
		});
	});

	it('gives a portrait cover the summary card', () => {
		expect(socialImage('../images/publications/cover.webp', PAGE, manifest).card).toBe('summary');
	});

	it('swaps an AVIF for its widest WebP derivative', () => {
		expect(socialImage('../images/publications/cover.avif', PAGE, manifest)).toEqual({
			url: `${website.url}/images/_r/publications/cover-400.webp`,
			width: 400,
			height: 632,
			card: 'summary',
			fallback: false
		});
	});

	it('falls back to the portrait for a vector, a derivative-less AVIF or nothing at all', () => {
		const portrait = `${website.url}/images/${DEFAULT_SOCIAL_IMAGE}`;
		for (const src of ['../images/communications/logo.svg', '../images/publications/tiny.avif']) {
			expect(socialImage(src, PAGE, manifest)).toEqual({
				url: portrait,
				width: 854,
				height: 742,
				card: 'summary_large_image',
				fallback: true
			});
		}
		expect(socialImage(undefined, PAGE, manifest).url).toBe(portrait);
	});

	it('keeps a safe external image, and refuses an unsafe one', () => {
		expect(socialImage('https://example.org/a.png', PAGE, manifest)).toEqual({
			url: 'https://example.org/a.png',
			card: 'summary_large_image',
			fallback: false
		});
		expect(socialImage('https://example.org/a.svg', PAGE, manifest).fallback).toBe(true);
	});

	it('finds the default card in the real manifest', () => {
		expect(imageVariantManifest[DEFAULT_SOCIAL_IMAGE]).toBeDefined();
	});
});
