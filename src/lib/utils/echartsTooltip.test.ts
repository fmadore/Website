import { describe, expect, it } from 'vitest';
import { visibleChartBounds } from './echartsTooltip';

const viewport = { left: 0, top: 0, width: 1280, height: 700 };

describe('visibleChartBounds', () => {
	it('is the chart box when the chart sits wholly in the viewport', () => {
		expect(visibleChartBounds({ left: 32, top: 100, width: 1200, height: 400 }, viewport)).toEqual({
			left: 32,
			top: 100,
			width: 1200,
			height: 400
		});
	});

	it('cuts the chart box at the viewport edge it crosses', () => {
		expect(visibleChartBounds({ left: 32, top: -150, width: 1200, height: 400 }, viewport)).toEqual(
			{
				left: 32,
				top: 0,
				width: 1200,
				height: 250
			}
		);
	});

	it('collapses to nothing for a chart scrolled out of view', () => {
		const bounds = visibleChartBounds({ left: 32, top: 800, width: 1200, height: 400 }, viewport);
		expect(bounds.height).toBe(0);
	});
});
