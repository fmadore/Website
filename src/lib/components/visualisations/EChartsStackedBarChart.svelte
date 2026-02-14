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
		getEChartsSplitLineStyle
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';

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

	// Use Svelte's reactive window width instead of manual event listener
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Reactive color resolution
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		resolvedSeriesColors: resolveColors(colors)
	});

	// Chart data transformation
	const chartCategories = $derived(
		data.map((d) => String((d as any).year || (d as any).name || (d as any).x))
	);

	const seriesData = $derived(
		keys.map((key, index) => ({
			name: key,
			type: 'bar',
			stack: 'total',
			data: data.map((d) => (d as any)[key] || 0),
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
			formatter: function (params: any) {
				// Filter out series with value 0
				const nonZeroParams = params.filter((param: any) => param.value > 0);

				if (nonZeroParams.length === 0) {
					return `${params[0].axisValueLabel}<br/>No publications`;
				}

				let result = `${nonZeroParams[0].axisValueLabel}<br/>`;

				// Calculate total for the year
				const total = nonZeroParams.reduce((sum: number, param: any) => sum + param.value, 0);

				// Add each non-zero publication type
				nonZeroParams.forEach((param: any) => {
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
		backgroundColor: 'transparent',
		animationDuration: 1000,
		animationEasing: 'elasticOut' as any
	});

	// Use the ECharts hook for lifecycle management
	useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => data.length > 0
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
