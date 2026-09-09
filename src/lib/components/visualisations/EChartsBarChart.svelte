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
		getChartMotion
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
		measure = '',
		barColor = 'var(--color-primary)',
		accentKey
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => string | number;
		yAccessor: (d: DataItem) => number;
		/**
		 * Axis names, drawn on the plate. Pass one only when the section head
		 * does not already state it: a category axis of four-digit years under
		 * a head reading "Citations per year" needs no axis called "Year", and
		 * the name costs a rotated mobile axis the room it does not have.
		 */
		xAxisLabel?: string;
		yAxisLabel?: string;
		/**
		 * What the bars count, for the strings that are not drawn on the axis:
		 * the tooltip's series name and the download filename. Kept separate
		 * from `yAxisLabel` so dropping a redundant axis name does not also
		 * strip the export of its name.
		 */
		measure?: string;
		/**
		 * Bar fill. Ink by default (cream on midnight, via the resolved tokens):
		 * a bar series is structure, not the current thing.
		 */
		barColor?: string;
		/**
		 * The one category drawn in pine — the Year-Bar Strip idiom, where the
		 * newest year carries the accent and the rest are ink. Leave it unset
		 * and no pine appears on the chart at all (the Scarcity Rule).
		 */
		accentKey?: string | number;
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

	// The single accented category, compared as a string so a numeric year key
	// matches the stringified axis category.
	const accentName = $derived(accentKey === undefined ? null : String(accentKey));

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
				name: measure || yAxisLabel || 'Value',
				type: 'bar',
				// Flat solid fills — Ink + Signal permits no gradients; a faded bar
				// base read as "broken". Every bar is one honest ink block, except
				// the single `accentKey` category, which is the pine signal.
				data: chartData.map((d) => ({
					value: d.value,
					itemStyle: {
						color: d.name === accentName ? resolvedColors.accent : resolvedColors.barColor,
						borderRadius: 0
					}
				})),
				emphasis: {
					// Keep each bar's own fill on hover instead of ECharts' default
					// lift: the mark must not change colour to acknowledge a pointer.
					itemStyle: {
						color: 'inherit'
					}
				}
			}
		],
		aria: getAriaConfig(showDecal),
		backgroundColor: 'transparent', // Let the container handle background
		...getChartMotion('settle')
	});

	// Use the ECharts hook for lifecycle management
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => chartData.length > 0
	});
</script>

<div class="echarts-container">
	<ChartToolbar
		chart={echartsInstance.chart}
		bind:showDecal
		filename={measure || yAxisLabel || 'bar-chart'}
	/>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 100%;
		min-height: 260px;
		display: block;
		position: relative;
		font-family: var(--font-family-mono);
	}

	.chart {
		width: 100%;
		height: 100%;
	}
</style>
