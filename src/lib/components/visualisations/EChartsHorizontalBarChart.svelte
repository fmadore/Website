<!--
ECharts Horizontal Bar Chart component
-->
<script lang="ts">
	import type * as echarts from 'echarts';
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColor,
		getEChartsTooltipStyle,
		getEChartsAxisLineStyle,
		getEChartsSplitLineStyle
	} from '$lib/utils/chartColorUtils';

	// Props - keeping the same interface as your D3 component for easy replacement
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		xAccessor,
		yAccessor,
		xAxisLabel = '',
		yAxisLabel = '',
		barColor = 'var(--color-primary)',
		maxValue
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => number;
		yAccessor: (d: DataItem) => string;
		xAxisLabel?: string;
		yAxisLabel?: string;
		barColor?: string;
		maxValue?: number;
	} = $props();

	// State management
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = $state(null);
	let echartsLib: typeof echarts | null = null;
	let isChartReady = $state(false);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Reactive color resolution
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		barColor: resolveColor(barColor)
	});

	// Chart data transformation - reverse order so highest values appear at top
	const chartData = $derived(
		data
			.map((d) => ({
				name: String(yAccessor(d)),
				value: xAccessor(d)
			}))
			.reverse()
	);
	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		tooltip: {
			trigger: 'axis',
			...getEChartsTooltipStyle(resolvedColors)
		},
		grid: {
			left: isMobile ? '120px' : '150px',
			right: 24,
			top: 24,
			bottom: xAxisLabel ? 80 : 48,
			containLabel: false
		},
		xAxis: {
			type: 'value',
			name: xAxisLabel,
			nameLocation: 'middle',
			nameGap: 30,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: resolvedColors.fontFamily
			},
			axisLabel: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: resolvedColors.fontFamily,
				formatter: function (value: number) {
					return Number.isInteger(value) ? value.toString() : '';
				}
			},
			interval: 1,
			minInterval: 1,
			max: maxValue,
			axisLine: getEChartsAxisLineStyle(resolvedColors),
			axisTick: getEChartsAxisLineStyle(resolvedColors),
			splitLine: getEChartsSplitLineStyle(resolvedColors)
		},
		yAxis: {
			type: 'category',
			data: chartData.map((d) => d.name),
			name: yAxisLabel,
			nameLocation: 'middle',
			nameGap: 120,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: resolvedColors.fontFamily
			},
			axisLabel: {
				color: resolvedColors.text,
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily,
				width: isMobile ? 100 : 130,
				overflow: 'truncate'
			},
			axisLine: getEChartsAxisLineStyle(resolvedColors),
			axisTick: getEChartsAxisLineStyle(resolvedColors)
		},
		series: [
			{
				name: xAxisLabel || 'Value',
				type: 'bar',
				data: chartData.map((d) => d.value),
				itemStyle: {
					color: resolvedColors.barColor,
					borderRadius: [0, 4, 4, 0]
				},
				emphasis: {
					itemStyle: {
						color: resolvedColors.primaryDark,
						shadowColor: resolvedColors.primary,
						shadowBlur: 10
					}
				},
				animationDuration: 1000,
				animationEasing: 'elasticOut' as any
			}
		],
		backgroundColor: 'transparent'
	});

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

			// Initialize chart only when container is available and chart doesn't exist
			if (chartContainer && !chart && echartsLib) {
				try {
					chart = echartsLib.init(chartContainer);

					// Setup resize observer after chart is created
					resizeObserver = new ResizeObserver(() => {
						if (chart && !chart.isDisposed()) {
							chart.resize();
						}
					});
					resizeObserver.observe(chartContainer);
					isChartReady = true;
				} catch (error) {
					console.error('Failed to initialize ECharts:', error);
					return;
				}
			}
		})();

		return () => {
			mounted = false;
			isChartReady = false;
			resizeObserver?.disconnect();
			if (chart && !chart.isDisposed()) {
				chart.dispose();
				chart = null;
			}
		};
	});

	// Separate effect for updating chart when options change
	$effect(() => {
		if (isChartReady && chart && !chart.isDisposed() && chartData.length > 0) {
			try {
				chart.setOption(chartOption, true);
			} catch (error) {
				console.error('Failed to update chart options:', error);
			}
		}
	});
</script>

<div class="echarts-container scroll-reveal">
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 100%;
		display: block;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
		height: 100%;
	}
</style>
