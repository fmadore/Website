import { describe, it, expect } from 'vitest';
import {
	formatDisplayDate,
	formatDayMonth,
	formatShortDateMono,
	getYearFromISODate,
	isForthcoming
} from './date-formatter';

describe('formatDisplayDate', () => {
	it('formats a full ISO date as "DD Month YYYY"', () => {
		expect(formatDisplayDate('2025-03-21')).toBe('21 March 2025');
	});

	it('returns the input unchanged when it is not a full ISO date', () => {
		expect(formatDisplayDate('2025')).toBe('2025');
		expect(formatDisplayDate('forthcoming')).toBe('forthcoming');
		expect(formatDisplayDate('')).toBe('');
	});
});

describe('formatDayMonth', () => {
	it('formats a full ISO date as day + month only', () => {
		expect(formatDayMonth('2025-03-21')).toBe('21 March');
	});

	it('returns the input unchanged when not a full ISO date', () => {
		expect(formatDayMonth('2025-03')).toBe('2025-03');
	});
});

describe('formatShortDateMono', () => {
	it('formats a full ISO date in the uppercase mono form', () => {
		expect(formatShortDateMono('2025-06-03')).toBe('3 JUN 2025');
		expect(formatShortDateMono('2024-11-30')).toBe('30 NOV 2024');
	});

	it('is a pure string mapping — no timezone day-shift at month boundaries', () => {
		// Jan 1 must stay Jan 1 regardless of the runner's timezone.
		expect(formatShortDateMono('2025-01-01')).toBe('1 JAN 2025');
		expect(formatShortDateMono('2025-12-31')).toBe('31 DEC 2025');
	});

	it('returns an empty string when not a full ISO date', () => {
		expect(formatShortDateMono('2025')).toBe('');
		expect(formatShortDateMono('')).toBe('');
	});
});

describe('getYearFromISODate', () => {
	it('extracts the year from a full ISO date', () => {
		expect(getYearFromISODate('2019-06-01')).toBe(2019);
	});

	it('falls back to the current year for a malformed date', () => {
		expect(getYearFromISODate('nope')).toBe(new Date().getFullYear());
	});
});

describe('isForthcoming', () => {
	it('recognises the English and French labels, case-insensitively', () => {
		expect(isForthcoming({ date: 'Forthcoming' })).toBe(true);
		expect(isForthcoming({ date: 'à paraître' })).toBe(true);
		expect(isForthcoming({ date: 'a paraitre' })).toBe(true);
	});

	it('is false for a real date or missing value', () => {
		expect(isForthcoming({ date: '2025' })).toBe(false);
		expect(isForthcoming({})).toBe(false);
	});
});
