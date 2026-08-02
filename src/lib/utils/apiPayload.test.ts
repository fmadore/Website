import { describe, it, expect } from 'vitest';
import { website } from '$lib/data/siteConfig';
import {
	API_VERSION,
	absoluteUrl,
	buildLinks,
	compact,
	datasetPayload,
	jsonResponse
} from './apiPayload';

const SITE = website.url;

describe('absoluteUrl', () => {
	it('prefixes site-relative paths with the site origin', () => {
		expect(absoluteUrl('/publications/foo')).toBe(`${SITE}/publications/foo`);
	});

	it('adds the missing leading slash', () => {
		expect(absoluteUrl('files/cv.pdf')).toBe(`${SITE}/files/cv.pdf`);
	});

	it('leaves absolute URLs untouched', () => {
		expect(absoluteUrl('https://doi.org/10.1000/xyz')).toBe('https://doi.org/10.1000/xyz');
		expect(absoluteUrl('http://example.org/a')).toBe('http://example.org/a');
	});

	it('leaves mailto: addresses untouched', () => {
		expect(absoluteUrl('mailto:someone@example.org')).toBe('mailto:someone@example.org');
	});
});

describe('buildLinks', () => {
	it('drops entries without a URL', () => {
		expect(buildLinks([{ label: 'Source', url: undefined }, undefined])).toBeUndefined();
	});

	it('returns undefined rather than an empty array', () => {
		expect(buildLinks([])).toBeUndefined();
	});

	it('resolves relative URLs and preserves order', () => {
		expect(
			buildLinks([
				{ label: 'PDF', url: '/files/paper.pdf' },
				{ label: 'DOI', url: 'https://doi.org/10.1000/xyz' }
			])
		).toEqual([
			{ label: 'PDF', url: `${SITE}/files/paper.pdf` },
			{ label: 'DOI', url: 'https://doi.org/10.1000/xyz' }
		]);
	});

	it('appends the additional URLs after the primary ones', () => {
		expect(
			buildLinks(
				[{ label: 'Source', url: 'https://example.org/a' }],
				[{ label: 'Review', url: 'https://example.org/b' }]
			)
		).toEqual([
			{ label: 'Source', url: 'https://example.org/a' },
			{ label: 'Review', url: 'https://example.org/b' }
		]);
	});

	it('keeps only the first occurrence of a duplicated URL', () => {
		// A publication whose `url` is already its DOI must not list it twice.
		const links = buildLinks([
			{ label: 'Source', url: 'https://doi.org/10.1000/xyz' },
			{ label: 'DOI', url: 'https://doi.org/10.1000/xyz' }
		]);
		expect(links).toEqual([{ label: 'Source', url: 'https://doi.org/10.1000/xyz' }]);
	});
});

describe('compact', () => {
	it('drops undefined, null, empty-string and empty-array values', () => {
		expect(
			compact({
				id: 'a',
				title: undefined,
				doi: null,
				abstract: '',
				tags: [],
				year: 2024
			})
		).toEqual({ id: 'a', year: 2024 });
	});

	it('keeps falsy values that carry information', () => {
		expect(compact({ featured: false, count: 0 })).toEqual({ featured: false, count: 0 });
	});

	it('leaves populated arrays and nested objects intact', () => {
		const nested = { latitude: 1, longitude: 2 };
		expect(compact({ tags: ['islam'], coordinates: nested })).toEqual({
			tags: ['islam'],
			coordinates: nested
		});
	});
});

describe('datasetPayload', () => {
	it('wraps items with a version, a self-locating URL and a count', () => {
		expect(datasetPayload('publications', [{ id: 'a' }, { id: 'b' }])).toEqual({
			version: API_VERSION,
			dataset: 'publications',
			url: `${SITE}/api/publications.json`,
			count: 2,
			items: [{ id: 'a' }, { id: 'b' }]
		});
	});
});

describe('jsonResponse', () => {
	it('serialises the payload as readable JSON', async () => {
		const response = jsonResponse({ a: 1 });
		await expect(response.text()).resolves.toBe('{\n\t"a": 1\n}');
	});

	it('declares JSON, caching and cross-origin access', () => {
		const { headers } = jsonResponse({});
		expect(headers.get('Content-Type')).toBe('application/json; charset=utf-8');
		expect(headers.get('Cache-Control')).toBe('max-age=3600, s-maxage=3600');
		expect(headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
	});
});
