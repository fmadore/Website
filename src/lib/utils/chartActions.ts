/**
 * Chart Actions Utilities
 *
 * Reusable utilities for ECharts chart actions:
 * - Download chart as PNG image
 * - Toggle decal patterns for accessibility
 */

import type * as echarts from 'echarts';
import { getCSSVariableValueWithFallback, CHART_COLOR_FALLBACKS } from './chartColorUtils';

/**
 * Downloads an ECharts chart instance as a PNG image.
 * Uses the current theme's surface color as background for readability.
 *
 * @param chart - The ECharts instance
 * @param filename - The filename (without extension) for the downloaded image
 */
export function downloadChartAsImage(chart: echarts.ECharts, filename: string = 'chart'): void {
	if (!chart || chart.isDisposed()) return;

	const bgColor = getCSSVariableValueWithFallback('--color-surface', CHART_COLOR_FALLBACKS.surface);

	const url = chart.getDataURL({
		type: 'png',
		pixelRatio: 2,
		backgroundColor: bgColor,
		excludeComponents: ['toolbox']
	});

	const link = document.createElement('a');
	link.download = `${filename}.png`;
	link.href = url;
	link.click();
}

/**
 * Creates an aria configuration object for ECharts.
 * Enables screen reader labels and optionally decal patterns.
 *
 * @param showDecal - Whether to show decal patterns
 * @returns ECharts aria configuration object
 */
export function getAriaConfig(showDecal: boolean): Record<string, unknown> {
	return {
		enabled: true,
		decal: {
			show: showDecal
		}
	};
}
