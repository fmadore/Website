<!--
ECharts Gantt Chart — research projects over their recorded periods, with a
marker for each output at the year it appeared.

The bar is the period the project's research record gives (`years`), not the
span of its outputs: a book published three years after the funding ended is
drawn three years past the end of the bar, which is the point. A project with
no recorded period gets markers and no bar. Each year is drawn as an interval
(the bar runs from the start of its first year to the end of its last, and a
marker sits mid-year), so an output in the final year falls inside and one the
year after falls outside.
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColors,
		getEChartsTooltipStyle,
		getChartMotion,
		CHART_CATEGORICAL_COLORS
	} from '#lib/utils/chartColorUtils.ts';
	import { useECharts } from '#lib/utils/useECharts.svelte.ts';
	import ChartToolbar from './ChartToolbar.svelte';
	import ChartStatus from './ChartStatus.svelte';
	import { getAriaConfig } from '#lib/utils/chartActions.ts';
	import { describeProjectTimeline } from '#lib/utils/chartDescriptions.ts';
	import { niceTickInterval } from '#lib/utils/chartAxis.ts';
	import { escapeMapText as escape } from '#lib/utils/locationMapContent.ts';
	import type { ProjectTimelineEntry } from '#lib/utils/vizAggregation.ts';

	let {
		data = [] as ProjectTimelineEntry[],
		colors = CHART_CATEGORICAL_COLORS,
		typeLabel = (type: string) => type,
		itemSingular = 'publication',
		itemPlural = 'publications'
	}: {
		data?: ProjectTimelineEntry[];
		colors?: string[];
		/** Display label for an output's raw type key (publication or talk types). */
		typeLabel?: (type: string) => string;
		/** What each marker counts on this page: a publication, or a talk. */
		itemSingular?: string;
		itemPlural?: string;
	} = $props();

	let chartContainer: HTMLDivElement;

	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	/** The plate's own width: label room and the year ladder answer to it. */
	let containerWidth = $state(0);

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

	const resolvedColors = $derived({
		...getResolvedChartColors(),
		chartColors: resolveColors(colors)
	});

	const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
	const countOf = (n: number) => `${n} ${n === 1 ? itemSingular : itemPlural}`;

	const ganttAriaDescription = $derived(
		describeProjectTimeline(data, { singular: itemSingular, plural: itemPlural })
	);

	/**
	 * Room for the project names. A wide plate prints them whole, wrapped onto
	 * a second line where needed; a phone wraps them into a narrow column.
	 */
	const labelWidth = $derived(isMobile ? 110 : containerWidth >= 900 ? 320 : 200);

	/** The years the plate must show: every period and every output. */
	const dataYears = $derived.by(() => {
		const years = data.flatMap((p) => [
			p.firstItemYear,
			p.lastItemYear,
			...(p.period ? [p.period.startYear, p.period.endYear] : [])
		]);
		return years.length > 0
			? { first: Math.min(...years), last: Math.max(...years) }
			: { first: 2010, last: 2020 };
	});

	/**
	 * One year label per ~40px of plot (a four-digit mono label and its air),
	 * on the 1–2–5 ladder, so a phone prints every fifth year rather than
	 * every second one run together into a single string.
	 */
	const yearInterval = $derived.by(() => {
		const plotWidth = Math.max(120, (containerWidth || 900) - labelWidth - 48);
		const span = dataYears.last + 1 - dataYears.first;
		return niceTickInterval(span, Math.max(4, Math.floor(plotWidth / 40)));
	});

	// The axis starts and ends on a labelled year, with a year of air either side.
	const axisMin = $derived(Math.floor((dataYears.first - 1) / yearInterval) * yearInterval);
	const axisMax = $derived(Math.ceil((dataYears.last + 2) / yearInterval) * yearInterval);

	const colorFor = (index: number) =>
		resolvedColors.chartColors[index % resolvedColors.chartColors.length]!;

	// Bars: one per project with a recorded period, from the start of its first
	// year to the end of its last.
	const ganttData = $derived(
		data.flatMap((project, index) =>
			project.period
				? [
						{
							name: project.name,
							value: [index, project.period.startYear, project.period.endYear + 1],
							itemStyle: { color: colorFor(index) },
							project
						}
					]
				: []
		)
	);

	/**
	 * Markers: one per project and year, mid-year, so outputs that share a year
	 * do not stack invisibly on one point. The count is printed above the
	 * marker when there is more than one; the tooltip names them.
	 */
	const publicationMarkers = $derived(
		data.flatMap((project, projectIndex) => {
			// The items arrive oldest first, so a year's outputs are adjacent.
			const byYear: Array<[number, ProjectTimelineEntry['items']]> = [];
			for (const item of project.items) {
				const last = byYear.at(-1);
				if (last && last[0] === item.year) last[1].push(item);
				else byYear.push([item.year, [item]]);
			}
			return byYear.map(([year, items]) => ({
				value: [year + 0.5, projectIndex],
				year,
				items,
				project,
				symbolSize: isMobile ? 8 : 12,
				label: {
					show: items.length > 1,
					position: 'top',
					formatter: String(items.length),
					color: resolvedColors.text,
					fontFamily: resolvedColors.fontFamily,
					fontSize: isMobile ? 9 : 11
				},
				itemStyle: {
					// A knockout against the plate ground, never pure white: on the
					// film ground a white marker is the wrong temperature.
					color: resolvedColors.surface,
					borderColor: colorFor(projectIndex),
					borderWidth: 2
				}
			}));
		})
	);

	function periodLine(project: ProjectTimelineEntry): string {
		const period = project.period;
		if (!period) return 'No recorded period';
		if (period.ongoing) return `Recorded period: since ${period.startYear}`;
		const years = period.endYear - period.startYear + 1;
		return period.startYear === period.endYear
			? `Recorded period: ${period.startYear}`
			: `Recorded period: ${period.startYear}–${period.endYear} (${years} years)`;
	}

	/** Titles listed in a marker tooltip before the rest are counted. */
	const TOOLTIP_TITLES = 5;

	const chartOption = $derived({
		title: { show: false },
		tooltip: {
			...getEChartsTooltipStyle(resolvedColors),
			formatter: function (params: Record<string, unknown>) {
				if (params.seriesType === 'custom') {
					const { project } = params.data as { project: ProjectTimelineEntry };
					let tooltip = `<strong>${escape(project.name)}</strong><br/>${periodLine(project)}<br/>`;
					tooltip += `${capitalise(itemPlural)}: ${project.items.length}`;
					if (project.outsidePeriod > 0) tooltip += `, ${project.outsidePeriod} outside the period`;
					return tooltip;
				}
				const marker = params.data as {
					year: number;
					items: ProjectTimelineEntry['items'];
					project: ProjectTimelineEntry;
				};
				const period = marker.project.period;
				const outside =
					period && (marker.year < period.startYear || marker.year > period.endYear)
						? ' · outside the recorded period'
						: '';
				const shown = marker.items
					.slice(0, TOOLTIP_TITLES)
					.map((item) => `${escape(item.title)} <span>(${escape(typeLabel(item.type))})</span>`);
				const more = marker.items.length - shown.length;
				return (
					`<strong>${marker.year}</strong> · ${countOf(marker.items.length)}${outside}<br/>` +
					`${escape(marker.project.name)}<br/>` +
					shown.join('<br/>') +
					(more > 0 ? `<br/>and ${more} more` : '')
				);
			}
		},
		legend: { show: false },
		grid: {
			left: '3%',
			right: '5%',
			top: isMobile ? '12%' : '10%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'value',
			min: axisMin,
			max: axisMax,
			interval: yearInterval,
			axisLabel: {
				color: resolvedColors.text,
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily,
				formatter: (value: number) => Math.floor(value).toString()
			},
			axisLine: { lineStyle: { color: resolvedColors.border } },
			splitLine: {
				lineStyle: { color: resolvedColors.border, opacity: 0.3, type: 'dashed' }
			}
		},
		yAxis: {
			type: 'category',
			data: data.map((p) => p.name),
			axisLabel: {
				color: resolvedColors.text,
				fontSize: isMobile ? 9 : 11,
				fontFamily: resolvedColors.fontFamily,
				width: labelWidth,
				overflow: 'break',
				lineHeight: isMobile ? 12 : 15
			},
			axisLine: { lineStyle: { color: resolvedColors.border } },
			axisTick: { show: false },
			inverse: true
		},
		series: [
			{
				// Recorded periods
				type: 'custom',
				renderItem: function (
					_params: unknown,
					api: {
						value: (idx: number) => number;
						coord: (val: number[]) => number[];
						style: () => Record<string, unknown>;
					}
				) {
					const categoryIndex = api.value(0);
					const startCoord = api.coord([api.value(1), categoryIndex]);
					const endCoord = api.coord([api.value(2), categoryIndex]);
					const barHeight = isMobile ? 18 : 24;
					return {
						type: 'rect',
						transition: ['shape'],
						shape: {
							x: startCoord[0]!,
							y: startCoord[1]! - barHeight / 2,
							width: endCoord[0]! - startCoord[0]!,
							height: barHeight,
							r: 0
						},
						style: api.style()
					};
				},
				encode: { x: [1, 2], y: 0 },
				data: ganttData,
				clip: true,
				z: 1
			},
			{
				// Outputs
				type: 'scatter',
				data: publicationMarkers,
				symbol: 'circle',
				z: 2
			}
		],
		aria: getAriaConfig(false, ganttAriaDescription),
		backgroundColor: 'transparent',
		...getChartMotion('settle')
	});

	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => data.length > 0
	});
