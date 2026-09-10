<!--
ECharts Stacked Bar Chart component
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColor,
		resolveColors,
		getEChartsTooltipStyle,
		getEChartsAxisLineStyle,
		getEChartsSplitLineStyle,
		getChartMotion
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import { getAriaConfig } from '$lib/utils/chartActions';
	import { describeStack } from '$lib/utils/chartDescriptions';
	import type { DefaultLabelFormatterCallbackParams } from 'echarts';

	/** Series beyond this count are folded into "Other" rather than given hues. */
	const MAX_SERIES = 7;

	// Props
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		keys = [] as string[],
		xAxisLabel = '',
		yAxisLabel = '',
		measure = '',
		colorMap,
		itemSingular = 'publication',
		itemPlural = 'publications',
		description = undefined
	}: {
		data?: DataItem[];
		keys?: string[];
		/**
		 * Axis names, drawn on the plate. Pass one only when the section head
		 * does not already state it: a category axis of four-digit years under
		 * a head reading "Publications per year, by type" needs no axis called
		 * "Year", and on a phone that name lands in the same strip as a wrapped
		 * legend and a rotated tick.
		 */
		xAxisLabel?: string;
		yAxisLabel?: string;
		/** What the stack counts. Not drawn; it names the downloaded image. */
		measure?: string;
		/**
		 * Entity key → colour, normally a bare `var(--sys-viz-N)` token
		 * (`resolveColor()` must return a concrete colour for ECharts' canvas
		 * renderer, which cannot parse `color-mix()`).
		 *
		 * A categorical hue is a property of the entity, not of its position in
		 * a sorted list: cycling `index % colors.length` meant "Book" changed
		 * colour the moment a new publication type appeared, and gave two series
		 * the same hue at twelve keys. So the map is fixed, at most seven hues
		 * are spent, and everything else — unmapped keys, and mapped keys past
		 * the seventh — folds into one neutral "Other" series. An eighth hue is
		 * never the answer.
		 *
		 * Omit it and the keys take `--sys-viz-1..7` in sorted order, which is
		 * stable for a fixed key set but not across one that grows.
		 */
		colorMap?: Record<string, string>;
		/** What one segment counts — publications, or talks. */
		itemSingular?: string;
		itemPlural?: string;
		/** Overrides the computed accessible description. */
		description?: string;
	} = $props();

	// Container reference
	let chartContainer: HTMLDivElement;

	// Toolbar state
	let showDecal = $state(false);

	// Use Svelte's reactive window width instead of manual event listener
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	/**
	 * The plate's own width. Legend placement is a question about the chart's
	 * column, not the window's: below `NARROW_PLATE` a horizontal legend wraps
	 * to three or four rows, and at the bottom of the grid those rows walk up
	 * into the rotated year ticks and the axis name.
	 */
	let containerWidth = $state(0);

	const NARROW_PLATE = 640;
	/**
	 * On a narrow plate the legend sits at the top, where `ChartToolbar` also
	 * lives (absolute, top-right: two 32px buttons and their gaps). The legend
	 * therefore keeps to the left and gives up that gutter, so no series name
	 * ends up under a button — and the row packer wraps on the same width.
	 */
	const TOOLBAR_GUTTER = 88;

	const isNarrowPlate = $derived(containerWidth > 0 && containerWidth < NARROW_PLATE);
	const legendWidth = $derived(
		isNarrowPlate ? Math.max(120, containerWidth - TOOLBAR_GUTTER) : containerWidth
	);

	$effect(() => {
		const element = chartContainer;
		if (!element) return;
		containerWidth = element.clientWidth;
		const observer = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width;
			if (width !== undefined) containerWidth = width;
		});
		observer.observe(element);
		return () => observer.disconnect();
	});

	const effectiveColorMap = $derived.by(() => {
		if (colorMap) return colorMap;
		const fallback: Record<string, string> = {};
		[...keys].sort().forEach((key, index) => {
			if (index < MAX_SERIES) fallback[key] = `var(--sys-viz-${index + 1})`;
		});
		return fallback;
	});

	/**
	 * The hued series, in the map's own order (which is what the legend then
	 * lists), and everything folded behind them.
	 */
	const seriesPlan = $derived.by(() => {
		const hued = Object.keys(effectiveColorMap)
			.filter((key) => keys.includes(key))
			.slice(0, MAX_SERIES);
		const huedSet = new Set(hued);
		return { hued, folded: keys.filter((key) => !huedSet.has(key)) };
	});

	// Reactive color resolution
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		// The page ground, drawn between stacked segments as a 1px border on each
		// side — a 2px cut of paper, so a stack reads as separate blocks rather
		// than one column of adjacent fills.
		background: resolveColor('var(--color-background)'),
		huedSeriesColors: resolveColors(seriesPlan.hued.map((key) => effectiveColorMap[key]!))
	});

	// Chart data transformation
	const chartCategories = $derived(
		data.map((d) => {
			const item = d as Record<string, unknown>;
			return String(item['year'] ?? item['name'] ?? item['x']);
		})
	);

	const valueOf = (d: DataItem, key: string) =>
		((d as Record<string, unknown>)[key] as number) || 0;

	/**
	 * The sentence a screen reader gets in place of ECharts' auto-generated
	 * series dump, which walked every stack and read `NaN` at every gap.
	 */
	const ariaDescription = $derived(
		description ??
			describeStack(
				measure || 'Chart',
				data.map((d, i) => ({
					label: chartCategories[i]!,
					value: keys.reduce((sum, key) => sum + valueOf(d, key), 0)
				})),
				keys.length,
				{ singular: itemSingular, plural: itemPlural }
			)
	);

	const segmentStyle = $derived({
		borderColor: resolvedColors.background,
		borderWidth: 1,
		borderRadius: 0
	});

	const seriesData = $derived([
		...seriesPlan.hued.map((key, index) => ({
			name: key,
			type: 'bar',
			stack: 'total',
			barMaxWidth: 28,
			data: data.map((d) => valueOf(d, key)),
			itemStyle: {
				color: resolvedColors.huedSeriesColors[index]!,
				...segmentStyle
			},
			emphasis: {
				focus: 'series' as const
			}
		})),
		...(seriesPlan.folded.length > 0
			? [
					{
						name: 'Other',
						type: 'bar',
						stack: 'total',
						barMaxWidth: 28,
						data: data.map((d) => seriesPlan.folded.reduce((sum, key) => sum + valueOf(d, key), 0)),
						itemStyle: {
							// Quiet ink, not an eighth hue: the fold is "everything else",
							// which is the absence of a category rather than one more.
							color: resolvedColors.textLight,
							...segmentStyle
						},
						emphasis: {
							focus: 'series' as const
						}
					}
				]
			: [])
	]);

	/* ---------------------------------------------------------------------
	 * Legend and grid geometry.
	 *
	 * ECharts wraps a horizontal legend but tells nobody how many rows it took,
	 * and the grid is laid out from fixed numbers. At 375px the seven-type
	 * legend took four rows at the bottom of the plate, which put it through
	 * the 45°-rotated year ticks and the axis name. So the rows are counted
	 * here — greedily, off the mono advance — and the grid is given the room
	 * they need, at the top of the plate on a narrow one where the reader meets
	 * the key before the bars rather than after them.
	 * ------------------------------------------------------------------- */

	/**
	 * Spline Sans Mono's advance in em, rounded up from its true ~0.62 so the
	 * row count errs towards one row too many rather than one too few.
	 */
	const MONO_ADVANCE_EM = 0.66;

	/** ECharts' gap between a legend swatch and its label. */
	const LEGEND_ICON_GAP = 5;

	const legendFontSize = $derived(isMobile ? 10 : 12);
	const legendItemGap = $derived(isMobile ? 8 : 12);
	const legendItemSize = $derived(isMobile ? 10 : 14);
	const axisFontSize = $derived(isMobile ? 10 : 12);

	/** Rows the wrapped legend will occupy, packed the way ECharts packs it. */
	const legendRows = $derived.by(() => {
		if (containerWidth <= 0) return 1;
		let rows = 1;
		let used = 0;
		for (const series of seriesData) {
			const width =
				legendItemSize + LEGEND_ICON_GAP + series.name.length * legendFontSize * MONO_ADVANCE_EM;
			if (used > 0 && used + legendItemGap + width > legendWidth) {
				rows += 1;
				used = width;
			} else {
				used += used > 0 ? legendItemGap + width : width;
			}
		}
		return rows;
	});

	/** One legend row: the swatch (or the type, whichever is taller) plus air. */
	const legendRowHeight = $derived(Math.max(legendItemSize, legendFontSize) + 10);

	const legendHeight = $derived(legendRows * legendRowHeight);

	/**
	 * What the category axis costs below the plot: the tick labels (their own
	 * length, projected onto the vertical, where they are rotated), the tick
	 * gap, and the axis name when one is drawn.
	 */
	const axisRoom = $derived.by(() => {
		const longest = chartCategories.reduce((max, name) => Math.max(max, name.length), 0);
		const labelHeight = isMobile
			? // Rotated 45°, so the label's vertical extent is its width × sin 45°.
				Math.ceil(longest * axisFontSize * MONO_ADVANCE_EM * Math.SQRT1_2)
			: axisFontSize;
		return Math.max(40, labelHeight + 12 + (xAxisLabel ? 44 : 0));
	});

	const gridTop = $derived(isNarrowPlate ? legendHeight + 16 : 24);
	const gridBottom = $derived(isNarrowPlate ? axisRoom : axisRoom + legendHeight + 12);

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
					return `${paramsArray[0]?.name ?? ''}<br/>No ${itemPlural}`;
				}

				let result = `${nonZeroParams[0]!.name}<br/>`;

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
			// Above the plot on a narrow plate, below it otherwise. Every item
			// stays visible either way: a scrolling legend would hide series
			// behind an arrow, and a key the reader has to page through is not a
			// key. The grid is given the wrapped rows' height in return. Up top
			// the legend keeps left of the toolbar's gutter (see TOOLBAR_GUTTER).
			...(isNarrowPlate ? { top: 0, left: 0, width: legendWidth } : { bottom: 0, left: 'center' }),
			// Stated rather than inferred: the legend reads in the colour map's
			// order, with the folded "Other" last. Square swatches, not ECharts'
			// default rounded ones.
			data: seriesData.map((series) => series.name),
			icon: 'rect',
			textStyle: {
				color: resolvedColors.text,
				fontSize: legendFontSize,
				fontFamily: resolvedColors.fontFamily
			},
			itemGap: legendItemGap,
			itemWidth: legendItemSize,
			itemHeight: legendItemSize
		},
		grid: {
			left: isMobile ? 32 : 64,
			right: 24,
			top: gridTop,
			bottom: gridBottom,
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
				fontSize: axisFontSize,
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
		aria: getAriaConfig(showDecal, ariaDescription),
		backgroundColor: 'transparent',
		...getChartMotion('settle')
	});

	// Use the ECharts hook for lifecycle management
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => data.length > 0
	});
</script>

<div class="echarts-container">
	<ChartToolbar
		chart={echartsInstance.chart}
		bind:showDecal
		filename={measure || yAxisLabel || 'stacked-bar-chart'}
	/>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 100%;
		display: block;
		position: relative;
		font-family: var(--font-family-mono);
	}

	.chart {
		width: 100%;
		height: 100%;
	}
</style>
