/**
 * ECharts Initialization Hook
 *
 * Centralized lifecycle management for ECharts components.
 * Handles dynamic import, initialization, resize observation, and cleanup.
 *
 * Usage:
 * ```svelte
 * <script lang="ts">
 *   import { useECharts } from '$lib/utils/useECharts.svelte';
 *
 *   let chartContainer: HTMLDivElement;
 *   const chartOption = $derived({ ... });
 *
 *   const { chart, isReady } = useECharts({
 *     getContainer: () => chartContainer,
 *     getOption: () => chartOption,
 *     hasData: () => data.length > 0
 *   });
 * </script>
 *
 * <div bind:this={chartContainer}></div>
 * ```
 */

import type * as echarts from 'echarts';

export interface UseEChartsOptions {
	/** Returns the container element (may be undefined during initial render) */
	getContainer: () => HTMLDivElement | undefined;
	/** Returns the current chart options (accepts any ECharts-compatible option object) */
	getOption: () => Record<string, unknown>;
	/** Returns whether there is data to display */
	hasData: () => boolean;
}

export interface UseEChartsReturn {
	/** The ECharts instance (reactive) */
	readonly chart: echarts.ECharts | null;
	/** Whether the chart is ready for updates (reactive) */
	readonly isReady: boolean;
}

/**
 * Creates an ECharts instance with automatic lifecycle management.
 *
 * This hook handles:
 * - Dynamic import of the ECharts library
 * - Chart initialization when container is available
 * - ResizeObserver for responsive sizing
 * - Automatic option updates when data/options change
 * - Proper cleanup on component unmount
 *
 * @param options - Configuration options
 * @returns Object with chart instance and ready state
 */
export function useECharts(options: UseEChartsOptions): UseEChartsReturn {
	const { getContainer, getOption, hasData } = options;

	// Internal state
	let chart: echarts.ECharts | null = $state(null);
	let echartsLib: typeof echarts | null = null;
	let isReady = $state(false);

	// Effect for initialization and cleanup
	$effect(() => {
		let mounted = true;
		let resizeObserver: ResizeObserver | undefined;

		// Load echarts library and initialize chart
		(async () => {
			if (!echartsLib) {
				try {
					const echartsModule = await import('echarts');
					if (mounted) {
						echartsLib = echartsModule;
					}
				} catch (error) {
					console.error('Failed to load ECharts:', error);
					return;
				}
			}

			const container = getContainer();

			// Initialize chart only when container is available and chart doesn't exist
			if (container && !chart && echartsLib) {
				try {
					chart = echartsLib.init(container);

					// Setup resize observer after chart is created
					resizeObserver = new ResizeObserver(() => {
						if (chart && !chart.isDisposed()) {
							chart.resize();
						}
					});
					resizeObserver.observe(container);
					isReady = true;
				} catch (error) {
					console.error('Failed to initialize ECharts:', error);
					return;
				}
			}
		})();

		return () => {
			mounted = false;
			isReady = false;
			resizeObserver?.disconnect();
			if (chart && !chart.isDisposed()) {
				chart.dispose();
				chart = null;
			}
		};
	});

	// Separate effect for updating chart when options change
	$effect(() => {
		if (isReady && chart && !chart.isDisposed() && hasData()) {
			try {
				chart.setOption(getOption(), true);
			} catch (error) {
				console.error('Failed to update chart options:', error);
			}
		}
	});

	return {
		get chart() {
			return chart;
		},
		get isReady() {
			return isReady;
		}
	};
}
