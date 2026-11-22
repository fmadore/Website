import { describe, expect, it } from 'vitest';
import {
	socialImageProblems,
	socialImageSizeProblems,
	socialTagProblems
} from './check-structured-data-social.mjs';

describe('socialTagProblems', () => {
	it('accepts one set, Open Graph by property and Twitter by name', () => {
		const html =
			'<meta property="og:type" content="website"/>' +
			'<meta property="og:title" content="X"/>' +
			'<meta property="article:published_time" content="2026-01-01"/>' +
			'<meta name="twitter:card" content="summary_large_image"/>' +
			'<meta name="description" content="not social"/>';
		expect(socialTagProblems(html)).toEqual([]);
	});

	it('flags a key under the wrong attribute', () => {
		expect(
			socialTagProblems(
				'<meta property="twitter:card" content="x"><meta name="og:type" content="article">'
			)
		).toEqual([
			'social tag twitter:card written as property=, expected name=',
			'social tag og:type written as name=, expected property='
		]);
	});

	it('flags a key emitted twice, whatever the attribute', () => {
		const html =
			'<meta property="og:type" content="website"/><meta name="og:type" content="article"/>';
		expect(socialTagProblems(html)).toContain('social tag og:type appears 2 times');
	});

	it('lets the Open Graph array keys repeat', () => {
		const html =
			'<meta property="article:tag" content="a"/><meta property="article:tag" content="b"/>';
		expect(socialTagProblems(html)).toEqual([]);
	});
});

describe('socialImageProblems', () => {
	const origin = 'https://www.example.org';
	const ships = (path) => path === '/images/a.webp';
	const page = (image, extra = '') =>
		'<meta property="og:title" content="X">' +
		`<meta property="og:image" content="${image}">` +
		`<meta name="twitter:image" content="${image}">` +
		'<meta name="twitter:card" content="summary_large_image">' +
		extra;
	const sized =
		'<meta property="og:image:width" content="1200"><meta property="og:image:height" content="600">';

	it('accepts a shipped, sized raster and hands back what to measure', () => {
		expect(socialImageProblems(page(`${origin}/images/a.webp`, sized), { origin, ships })).toEqual({
			problems: [],
			measure: { path: '/images/a.webp', width: 1200, height: 600, card: 'summary_large_image' }
		});
	});

	it('flags an SVG or AVIF card, an unshipped image and a missing size', () => {
		const { problems } = socialImageProblems(page(`${origin}/images/logo.svg`), { origin, ships });
		expect(problems).toEqual([
			`og:image is not WebP, PNG or JPEG: ${origin}/images/logo.svg`,
			'og:image does not ship: /images/logo.svg',
			'og:image on this site declares no og:image:width / og:image:height'
		]);
		expect(
			socialImageProblems(page(`${origin}/images/a.avif`), { origin, ships }).problems[0]
		).toMatch(/not WebP, PNG or JPEG/);
	});

	it('flags a missing og:image only on a page that has social tags', () => {
		expect(
			socialImageProblems('<meta property="og:title" content="X">', { origin, ships })
		).toEqual({
			problems: ['no og:image']
		});
		expect(
			socialImageProblems('<meta http-equiv="refresh" content="0;url=/">', { origin, ships })
		).toEqual({
			problems: []
		});
	});
});

describe('socialImageSizeProblems', () => {
	it('accepts the true size and the card that fits it', () => {
		expect(
			socialImageSizeProblems(
				{ width: 400, height: 632, card: 'summary' },
				{ width: 400, height: 632 }
			)
		).toEqual([]);
	});

	it('flags a wrong size and a large card on a portrait image', () => {
		expect(
			socialImageSizeProblems(
				{ width: 400, height: 600, card: 'summary_large_image' },
				{ width: 400, height: 632 }
			)
		).toEqual([
			'og:image declares 400×600, the file is 400×632',
			'twitter:card is summary_large_image for a 400×632 image'
		]);
	});
});
