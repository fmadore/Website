/**
 * ECharts Initialization Hook
 *
 * Centralized lifecycle management for ECharts components.
 * Handles dynamic import, optional extension loading, initialization, resize
 * observation, and cleanup.
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
 *
 * Charts that need an ECharts extension (e.g. `echarts-wordcloud`) or must wait
 * for the container to have real dimensions pass the optional `loadExtensions`
 * / `requireDimensions` hooks instead of reimplementing the lifecycle:
 *
 * ```ts
 * useECharts({
 *   getContainer: () => chartContainer,
 *   getOption: () => chartOption,
 *   hasData: () => words.length > 0,
 *   loadExtensions: () => import('echarts-wordcloud').then(() => undefined),
 *   requireDimensions: true
 * });
 * ```
 */

import type * as echarts from '$lib/utils/echartsCore';

/** Options accepted by ECharts' `setOption`, in object form. */
export interface EChartsSetOptionOpts {
	notMerge?: boolean;
	lazyUpdate?: boolean;
	silent?: boolean;
}

export interface UseEChartsOptions {
	/** Returns the container element (may be undefined during initial render) */
	getContainer: () => HTMLDivElement | undefined;
	/** Returns the current chart options (accepts any ECharts-compatible option object) */
	getOption: () => Record<string, unknown>;
	/** Returns whether there is data to display */
	hasData: () => boolean;
	/**
	 * Optional async hook run after `echarts` loads but before `init`. Use it to
	 * pull in an ECharts extension that registers itself on the core module
	 * (e.g. `() => import('echarts-wordcloud').then(() => undefined)`).
	 */
	loadExtensions?: () => Promise<void>;
	/** Optional `echarts.init` options (e.g. `{ renderer: 'svg' }`). */
	initOptions?: Parameters<typeof echarts.init>[2];
	/**
	 * Defer initialization until the container reports non-zero dimensions.
	 * Prevents ECharts' "Can't get DOM width or height" warning for charts whose
	 * height resolves after the first effect tick (e.g. the word cloud).
	 */
	requireDimensions?: boolean;
	/**
	 * Options passed to `setOption` on every update. Defaults to
	 * `{ notMerge: true }` — each update fully replaces the previous option.
	 */
	setOptionOpts?: EChartsSetOptionOpts;
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
 * - Dynamic import of the ECharts library (+ optional extensions)
 * - Chart initialization when the container is available (and, optionally, sized)
 * - ResizeObserver for responsive sizing
 * - Automatic option updates when data/options change
 * - Proper cleanup on component unmount
 *
 * @param options - Configuration options
 * @returns Object with chart instance and ready state
 */
export function useECharts(options: UseEChartsOptions): UseEChartsReturn {
	const {
		getContainer,
		getOption,
		hasData,
		loadExtensions,
		initOptions,
		requireDimensions = false,
		setOptionOpts
	} = options;

	// Internal state
	let chart: echarts.ECharts | null = $state(null);
	let echartsLib: typeof echarts | null = null;
	let isReady = $state(false);

	// Effect for initialization and cleanup
	$effect(() => {
		let mounted = true;
		let resizeObserver: ResizeObserver | undefined;

		// Attempt to initialize the chart. No-ops until the library is loaded, the
		// container exists, and (when required) it has non-zero dimensions.
		const tryInit = (container: HTMLDivElement) => {
			if (!mounted || chart || !echartsLib) return;
			if (requireDimensions) {
				const rect = container.getBoundingClientRect();
				if (rect.width < 1 || rect.height < 1) return; // wait for a sized resize callback
			}
			try {
				chart = echartsLib.init(container, undefined, initOptions);
				isReady = true;
			} catch (error) {
				if (import.meta.env.DEV) console.error('Failed to initialize ECharts:', error);
			}
		};

		// Load echarts library (+ extensions) and initialize the chart
		(async () => {
			if (!echartsLib) {
				try {
					// Tree-shaken core (see echartsCore.ts) — never the full 'echarts'.
					const echartsModule = await import('$lib/utils/echartsCore');
					if (!mounted) return;
					echartsLib = echartsModule;
				} catch (error) {
					if (import.meta.env.DEV) console.error('Failed to load ECharts:', error);
					return;
				}
			}

			if (loadExtensions) {
				try {
					await loadExtensions();
				} catch (error) {
					if (import.meta.env.DEV) console.error('Failed to load ECharts extension:', error);
					return;
				}
				if (!mounted) return;
			}

			const container = getContainer();
			if (!container) return;

			// Setup resize observer: it both drives the deferred first init (for
			// requireDimensions) and handles subsequent resizes.
			resizeObserver = new ResizeObserver(() => {
				if (!mounted) return;
				if (!chart) {
					tryInit(container);
				} else if (!chart.isDisposed()) {
					chart.resize();
				}
			});
			resizeObserver.observe(container);

			// Immediate attempt covers the common (already-sized, no-extension) case;
			// for requireDimensions it no-ops until the observer delivers real dims.
			tryInit(container);
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
				// Object-form setOption for clarity; default fully replaces the option.
				chart.setOption(getOption(), setOptionOpts ?? { notMerge: true });
			} catch (error) {
				if (import.meta.env.DEV) console.error('Failed to update chart options:', error);
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
