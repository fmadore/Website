<!--
ECharts Gantt Chart - Timeline visualization for research projects with publication markers
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColors,
		getEChartsTooltipStyle,
		getChartMotion,
		CHART_CATEGORICAL_COLORS
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import { getAriaConfig } from '$lib/utils/chartActions';
	import { PUBLICATION_TYPE_GANTT_LABELS } from '$lib/utils/publicationTypeLabels';

	// Types for project data
	interface ProjectPublication {
		title: string;
		year: number;
		type: string;
	}

	interface ProjectData {
		name: string;
		startYear: number;
		endYear: number;
		publications: ProjectPublication[];
	}

	// Props
	let {
		data = [] as ProjectData[],
		colors = CHART_CATEGORICAL_COLORS
	}: {
		data?: ProjectData[];
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

	// Data-derived screen-reader description (canvas charts are otherwise opaque)
	const ganttAriaDescription = $derived(
		data.length === 0
			? 'Project timeline chart with no data.'
			: `Timeline of ${data.length} research projects: ${data
					.map(
						(p) =>
							`${p.name} from ${p.startYear} to ${p.endYear}` +
							(p.publications.length > 0 ? ` with ${p.publications.length} publications` : '')
					)
					.join('; ')}.`
	);

	// Calculate year range from data
	const yearRange = $derived.by(() => {
		if (data.length === 0) return { min: 2010, max: new Date().getFullYear() + 1 };
		const allYears = data.flatMap((p) => [p.startYear, p.endYear]);
		return {
			min: Math.min(...allYears) - 1,
			max: Math.max(...allYears, new Date().getFullYear()) + 1
		};
	});

	// Format type labels for display
	const formatTypeLabel = (type: string): string => PUBLICATION_TYPE_GANTT_LABELS[type] || type;

	// Transform data for ECharts custom series (Gantt bars)
	const ganttData = $derived(
		data.map((project, index) => ({
			name: project.name,
			value: [index, project.startYear, project.endYear, project.publications.length],
			itemStyle: {
				color: resolvedColors.chartColors[index % resolvedColors.chartColors.length]
			},
			publications: project.publications
		}))
	);

	// Create scatter data for publication markers
	const publicationMarkers = $derived(
		data.flatMap((project, projectIndex) =>
			project.publications.map((pub) => ({
				value: [pub.year, projectIndex],
				name: pub.title,
				type: pub.type,
				projectName: project.name,
				symbolSize: isMobile ? 8 : 12,
				itemStyle: {
					color: resolvedColors.white,
					borderColor: resolvedColors.chartColors[projectIndex % resolvedColors.chartColors.length],
					borderWidth: 2
				}
			}))
		)
	);

	// Chart options
	const chartOption = $derived({
		title: {
			show: false
		},
		tooltip: {
			...getEChartsTooltipStyle(resolvedColors),
			formatter: function (params: Record<string, unknown>) {
				if (params.seriesType === 'custom') {
					// Gantt bar tooltip
					const project = params.data as { name: string; value: number[] };
					const duration = project.value[2]! - project.value[1]!;
					let tooltip = `<strong>${project.name}</strong><br/>`;
					tooltip += `Period: ${project.value[1]} – ${project.value[2]} (${duration + 1} years)<br/>`;
					tooltip += `Publications: ${project.value[3]}`;
					return tooltip;
				} else {
					// Publication marker tooltip
					const markerData = params.data as {
						name: string;
						type: string;
						value: number[];
						projectName: string;
					};
					return `<strong>${markerData.name}</strong><br/>Type: ${formatTypeLabel(markerData.type)}<br/>Year: ${markerData.value[0]}<br/>Project: ${markerData.projectName}`;
				}
			}
		},
		legend: {
			show: false
		},
		grid: {
			left: isMobile ? '3%' : '3%',
			right: isMobile ? '5%' : '5%',
			top: isMobile ? '12%' : '10%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'value',
			min: yearRange.min,
			max: yearRange.max,
			axisLabel: {
				color: resolvedColors.text,
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily,
				formatter: (value: number) => Math.floor(value).toString()
			},
			axisLine: {
				lineStyle: {
					color: resolvedColors.border
				}
			},
			splitLine: {
				lineStyle: {
					color: resolvedColors.border,
					opacity: 0.3,
					type: 'dashed'
				}
			},
			interval: isMobile ? 2 : 1,
			name: 'Year',
			nameLocation: 'middle',
			nameGap: 30,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 11 : 13,
				fontFamily: resolvedColors.fontFamily,
				fontWeight: 'bold'
			}
		},
		yAxis: {
			type: 'category',
			data: data.map((p) => p.name),
			axisLabel: {
				color: resolvedColors.text,
				fontSize: isMobile ? 9 : 11,
				fontFamily: resolvedColors.fontFamily,
				width: isMobile ? 100 : 180,
				overflow: 'truncate',
				ellipsis: '...',
				formatter: function (value: string) {
					// Wrap long project names
					if (isMobile && value.length > 20) {
						return value.substring(0, 20) + '...';
					}
					if (!isMobile && value.length > 35) {
						return value.substring(0, 35) + '...';
					}
					return value;
				}
			},
			axisLine: {
				lineStyle: {
					color: resolvedColors.border
				}
			},
			axisTick: {
				show: false
			},
			inverse: true
		},
		series: [
			{
				// Gantt bars
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
					const startYear = api.value(1);
					const endYear = api.value(2);

					const startCoord = api.coord([startYear, categoryIndex]);
					const endCoord = api.coord([endYear, categoryIndex]);

					const barHeight = isMobile ? 18 : 24;
					const rectShape = {
						x: startCoord[0]!,
						y: startCoord[1]! - barHeight / 2,
						width: endCoord[0]! - startCoord[0]!,
						height: barHeight
					};

					return {
						type: 'rect',
						transition: ['shape'],
						shape: {
							...rectShape,
							r: 0
						},
						style: api.style()
					};
				},
				encode: {
					x: [1, 2],
					y: 0
				},
				data: ganttData,
				clip: true,
				z: 1
			},
			{
				// Publication markers
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

	// Use the ECharts hook for lifecycle management
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => data.length > 0
	});
</script>

<div class="echarts-container scroll-reveal-scale">
	<ChartToolbar chart={echartsInstance.chart} showDecalToggle={false} filename="project-timeline" />
	<div bind:this={chartContainer} class="chart"></div>
	<div class="legend-hint">
		<span class="legend-item">
			<span class="legend-bar"></span>
			Project duration
		</span>
		<span class="legend-item">
			<span class="legend-marker"></span>
			Publication
		</span>
	</div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 100%;
		min-height: 350px;
		display: block;
		position: relative;
		font-family: var(--font-family-sans);
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
		letter-spacing: var(--letter-spacing-wide);
		color: var(--color-text-light);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.legend-bar {
		display: inline-block;
		width: 24px;
		height: 12px;
		background: var(--color-accent);
		border-radius: 0;
	}

	.legend-marker {
		display: inline-block;
		width: 10px;
		height: 10px;
		background: var(--color-surface-elevated);
		border: 2px solid var(--color-accent);
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
