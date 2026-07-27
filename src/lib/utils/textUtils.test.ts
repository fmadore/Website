import { describe, expect, it } from 'vitest';
import { formatDisplayUrl } from './textUtils';

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
