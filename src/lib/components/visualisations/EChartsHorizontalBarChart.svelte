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
		getChartMotion
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import { getAriaConfig } from '$lib/utils/chartActions';
	import { describeRanked } from '$lib/utils/chartDescriptions';
	import { niceTickInterval, tickBudgetForWidth } from '$lib/utils/chartAxis';

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
		accentKey,
		maxValue,
		itemSingular = 'entry',
		itemPlural = 'entries',
		descriptionLead = 'Most frequent',
		description = undefined
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => number;
		yAccessor: (d: DataItem) => string;
		/**
		 * Axis names, drawn on the plate. Pass one only when the section head
		 * does not already state it — "Frequency" under "Two-word phrases, by
		 * frequency" is the axis repeating the title back at the reader.
		 */
		xAxisLabel?: string;
		yAxisLabel?: string;
		/**
		 * What the bars count, for the strings that are not drawn on the axis:
		 * the tooltip's series name and the download filename. Kept separate
		 * from `xAxisLabel` so dropping a redundant axis name does not also
		 * strip the export of its name.
		 */
		measure?: string;
		/**
		 * Bar fill. Ink by default (cream on midnight, via the resolved tokens):
		 * a bar series is structure, not the current thing.
		 */
		barColor?: string;
		/**
		 * The one category drawn in pine. Leave it unset and no pine appears on
		 * the chart at all (the Scarcity Rule).
		 */
		accentKey?: string | number;
		maxValue?: number;
		/** What one bar is — a phrase, an author, a country. */
		itemSingular?: string;
		itemPlural?: string;
		/** Lead-in for the leading bar in the accessible description. */
		descriptionLead?: string;
		/** Overrides the computed accessible description. */
		description?: string;
	} = $props();

	/**
	 * The sentence a screen reader gets in place of ECharts' auto-generated
	 * series dump. Computed from the same data the bars are drawn from.
	 */
	const ariaDescription = $derived(
		description ??
			describeRanked(
				measure || 'Chart',
				data.map((d) => ({ label: yAccessor(d), value: xAccessor(d) })),
				{ singular: itemSingular, plural: itemPlural },
				descriptionLead
			)
	);

	// Container reference
	let chartContainer: HTMLDivElement;

	// Toolbar state
	let showDecal = $state(false);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	/**
	 * The plate's own width. The label gutter is a share of the chart, not of
	 * the viewport: the same component sits full-bleed on one page and inside a
	 * rail on another, and only the container knows which.
	 */
	let containerWidth = $state(0);

	/**
	 * Flips once the webfonts have settled. `measureText` before that returns
	 * the fallback face's advances, which are wider than Spline Sans Mono's and
	 * would leave a permanently over-wide gutter.
	 */
	let fontsReady = $state(false);

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

	$effect(() => {
		let live = true;
		document.fonts?.ready.then(() => {
			if (live) fontsReady = true;
		});
		return () => {
			live = false;
		};
	});

	// Reactive color resolution
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		barColor: resolveColor(barColor)
	});

	// The single accented category, compared as a string so a numeric key
	// matches the stringified axis category.
	const accentName = $derived(accentKey === undefined ? null : String(accentKey));

	// Chart data transformation - reverse order so highest values appear at top
	const chartData = $derived(
		data
			.map((d) => ({
				name: String(yAccessor(d)),
				value: xAccessor(d)
			}))
			.reverse()
	);

	const labelFontSize = $derived(isMobile ? 10 : 12);

	/**
	 * Under this the plate is a phone column rather than a chart: the gutter is
	 * allowed a much larger share of it, and labels wrap instead of truncating.
	 */
	const NARROW_PLATE = 480;

	/** The gutter's share of a narrow plate — the rest is left for the bars. */
	const NARROW_GUTTER_SHARE = 0.45;

	/** Breathing room past the longest label, so no glyph sits on the tick. */
	const LABEL_PAD = 16;

	/**
	 * Spline Sans Mono's advance, in em, for the fallback path only. It is a
	 * ceiling rather than the true ~0.62 so an estimated gutter errs wide.
	 */
	const MONO_ADVANCE_EM = 0.66;

	const isNarrowPlate = $derived(containerWidth > 0 && containerWidth < NARROW_PLATE);

	/** One reused 2D context; `measureText` needs no node in the document. */
	let measureContext: CanvasRenderingContext2D | null = null;

	/**
	 * The widest of `labels` as the axis will actually set it, or `null` where
	 * no canvas is available (server render, or a context the browser refuses).
	 */
	function measureLabels(labels: string[], fontSize: number, fontFamily: string): number | null {
		if (typeof document === 'undefined') return null;
		measureContext ??= document.createElement('canvas').getContext('2d');
		const context = measureContext;
		if (!context) return null;
		context.font = `${fontSize}px ${fontFamily}`;
		return labels.reduce((max, label) => Math.max(max, context.measureText(label).width), 0);
	}

	/**
	 * The category gutter, sized to the labels it has to hold rather than to a
	 * fixed 130px. Bigram terms ("association musulmane", "communauté
	 * musulmane") all clip to the same three characters at that width, which
	 * turns three different rows into one repeated row — the chart stops being
	 * readable, not just tight.
	 *
	 * Estimating the advance was the first fix and it still clipped: an em
	 * factor guessed one way or the other is wrong for every string but one,
	 * and ECharts truncates at exactly `axisLabel.width`. So the labels are
	 * measured with the resolved face at the resolved size, and the em factor
	 * survives only as the fallback for a context-less render.
	 *
	 * Past the cap the label has to give: on a wide plate it truncates, on a
	 * narrow one it wraps (see `labelOverflow`), because a phone has no width
	 * to spend on a gutter but plenty of height to spend on a second line.
	 */
	const labelWidth = $derived.by(() => {
		// Read so the measurement is retaken once the real face has loaded.
		void fontsReady;
		const labels = chartData.map((d) => d.name);
		const longest = labels.reduce((max, name) => Math.max(max, name.length), 0);
		const natural =
			measureLabels(labels, labelFontSize, resolvedColors.fontFamily) ??
			longest * labelFontSize * MONO_ADVANCE_EM;
		const min = isNarrowPlate ? 100 : 130;
		const cap = isNarrowPlate
			? Math.max(min, Math.round(containerWidth * NARROW_GUTTER_SHARE))
			: 300;
		return Math.min(cap, Math.max(min, Math.ceil(natural + LABEL_PAD)));
	});

	/**
	 * A clipped term is unreadable; a wrapped one is only taller. On a narrow
	 * plate, where the cap bites, the label takes a second line rather than an
	 * ellipsis. Wide plates keep `truncate`, since the gutter has already been
	 * widened to fit the longest term whole.
	 */
	const labelOverflow = $derived(isNarrowPlate ? 'break' : 'truncate');

	/** Leading for the wrapped case; ECharts needs it stated with the wrap. */
	const labelLineHeight = $derived(Math.round(labelFontSize * 1.3));

	/** Labels plus the tick gap; `containLabel` is off, so the grid owns it. */
	const gridLeft = $derived(labelWidth + 20);

	/**
	 * The x-axis interval, chosen for the plate's actual width.
	 *
	 * The staircase this replaced answered only to the data, so a plate at
	 * 375px drew the same ten labels a 900px plate did and printed them as a
	 * gray smear along the baseline. The tick budget now comes from the grid's
	 * own width and the interval from the 1–2–5 ladder, so a phone gets four
	 * intervals on round numbers rather than ten on top of each other.
	 */
	const xAxisInterval = $derived.by(() => {
		const values = chartData.map((d) => d.value);
		const maxVal = maxValue ?? Math.max(...values, 1);
		return niceTickInterval(maxVal, tickBudgetForWidth(containerWidth - gridLeft - 24));
	});
	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		tooltip: {
			trigger: 'axis',
			...getEChartsTooltipStyle(resolvedColors)
		},
		grid: {
			left: gridLeft,
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
			interval: xAxisInterval,
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
			nameGap: labelWidth + 10,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: resolvedColors.fontFamily
			},
			axisLabel: {
				color: resolvedColors.text,
				fontSize: labelFontSize,
				fontFamily: resolvedColors.fontFamily,
				width: labelWidth,
				lineHeight: labelLineHeight,
				// Only past the cap; below it the gutter has already been widened
				// to fit the longest term whole.
				overflow: labelOverflow
			},
			axisLine: getEChartsAxisLineStyle(resolvedColors),
			axisTick: getEChartsAxisLineStyle(resolvedColors)
		},
		series: [
			{
				name: measure || xAxisLabel || 'Value',
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
		aria: getAriaConfig(showDecal, ariaDescription),
		backgroundColor: 'transparent',
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
		filename={measure || xAxisLabel || 'horizontal-bar-chart'}
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
