import { describe, expect, it } from 'vitest';
import { formatProjectPeriod, isOpenEndedPeriod } from './projectPeriod';
import { allResearchProjects } from '$lib/data/research';

describe('formatProjectPeriod', () => {
	it('sets a closed span with a spaced en dash', () => {
		expect(formatProjectPeriod('2013-2018')).toBe('2013 – 2018');
	});

	it('reads an open-ended span as "Since <year>"', () => {
		expect(formatProjectPeriod('2026-')).toBe('Since 2026');
	});

	it('leaves a single year alone', () => {
		expect(formatProjectPeriod('2020')).toBe('2020');
	});

	it('returns an empty string for a missing period', () => {
		expect(formatProjectPeriod(undefined)).toBe('');
		expect(formatProjectPeriod('')).toBe('');
	});

	it('never leaves a hyphen dangling for any project on the site', () => {
		for (const project of allResearchProjects) {
			const printed = formatProjectPeriod(project.years);
			expect(printed).not.toMatch(/-\s*$/);
			expect(printed).not.toBe('');
		}
	});
});

describe('isOpenEndedPeriod', () => {
	it('is true only for a trailing hyphen', () => {
		expect(isOpenEndedPeriod('2026-')).toBe(true);
		expect(isOpenEndedPeriod('2025-2027')).toBe(false);
		expect(isOpenEndedPeriod(undefined)).toBe(false);
	});
});
