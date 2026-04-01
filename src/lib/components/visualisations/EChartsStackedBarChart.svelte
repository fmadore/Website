<!--
ECharts Stacked Bar Chart component
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColors,
		getEChartsTooltipStyle,
		getEChartsAxisLineStyle,
		getEChartsSplitLineStyle,
		getAnimationConfig
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import { getAriaConfig } from '$lib/utils/chartActions';
	import type { DefaultLabelFormatterCallbackParams } from 'echarts';

	// Props - keeping the same interface as your D3 component for easy replacement
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		keys = [] as string[],
		xAxisLabel = '',
		yAxisLabel = '',
		colors = [
			'var(--color-primary)', // Blog post - teal
			'var(--color-highlight)', // Book - amber
			'var(--color-accent)', // Book chapter - amber
			'var(--color-success)', // Bulletin article - green
			'var(--sys-color-teal-400)', // Conference proceedings - light teal
			'var(--color-secondary)', // Encyclopedia entry - neutral gray
			'var(--sys-color-teal-600)', // Journal article - medium teal
			'var(--sys-color-amber-400)', // Master's thesis - amber variant
			'var(--color-danger)', // PhD dissertation - red
			'var(--sys-color-amber-600)', // Research report - dark amber
			'var(--color-primary-dark)' // Special issue - dark teal
		]
	}: {
		data?: DataItem[];
		keys?: string[];
		xAxisLabel?: string;
		yAxisLabel?: string;
		colors?: string[];
	} = $props();

	// Container reference
	let chartContainer: HTMLDivElement;

	// Toolbar state
	let showDecal = $state(false);

	// Use Svelte's reactive window width instead of manual event listener
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Reactive color resolution
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		resolvedSeriesColors: resolveColors(colors)
	});

	// Chart data transformation
	const chartCategories = $derived(
		data.map((d) => {
			const item = d as Record<string, unknown>;
			return String(item['year'] ?? item['name'] ?? item['x']);
		})
	);

	const seriesData = $derived(
		keys.map((key, index) => ({
			name: key,
			type: 'bar',
			stack: 'total',
			data: data.map((d) => {
				const item = d as Record<string, unknown>;
				return (item[key] as number) || 0;
			}),
			itemStyle: {
				color:
					resolvedColors.resolvedSeriesColors[index % resolvedColors.resolvedSeriesColors.length],
				borderRadius: [4, 4, 0, 0]
			},
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: resolvedColors.primary
				}
			}
		}))
	);

	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		tooltip: {
			trigger: 'axis',
			...getEChartsTooltipStyle(resolvedColors),
			axisPointer: {
				type: 'shadow'
			},
			formatter: function (
				params: DefaultLabelFormatterCallbackParams | DefaultLabelFormatterCallbackParams[]
			) {
				const paramsArray = Array.isArray(params) ? params : [params];
				// Filter out series with value 0
				const nonZeroParams = paramsArray.filter((param) => (param.value as number) > 0);

				if (nonZeroParams.length === 0) {
					return `${paramsArray[0].name}<br/>No publications`;
				}

				let result = `${nonZeroParams[0].name}<br/>`;

				// Calculate total for the year
				const total = nonZeroParams.reduce(
					(sum: number, param) => sum + (param.value as number),
					0
				);

				// Add each non-zero publication type
				nonZeroParams.forEach((param) => {
					result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
				});

				// Add total
				result += `<strong>Total: ${total}</strong>`;

				return result;
			}
		},
		legend: {
			orient: 'horizontal',
			left: 'center',
			top: 'top',
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily
			},
			itemGap: isMobile ? 8 : 12,
			itemWidth: isMobile ? 10 : 14,
			itemHeight: isMobile ? 10 : 14
		},
		grid: {
			left: isMobile ? 32 : 64,
			right: 24,
			top: isMobile ? 80 : 64, // More space on mobile for legend
			bottom: xAxisLabel ? 80 : 48,
			containLabel: false
		},
		xAxis: {
			type: 'category',
			data: chartCategories,
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
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily,
				interval: isMobile ? 'auto' : 0, // Auto interval on mobile to prevent overlapping
				rotate: isMobile ? 45 : 0 // Rotate labels on mobile if needed
			},
			axisLine: getEChartsAxisLineStyle(resolvedColors),
			axisTick: getEChartsAxisLineStyle(resolvedColors)
		},
		yAxis: {
			type: 'value',
			name: yAxisLabel,
			nameLocation: 'middle',
			nameGap: 45,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: resolvedColors.fontFamily
			},
			axisLabel: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: resolvedColors.fontFamily
			},
			axisLine: getEChartsAxisLineStyle(resolvedColors),
			axisTick: getEChartsAxisLineStyle(resolvedColors),
			splitLine: getEChartsSplitLineStyle(resolvedColors)
		},
		series: seriesData,
		aria: getAriaConfig(showDecal),
		backgroundColor: 'transparent',
		...getAnimationConfig(1000, 'elasticOut')
	});

	// Use the ECharts hook for lifecycle management
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => data.length > 0
	});
</script>

<div class="echarts-container scroll-reveal">
	<ChartToolbar
		chart={echartsInstance.chart}
		bind:showDecal
		filename={yAxisLabel || 'stacked-bar-chart'}
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
