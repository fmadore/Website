import { describe, expect, it } from 'vitest';
import { formatDisplayUrl, stripHtml } from './textUtils';

describe('stripHtml', () => {
	it('unwraps the inline markup abstracts carry', () => {
		expect(stripHtml("L'importance du <i>hadj</i> et les sommes")).toBe(
			"L'importance du hadj et les sommes"
		);
		expect(stripHtml('the <em>Islam West Africa Collection</em> corpus')).toBe(
			'the Islam West Africa Collection corpus'
		);
	});

	it('drops script and style blocks with their contents', () => {
		expect(stripHtml('a<script>alert(1)</script>b')).toBe('ab');
		expect(stripHtml('a<style>p{color:red}</style>b')).toBe('ab');
	});

	it('resists nested-tag bypasses', () => {
		expect(stripHtml('<scrip<script>t>alert(1)</script>')).not.toContain('script');
	});

	it('collapses whitespace left behind and trims', () => {
		expect(stripHtml('<p>one</p>\n\n<p>two</p>')).toBe('one two');
	});

	it('leaves plain text untouched', () => {
		expect(stripHtml('no markup here')).toBe('no markup here');
	});
});

describe('formatDisplayUrl', () => {
	it('strips the scheme', () => {
		expect(formatDisplayUrl('https://islam.zmo.de/s/westafrica')).toBe('islam.zmo.de/s/westafrica');
		expect(formatDisplayUrl('http://example.org/path')).toBe('example.org/path');
	});

	it('strips a leading www.', () => {
		expect(formatDisplayUrl('https://www.wikidata.org')).toBe('wikidata.org');
	});

	it('strips trailing slashes', () => {
		expect(formatDisplayUrl('https://heshmat.zmo.de/')).toBe('heshmat.zmo.de');
		expect(formatDisplayUrl('https://fmadore.github.io/IWAC-sentiment-analysis/')).toBe(
			'fmadore.github.io/IWAC-sentiment-analysis'
		);
	});

	it('keeps query strings and deep paths intact', () => {
		expect(formatDisplayUrl('https://github.com/fmadore/IwacSearch')).toBe(
			'github.com/fmadore/IwacSearch'
		);
		expect(formatDisplayUrl('https://example.org/a?b=c')).toBe('example.org/a?b=c');
	});

	it('leaves a bare host untouched and trims surrounding whitespace', () => {
		expect(formatDisplayUrl('  islam.zmo.de  ')).toBe('islam.zmo.de');
	});
});
