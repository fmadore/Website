<!--
ECharts Bar Chart - A much simpler alternative to the custom D3 implementation
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColor,
		getEChartsTooltipStyle,
		getEChartsAxisLineStyle,
		getEChartsSplitLineStyle,
		getBarGradient,
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
		barColor = 'var(--color-primary)'
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => string | number;
		yAccessor: (d: DataItem) => number;
		xAxisLabel?: string;
		yAxisLabel?: string;
		barColor?: string;
	} = $props();

	// Container reference
	let chartContainer: HTMLDivElement;

	// Toolbar state
	let showDecal = $state(false);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Reactive color resolution - updates when theme changes
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		barColor: resolveColor(barColor)
	});

	// Chart data transformation
	const chartData = $derived(
		data.map((d) => ({
			name: String(xAccessor(d)),
			value: yAccessor(d)
		}))
	);
	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false // We'll handle titles externally if needed
		},
		tooltip: {
			trigger: 'axis',
			...getEChartsTooltipStyle(resolvedColors)
		},
		grid: {
			left: isMobile ? 32 : 64,
			right: 24,
			top: 24,
			bottom: xAxisLabel ? 80 : 48,
			containLabel: false
		},
		xAxis: {
			type: 'category',
			data: chartData.map((d) => d.name),
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
				interval: isMobile ? 'auto' : 0 // Auto interval on mobile to prevent overlapping
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
		series: [
			{
				name: yAxisLabel || 'Value',
				type: 'bar',
				data: chartData.map((d) => d.value),
				itemStyle: {
					color: getBarGradient(resolvedColors.barColor),
					borderRadius: [4, 4, 0, 0]
				},
				emphasis: {
					itemStyle: {
						color: resolvedColors.barColor,
						shadowColor: `color-mix(in srgb, ${resolvedColors.primary} 40%, transparent)`,
						shadowBlur: 12,
						shadowOffsetY: 4
					}
				},
				...getAnimationConfig(1000, 'elasticOut')
			}
		],
		aria: getAriaConfig(showDecal),
		backgroundColor: 'transparent' // Let the container handle background
	});

	// Use the ECharts hook for lifecycle management
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => chartData.length > 0
	});
</script>

<div class="echarts-container scroll-reveal-scale">
	<ChartToolbar chart={echartsInstance.chart} bind:showDecal filename={yAxisLabel || 'bar-chart'} />
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 350px;
		display: block;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
		height: 100%;
	}
</style>
