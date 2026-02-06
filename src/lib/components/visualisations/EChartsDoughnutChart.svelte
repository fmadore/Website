<!--
ECharts Doughnut/Pie Chart - A doughnut chart for visualizing categorical data
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColors,
		getEChartsTooltipStyle
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';

	// Props - keeping interface simple for doughnut chart
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		nameAccessor,
		valueAccessor,
		title = '',
		showLabels = true,
		radius = ['40%', '70%'], // Inner and outer radius for doughnut
		colors = [
			'var(--color-primary)',
			'var(--color-accent)',
			'var(--color-highlight)',
			'var(--color-success)',
			'var(--color-secondary)',
			'color-mix(in srgb, var(--color-primary) 80%, transparent)',
			'color-mix(in srgb, var(--color-highlight) 80%, transparent)',
			'color-mix(in srgb, var(--color-success) 80%, transparent)',
			'color-mix(in srgb, var(--color-primary) 60%, transparent)',
			'color-mix(in srgb, var(--color-highlight) 60%, transparent)',
			'color-mix(in srgb, var(--color-success) 60%, transparent)',
			'color-mix(in srgb, var(--color-primary) 40%, transparent)',
			'color-mix(in srgb, var(--color-highlight) 40%, transparent)',
			'color-mix(in srgb, var(--color-success) 40%, transparent)'
		]
	}: {
		data?: DataItem[];
		nameAccessor: (d: DataItem) => string;
		valueAccessor: (d: DataItem) => number;
		title?: string;
		showLabels?: boolean;
		radius?: [string, string];
		colors?: string[];
	} = $props();

	// Container reference
	let chartContainer: HTMLDivElement;

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Reactive color resolution
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		chartColors: resolveColors(colors)
	});
	// Chart data transformation
	const chartData = $derived(
		data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d)
		}))
	);

	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false // Hide internal title to avoid duplication with external container title
		},
		tooltip: {
			trigger: 'item',
			...getEChartsTooltipStyle(resolvedColors),
			formatter: '{a} <br/>{b}: {c} ({d}%)',
			confine: isMobile,
			position: isMobile
				? function (point: [number, number], params: any, dom: HTMLElement, rect: any, size: any) {
						const tooltipWidth = size.contentSize[0];
						const tooltipHeight = size.contentSize[1];
						const viewportWidth = size.viewSize[0];

						let x = Math.max(
							10,
							Math.min(viewportWidth - tooltipWidth - 10, point[0] - tooltipWidth / 2)
						);
						let y = point[1] - tooltipHeight - 10;

						if (y < 10) {
							y = point[1] + 20;
						}

						return [x, y];
					}
				: undefined
		},
		legend: {
			orient: 'horizontal',
			left: 'center',
			bottom: isMobile ? '5%' : '8%',
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 11 : 13,
				fontFamily: resolvedColors.fontFamily,
				fontWeight: '500'
			},
			itemGap: isMobile ? 12 : 20,
			itemWidth: isMobile ? 12 : 14,
			itemHeight: isMobile ? 12 : 14,
			padding: [5, 10],
			backgroundColor: 'transparent'
		},
		series: [
			{
				name: title || 'Data',
				type: 'pie',
				radius: radius,
				center: ['50%', isMobile ? '42%' : '44%'],
				data: chartData,
				emphasis: {
					label: {
						show: true,
						fontSize: isMobile ? 16 : 20,
						fontWeight: 'bold',
						color: resolvedColors.text
					},
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'color-mix(in srgb, black 50%, transparent)'
					}
				},
				label: {
					show: showLabels,
					position: isMobile ? 'inside' : 'outside',
					color: isMobile ? resolvedColors.white : resolvedColors.text,
					fontSize: isMobile ? 11 : 12,
					fontFamily: resolvedColors.fontFamily,
					fontWeight: 'bold',
					formatter: isMobile ? '{d}%' : '{b}: {d}%',
					textBorderColor: isMobile ? 'color-mix(in srgb, black 90%, transparent)' : 'transparent',
					textBorderWidth: isMobile ? 2 : 0,
					textShadowColor: isMobile ? 'color-mix(in srgb, black 90%, transparent)' : 'transparent',
					textShadowBlur: isMobile ? 3 : 0,
					minMargin: isMobile ? 8 : 5,
					padding: isMobile ? [2, 4] : [0, 0]
				},
				labelLine: {
					show: showLabels && !isMobile,
					length: 15,
					length2: 10,
					lineStyle: {
						color: resolvedColors.textLight,
						width: 1
					}
				},
				itemStyle: {
					borderRadius: 6,
					borderColor: resolvedColors.surface,
					borderWidth: 2
				},
				labelLayout: isMobile
					? {
							hideOverlap: true,
							moveOverlap: 'shiftY'
						}
					: undefined,
				animationType: 'scale',
				animationEasing: 'elasticOut' as any,
				animationDelay: function () {
					return Math.random() * 200;
				}
			}
		],
		color: resolvedColors.chartColors,
		backgroundColor: 'transparent'
	});

	// Use the ECharts hook for lifecycle management
	useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => chartData.length > 0
	});
</script>

<div class="echarts-container scroll-reveal-scale">
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 480px; /* Increased height to accommodate legend */
		display: block;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
		height: 100%;
	}

	/* Responsive adjustments */
	@media (--sm-down) {
		.echarts-container {
			height: 420px; /* Increased height for mobile with legend space */
		}
	}

	@media (--xs-down) {
		.echarts-container {
			height: 400px; /* Adequate height for very small screens with legend */
		}
	}
</style>
