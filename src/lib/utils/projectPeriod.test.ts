import { describe, expect, it } from 'vitest';
import { formatProjectPeriod, parseProjectPeriod } from './projectPeriod';
import { allResearchProjects } from '#lib/data/research/index.ts';

describe('formatProjectPeriod', () => {
	it('sets a closed span with a closed-up en dash', () => {
		expect(formatProjectPeriod('2013-2018')).toBe('2013–2018');
		expect(formatProjectPeriod('2013 – 2018')).toBe('2013–2018');
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

describe('parseProjectPeriod', () => {
	it('reads a closed span', () => {
		expect(parseProjectPeriod('2013-2018', 2026)).toEqual({
			startYear: 2013,
			endYear: 2018,
			ongoing: false
		});
	});

	it('ends an open-ended span at the year it is given', () => {
		expect(parseProjectPeriod('2025-', 2026)).toEqual({
			startYear: 2025,
			endYear: 2026,
			ongoing: true
		});
	});

	it('never ends an open-ended span before it starts', () => {
		expect(parseProjectPeriod('2028-', 2026)).toEqual({
			startYear: 2028,
			endYear: 2028,
			ongoing: true
		});
	});

	it('reads a single year, an en dash and stray spaces', () => {
		expect(parseProjectPeriod('2020', 2026)).toEqual({
			startYear: 2020,
			endYear: 2020,
			ongoing: false
		});
		expect(parseProjectPeriod(' 2013 – 2018 ', 2026)).toMatchObject({
			startYear: 2013,
			endYear: 2018
		});
	});

	it('refuses what is not a period', () => {
		expect(parseProjectPeriod(undefined, 2026)).toBeUndefined();
		expect(parseProjectPeriod('', 2026)).toBeUndefined();
		expect(parseProjectPeriod('ongoing', 2026)).toBeUndefined();
		expect(parseProjectPeriod('2018-2013', 2026)).toBeUndefined();
	});

	it('parses every project on the site', () => {
		for (const project of allResearchProjects) {
			expect(parseProjectPeriod(project.years, 2026), project.id).toBeDefined();
		}
	});
});
