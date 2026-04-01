<!--
ECharts Horizontal Bar Chart component
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColor,
		getEChartsTooltipStyle,
		getEChartsAxisLineStyle,
		getEChartsSplitLineStyle,
		getAnimationConfig
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import { getAriaConfig } from '$lib/utils/chartActions';

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

	// Container reference
	let chartContainer: HTMLDivElement;

	// Toolbar state
	let showDecal = $state(false);

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

	// Calculate smart x-axis interval based on max value
	const xAxisInterval = $derived(() => {
		const values = chartData.map((d) => d.value);
		const maxVal = maxValue ?? Math.max(...values, 1);
		// Aim for approximately 5-8 tick marks
		if (maxVal <= 10) return 1;
		if (maxVal <= 20) return 2;
		if (maxVal <= 50) return 5;
		if (maxVal <= 100) return 10;
		if (maxVal <= 200) return 20;
		return Math.ceil(maxVal / 5 / 10) * 10; // Round to nice intervals
	});
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
			interval: xAxisInterval(),
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
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 1,
						y2: 0,
						colorStops: [
							{
								offset: 0,
								color: `color-mix(in srgb, ${resolvedColors.barColor} 60%, transparent)`
							},
							{ offset: 1, color: resolvedColors.barColor }
						]
					},
					borderRadius: [0, 4, 4, 0]
				},
				emphasis: {
					itemStyle: {
						color: resolvedColors.barColor,
						shadowColor: `color-mix(in srgb, ${resolvedColors.primary} 40%, transparent)`,
						shadowBlur: 12,
						shadowOffsetX: 4
					}
				},
				...getAnimationConfig(1000, 'elasticOut')
			}
		],
		aria: getAriaConfig(showDecal),
		backgroundColor: 'transparent'
	});

	// Use the ECharts hook for lifecycle management
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => chartData.length > 0
	});
</script>

<div class="echarts-container scroll-reveal">
	<ChartToolbar
		chart={echartsInstance.chart}
		bind:showDecal
		filename={xAxisLabel || 'horizontal-bar-chart'}
	/>
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
