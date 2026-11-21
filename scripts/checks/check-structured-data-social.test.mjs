import { describe, expect, it } from 'vitest';
import { socialTagProblems } from './check-structured-data-social.mjs';

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
