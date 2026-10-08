import { describe, expect, it } from 'vitest';
import { website } from '$lib/data/siteConfig';
import {
	SITE_ORIGIN,
	extractJsonLdBlocks,
	isIsoDate,
	structuredDataProblems,
	urlProblem
} from './lib/structured-data.mjs';

it('checks against the origin siteConfig publishes', () => {
	expect(SITE_ORIGIN).toBe(website.url);
});

describe('extractJsonLdBlocks', () => {
	it('finds every block whatever the attribute order, and nothing else', () => {
		const html =
			'<script type="application/ld+json" id="a">{"a":1}</script>' +
			'<script>var x = 1;</script>' +
			'<script id="b" type="application/ld+json">{"b":"\\u003c"}</script>';
		expect(extractJsonLdBlocks(html).map((body) => JSON.parse(body))).toEqual([
			{ a: 1 },
			{ b: '<' }
		]);
	});
});

describe('isIsoDate', () => {
	it.each(['2017', '2017-05', '2017-05-12', '2026-08-12T00:00:00Z', '2024-02-29T09:30+02:00'])(
		'accepts %s',
		(value) => expect(isIsoDate(value)).toBe(true)
	);

	it.each([
		'2017T00:00:00+01:00',
		'2026-05T00:00:00+01:00',
		'2017-13',
		'2023-02-29',
		'2017-05-12T24:00:00Z',
		'May 2017',
		''
	])('rejects %s', (value) => expect(isIsoDate(value)).toBe(false));
});

describe('urlProblem', () => {
	it.each([
		`${SITE_ORIGIN}`,
		`${SITE_ORIGIN}/`,
		`${SITE_ORIGIN}/publications/x#record`,
		'https://doi.org/10.1163/x',
		'http://example.org/legacy',
		'https://slides.frederickmadore.com/talks/x/'
	])('accepts %s', (value) => expect(urlProblem(value)).toBeNull());

	it.each([
		['/publications/x', 'not an absolute URL'],
		['//images/a.webp', 'not an absolute URL'],
		['../activities', 'not an absolute URL'],
		[`${SITE_ORIGIN}../activities`, `not on the canonical origin ${SITE_ORIGIN}/`],
		['http://www.frederickmadore.com/cv', `not on the canonical origin ${SITE_ORIGIN}/`],
		['https://frederickmadore.com/cv', `not on the canonical origin ${SITE_ORIGIN}/`]
	])('rejects %s', (value, problem) => expect(urlProblem(value)).toBe(problem));
});

describe('structuredDataProblems', () => {
	it('walks graphs and arrays, checking URL-valued keys and dates wherever they sit', () => {
		const data = {
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'BreadcrumbList',
					itemListElement: [
						{ '@type': 'ListItem', position: 1, item: `${SITE_ORIGIN}/` },
						{ '@type': 'ListItem', position: 2, item: `${SITE_ORIGIN}../activities` }
					]
				},
				{
					'@type': 'Book',
					url: '/publications/x',
					image: `${SITE_ORIGIN}/images/x.webp`,
					datePublished: '2017T00:00:00+01:00',
					mainEntityOfPage: { '@id': `${SITE_ORIGIN}/publications/x#webpage` },
					sameAs: ['https://ror.org/0234wmv40', '//images/y.webp']
				}
			]
		};
		expect(structuredDataProblems(data)).toEqual([
			{
				key: 'item',
				value: `${SITE_ORIGIN}../activities`,
				problem: `not on the canonical origin ${SITE_ORIGIN}/`
			},
			{ key: 'url', value: '/publications/x', problem: 'not an absolute URL' },
			{ key: 'datePublished', value: '2017T00:00:00+01:00', problem: 'not an ISO 8601 date' },
			{ key: 'sameAs', value: '//images/y.webp', problem: 'not an absolute URL' }
		]);
	});

	it('leaves prose and identifiers that are not URLs alone', () => {
		expect(
			structuredDataProblems({
				name: 'Religious Activism on Campuses / 2024',
				description: 'Text that mentions /publications in passing.',
				identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: '10.1163/x' },
				copyrightYear: 2024
			})
		).toEqual([]);
	});
});
