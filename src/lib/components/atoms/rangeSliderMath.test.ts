import { describe, it, expect } from 'vitest';
import { targetHandle } from './rangeSliderMath';

describe('targetHandle', () => {
	it('always drives the max handle in single mode', () => {
		expect(targetHandle(0, [0, 50], true)).toBe('max');
		expect(targetHandle(100, [0, 50], true)).toBe('max');
	});

	it('picks the nearer handle of an open range', () => {
		expect(targetHandle(2014, [2013, 2026])).toBe('min');
		expect(targetHandle(2025, [2013, 2026])).toBe('max');
	});

	it('keeps the min handle at the dead centre of an open range', () => {
		// Nothing to widen: the click is inside the window either way.
		expect(targetHandle(2015, [2010, 2020])).toBe('min');
	});

	describe('collapsed range (both handles on one year)', () => {
		it('moves the max handle for a click above the shared value', () => {
			expect(targetHandle(2020, [2018, 2018])).toBe('max');
			expect(targetHandle(2019, [2018, 2018])).toBe('max');
		});

		it('moves the min handle for a click below the shared value', () => {
			expect(targetHandle(2015, [2018, 2018])).toBe('min');
			expect(targetHandle(2017, [2018, 2018])).toBe('min');
		});

		it('does not move either bound past the other on the value itself', () => {
			expect(targetHandle(2018, [2018, 2018])).toBe('min');
		});
	});
});
