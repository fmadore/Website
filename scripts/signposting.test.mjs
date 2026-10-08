import { describe, expect, it } from 'vitest';
import { extractLinks, signpostingProblems } from './lib/signposting.mjs';

const ORIGIN = 'https://www.frederickmadore.com';

describe('extractLinks', () => {
	it('reads every link element, whatever its quoting, attribute order or closing', () => {
		expect(
			extractLinks(
				'<link rel="type" href="https://schema.org/Book"/>' +
					"<link href='/a?x=1&amp;y=2' rel='describedby' type='application/x-bibtex'>"
			)
		).toEqual([
			{ rel: 'type', href: 'https://schema.org/Book' },
			{ href: '/a?x=1&y=2', rel: 'describedby', type: 'application/x-bibtex' }
		]);
	});
});

describe('signpostingProblems', () => {
	const landing = (describedby) =>
		'<link rel="type" href="https://schema.org/Article"/>' +
		'<link rel="type" href="https://schema.org/AboutPage"/>' +
		describedby;

	it('passes a landing page whose metadata is typed and shipped', () => {
		expect(
			signpostingProblems({
				html: landing(
					`<link rel="describedby" href="${ORIGIN}/publications/x.bib" type="application/x-bibtex"/>`
				),
				origin: ORIGIN,
				ships: (path) => path === '/publications/x.bib'
			})
		).toEqual({ problems: [], described: ['/publications/x.bib'] });
	});

	it('flags metadata the build did not ship, and a link without a media type', () => {
		const { problems } = signpostingProblems({
			html: landing(`<link rel="describedby" href="${ORIGIN}/publications/x.bib"/>`),
			origin: ORIGIN,
			ships: () => false
		});
		expect(problems).toEqual([
			`describedby ${ORIGIN}/publications/x.bib names no media type`,
			`describedby ${ORIGIN}/publications/x.bib, which the build did not ship`
		]);
	});

	it('requires a describedby link on a landing page, and only there', () => {
		expect(signpostingProblems({ html: landing(''), origin: ORIGIN, ships: () => true })).toEqual({
			problems: ['a Signposting landing page (type AboutPage) with no describedby link'],
			described: []
		});
		expect(
			signpostingProblems({
				html: '<link rel="canonical" href="https://x"/>',
				origin: ORIGIN,
				ships: () => true
			}).problems
		).toEqual([]);
	});

	it('takes metadata hosted elsewhere on trust', () => {
		expect(
			signpostingProblems({
				html: landing(
					'<link rel="describedby" href="https://doi.org/10.1/x" type="application/vnd.citationstyles.csl+json"/>'
				),
				origin: ORIGIN,
				ships: () => false
			})
		).toEqual({ problems: [], described: [] });
	});
});
