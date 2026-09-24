import { describe, it, expect } from 'vitest';
import {
	colorWithOpacity,
	getChartMotion,
	getContrastLabelStyle,
	resolveColor,
	resolveColors
} from './chartColorUtils';

describe('colorWithOpacity', () => {
	it('expands #rgb shorthand to rgba', () => {
		expect(colorWithOpacity('#abc', 0.5)).toBe('rgba(170, 187, 204, 0.5)');
	});

	it('converts #rrggbb to rgba', () => {
		expect(colorWithOpacity('#191509', 0.55)).toBe('rgba(25, 21, 9, 0.55)');
	});

	it('converts rgb() to rgba', () => {
		expect(colorWithOpacity('rgb(10, 20, 30)', 0.25)).toBe('rgba(10, 20, 30, 0.25)');
	});

	it('passes through anything it cannot parse', () => {
		expect(colorWithOpacity('oklch(0.5 0.1 180)', 0.5)).toBe('oklch(0.5 0.1 180)');
		expect(colorWithOpacity('rebeccapurple', 0.5)).toBe('rebeccapurple');
	});
});

describe('getChartMotion', () => {
	// In this Node environment `window` is undefined, so prefersReducedMotion()
	// returns false and the presets resolve to their animated forms.
	it('disables animation entirely for the "none" preset', () => {
		expect(getChartMotion('none')).toEqual({
			animation: false,
			animationDuration: 0,
			animationDurationUpdate: 0,
			animationEasing: 'linear',
			animationEasingUpdate: 'linear'
		});
	});

	it('uses 240ms cubicOut for the "quick" preset (also the default)', () => {
		const quick = {
			animation: true,
			animationDuration: 240,
			animationDurationUpdate: 240,
			animationEasing: 'cubicOut',
			animationEasingUpdate: 'cubicOut'
		};
		expect(getChartMotion('quick')).toEqual(quick);
		expect(getChartMotion()).toEqual(quick);
	});

	it('uses 420ms entrance but 240ms updates for the "settle" preset', () => {
		expect(getChartMotion('settle')).toEqual({
			animation: true,
			animationDuration: 420,
			animationDurationUpdate: 240,
			animationEasing: 'cubicOut',
			animationEasingUpdate: 'cubicOut'
		});
	});
});

describe('getContrastLabelStyle', () => {
	it('uses the ink label without a stroke on a light fill', () => {
		expect(getContrastLabelStyle('#faf7ef')).toEqual({
			color: '#191509',
			textBorderColor: 'transparent',
			textBorderWidth: 0
		});
	});

	it('uses the paper label without a stroke on a dark fill', () => {
		expect(getContrastLabelStyle('#191509')).toEqual({
			color: '#faf7ef',
			textBorderColor: 'transparent',
			textBorderWidth: 0
		});
	});

	it('adds a translucent stroke of the opposite tone when the ratio misses the target', () => {
		// Mid-gray: neither ink nor paper clears the 4.5 default target.
		const style = getContrastLabelStyle('#797979');
		expect(style.textBorderWidth).toBe(2);
		expect(style.textBorderColor).toBe(
			style.color === '#191509' ? 'rgba(250, 247, 239, 0.55)' : 'rgba(25, 21, 9, 0.55)'
		);
	});

	it('honours a custom contrast target', () => {
		// Even ink-on-paper (~15:1) misses an impossible 21:1 target → stroke.
		const style = getContrastLabelStyle('#faf7ef', 21);
		expect(style.color).toBe('#191509');
		expect(style.textBorderColor).toBe('rgba(250, 247, 239, 0.55)');
		expect(style.textBorderWidth).toBe(2);
	});
});

describe('resolveColor / resolveColors', () => {
	// In Node `window` is undefined, so getCSSVariableValue() returns '' and
	// var() references fall back to the original string.
	it('passes plain colors through unchanged', () => {
		expect(resolveColor('#1e6a56')).toBe('#1e6a56');
		expect(resolveColor('rgb(25, 21, 9)')).toBe('rgb(25, 21, 9)');
		expect(resolveColor('oklch(0.5 0.1 180)')).toBe('oklch(0.5 0.1 180)');
	});

	it('returns var() references unchanged when the variable cannot be resolved', () => {
		expect(resolveColor('var(--color-accent)')).toBe('var(--color-accent)');
	});

	it('substitutes "0, 0, 0" for unresolvable rgba(var()) references', () => {
		expect(resolveColor('rgba(var(--color-surface-rgb), 0.5)')).toBe('rgba(0, 0, 0, 0.5)');
	});

	it('maps resolveColor over arrays', () => {
		expect(resolveColors(['#fff', 'var(--x)'])).toEqual(['#fff', 'var(--x)']);
	});
});