</script>

<div class="echarts-container">
	<ChartStatus error={echartsInstance.error} retry={echartsInstance.retry} />
	<ChartToolbar chart={echartsInstance.chart} showDecalToggle={false} filename="project-timeline" />
	<div bind:this={chartContainer} class="chart"></div>
	<div class="legend-hint">
		<span class="legend-item">
			<span class="legend-bar"></span>
			Recorded project period
		</span>
		<span class="legend-item">
			<span class="legend-marker"></span>
			{capitalise(itemPlural)} in a year
		</span>
		{#if data.some((project) => !project.period)}
			<span class="legend-item">No bar: no recorded period</span>
		{/if}
	</div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 100%;
		min-height: 350px;
		display: block;
		position: relative;
		font-family: var(--font-family-mono);
	}

	.chart {
		width: 100%;
		height: calc(100% - 30px);
	}

	.legend-hint {
		display: flex;
		justify-content: center;
		gap: var(--space-lg);
		padding-top: var(--space-xs);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-figures);
		color: var(--color-text-light);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.legend-bar {
		display: inline-block;
		flex-shrink: 0;
		width: 24px;
		height: 12px;
		background: var(--color-accent);
		border-radius: 0;
	}

	.legend-marker {
		display: inline-block;
		flex-shrink: 0;
		width: 10px;
		height: 10px;
		background: var(--color-surface-elevated);
		border: var(--border-width-medium) solid var(--color-accent);
		border-radius: 0;
	}

	@media (--sm-down) {
		.legend-hint {
			gap: var(--space-md);
			font-size: var(--font-size-xs);
		}
	}

	@media (--xs-down) {
		.legend-hint {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>
