import { describe, it, expect } from 'vitest';
import { niceTickInterval, tickBudgetForWidth } from './chartAxis';

describe('niceTickInterval', () => {
	it('reproduces the ladder the bar chart used to hardcode', () => {
		// The old staircase, at its old budget of ten intervals.
		expect(niceTickInterval(10, 10)).toBe(1);
		expect(niceTickInterval(20, 10)).toBe(2);
		expect(niceTickInterval(50, 10)).toBe(5);
		expect(niceTickInterval(100, 10)).toBe(10);
		expect(niceTickInterval(200, 10)).toBe(20);
	});

	it('only ever returns a 1–2–5 step', () => {
		for (let max = 1; max <= 400; max++) {
			for (const budget of [4, 6, 10]) {
				const interval = niceTickInterval(max, budget);
				const mantissa = interval / 10 ** Math.floor(Math.log10(interval));
				expect([1, 2, 5]).toContain(Math.round(mantissa));
			}
		}
	});

	it('keeps the axis inside its budget', () => {
		for (let max = 1; max <= 400; max++) {
			for (const budget of [4, 6, 10]) {
				expect(max / niceTickInterval(max, budget)).toBeLessThanOrEqual(budget);
			}
		}
	});

	it('spends a narrow budget on a coarser interval', () => {
		expect(niceTickInterval(40, 10)).toBe(5);
		expect(niceTickInterval(40, 4)).toBe(10);
		expect(niceTickInterval(12, 4)).toBe(5);
	});

	it('never returns an interval below 1, whatever it is handed', () => {
		expect(niceTickInterval(0, 10)).toBe(1);
		expect(niceTickInterval(1, 10)).toBe(1);
		expect(niceTickInterval(0.4, 10)).toBe(1);
		expect(niceTickInterval(Number.NaN, 10)).toBe(1);
		expect(niceTickInterval(10, 0)).toBeGreaterThanOrEqual(1);
	});
});

describe('tickBudgetForWidth', () => {
	it('caps a wide plate at ten intervals', () => {
		expect(tickBudgetForWidth(900)).toBe(10);
		expect(tickBudgetForWidth(700)).toBe(10);
	});

	it('floors a phone plate at four', () => {
		expect(tickBudgetForWidth(200)).toBe(4);
		expect(tickBudgetForWidth(60)).toBe(4);
	});

	it('scales in between', () => {
		expect(tickBudgetForWidth(420)).toBe(6);
	});

	it('falls back to the wide budget before the first measurement', () => {
		expect(tickBudgetForWidth(0)).toBe(10);
		expect(tickBudgetForWidth(-5)).toBe(10);
		expect(tickBudgetForWidth(Number.NaN)).toBe(10);
	});
});
