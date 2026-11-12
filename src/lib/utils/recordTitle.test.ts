import { describe, expect, it } from 'vitest';
import { titleLength, titleSegments, LONG_TITLE_CHARS, XLONG_TITLE_CHARS } from './recordTitle.ts';

describe('titleLength', () => {
	it('leaves a short title at the display size', () => {
		expect(titleLength('AMIRA')).toBeUndefined();
		expect(titleLength('x'.repeat(LONG_TITLE_CHARS))).toBeUndefined();
	});

	it('steps a long title down once, and a very long one twice', () => {
		expect(titleLength('x'.repeat(LONG_TITLE_CHARS + 1))).toBe('long');
		expect(titleLength('x'.repeat(XLONG_TITLE_CHARS))).toBe('long');
		expect(titleLength('x'.repeat(XLONG_TITLE_CHARS + 1))).toBe('xlong');
	});

	it('counts characters, not UTF-16 units, and ignores edge whitespace', () => {
		expect(titleLength(`  ${'é'.repeat(LONG_TITLE_CHARS)}  `)).toBeUndefined();
	});
});

describe('titleSegments', () => {
	it('returns the title whole when it holds no year range', () => {
		expect(titleSegments('Religious Activism on Campuses')).toEqual([
			{ text: 'Religious Activism on Campuses', nowrap: false }
		]);
		expect(titleSegments('')).toEqual([{ text: '', nowrap: false }]);
	});

	it('isolates an en-dash or hyphen year range as an unbreakable run', () => {
		expect(titleSegments('Islam in Togo, 1970–2023: a history')).toEqual([
			{ text: 'Islam in Togo, ', nowrap: false },
			{ text: '1970–2023', nowrap: true },
			{ text: ': a history', nowrap: false }
		]);
		expect(titleSegments('Campuses 1990-2010')).toEqual([
			{ text: 'Campuses ', nowrap: false },
			{ text: '1990-2010', nowrap: true }
		]);
	});

	it('finds every range and leaves a lone year or a longer number alone', () => {
		expect(titleSegments('1960–1990 and 2000–2020').map((s) => s.nowrap)).toEqual([
			true,
			false,
			true
		]);
		expect(titleSegments('In 2013, ISBN 12345–67890')).toEqual([
			{ text: 'In 2013, ISBN 12345–67890', nowrap: false }
		]);
	});

	it('loses no character', () => {
		const title = 'L’islam politique à Ouagadougou (1990–2013) : 2001-2005';
		expect(
			titleSegments(title)
				.map((s) => s.text)
				.join('')
		).toBe(title);
	});
});
