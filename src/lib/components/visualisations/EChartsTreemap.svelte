<!--
ECharts Treemap - Hierarchical visualization for grouped data (e.g., publication venues by type)
-->
<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import {
		getResolvedChartColors,
		resolveColors,
		getEChartsTooltipStyle
	} from '$lib/utils/chartColorUtils';
	import { useECharts } from '$lib/utils/useECharts.svelte';
	import ChartToolbar from './ChartToolbar.svelte';
	import { getAriaConfig } from '$lib/utils/chartActions';
	import type { DefaultLabelFormatterCallbackParams } from 'echarts';

	// Types for treemap data
	interface TreemapChild {
		name: string;
		value: number;
		publications?: string[];
	}

	interface TreemapNode {
		name: string;
		children: TreemapChild[];
	}

	// Props
	let {
		data = [] as TreemapNode[],
		title = '',
		colors = [
			'var(--color-primary)',
			'var(--color-accent)',
			'var(--color-highlight)',
			'var(--color-success)',
			'var(--color-secondary)',
			'var(--sys-color-purple-500)',
			'var(--sys-color-blue-500)'
		]
	}: {
		data?: TreemapNode[];
		title?: string;
		colors?: string[];
	} = $props();

	// Container reference
	let outerEl: HTMLDivElement;
	let chartContainer: HTMLDivElement;

	// Toolbar state
	let showDecal = $state(false);

	// JS-driven sizing: observe the wrapper parent to get its content area dimensions
	// This is more robust than CSS height:100% which can break with contain:strict
	let resolvedHeight = $state(0);
	let resolvedWidth = $state(0);

	$effect(() => {
		if (!outerEl) return;
		const parent = outerEl.parentElement;
		if (!parent) return;

		const sync = () => {
			const style = getComputedStyle(parent);
			const ph =
				parseFloat(style.paddingTop) +
				parseFloat(style.paddingBottom) +
				parseFloat(style.borderTopWidth) +
				parseFloat(style.borderBottomWidth);
			const pw =
				parseFloat(style.paddingLeft) +
				parseFloat(style.paddingRight) +
				parseFloat(style.borderLeftWidth) +
				parseFloat(style.borderRightWidth);
			resolvedHeight = parent.offsetHeight - ph;
			resolvedWidth = parent.offsetWidth - pw;
		};

		// Initial sync
		sync();

		const ro = new ResizeObserver(sync);
		ro.observe(parent);
		return () => ro.disconnect();
	});

	// Use Svelte's reactive window width for responsive breakpoints
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Reactive color resolution
	const resolvedColors = $derived({
		...getResolvedChartColors(),
		chartColors: resolveColors(colors)
	});

	// Calculate total publications for percentage calculations
	const totalPublications = $derived(
		data.reduce((sum, node) => {
			return sum + node.children.reduce((childSum, child) => childSum + child.value, 0);
		}, 0)
	);

	// Pre-process data to assign colors to parent nodes so children inherit them
	const coloredData = $derived(
		data.map((node, index) => ({
			...node,
			itemStyle: {
				color: resolvedColors.chartColors[index % resolvedColors.chartColors.length]
			},
			children: node.children.map((child) => ({
				...child,
				itemStyle: {
					color: resolvedColors.chartColors[index % resolvedColors.chartColors.length]
				}
			}))
		}))
	);

	type TreemapFormatterParams = DefaultLabelFormatterCallbackParams & {
		data: TreemapNode | (TreemapChild & { children?: never });
		treePathInfo?: Array<{ name: string; dataIndex: number; value: number }>;
	};

	// Chart options
	const chartOption = $derived({
		title: {
			show: false
		},
		tooltip: {
			...getEChartsTooltipStyle(resolvedColors),
			confine: true,
			formatter: function (params: TreemapFormatterParams) {
				if ('children' in params.data && params.data.children) {
					// Category node (parent)
					const categoryTotal = params.data.children.reduce(
						(sum: number, child: TreemapChild) => sum + child.value,
						0
					);
					const percentage = ((categoryTotal / totalPublications) * 100).toFixed(1);
					return `<strong>${params.name}</strong><br/>Publications: ${categoryTotal} (${percentage}%)`;
				} else {
					// Venue node (leaf)
					const percentage = (((params.value as number) / totalPublications) * 100).toFixed(1);
					const leafData = params.data as TreemapChild;
					let tooltip = `<strong>${params.name}</strong><br/>Publications: ${params.value} (${percentage}%)`;
					if (leafData.publications && leafData.publications.length <= 5) {
						tooltip += '<br/><br/><em>Titles:</em>';
						leafData.publications.forEach((pub: string) => {
							// Truncate long titles
							const truncated = pub.length > 50 ? pub.substring(0, 50) + '...' : pub;
							tooltip += `<br/>• ${truncated}`;
						});
					}
					return tooltip;
				}
			}
		},
		series: [
			{
				name: title || 'Publication Venues',
				type: 'treemap',
				roam: false,
				width: '100%',
				// Shrink the tile area so the breadcrumb gets a proper gap below it
				// instead of visually touching the last row of tiles.
				height: isMobile ? '80%' : '86%',
				top: isMobile ? '8%' : '5%',
				nodeClick: 'zoomToNode',
				breadcrumb: {
					show: true,
					top: isMobile ? 0 : 'auto',
					// Push the breadcrumb further from the bottom edge for breathing room.
					bottom: isMobile ? 'auto' : 12,
					height: 22,
					itemStyle: {
						color: resolvedColors.surface,
						borderColor: resolvedColors.border,
						borderWidth: 1,
						shadowBlur: 3,
						shadowColor: 'rgba(0, 0, 0, 0.1)'
					},
					emphasis: {
						itemStyle: {
							color: resolvedColors.primary,
							textStyle: {
								color: resolvedColors.white
							}
						}
					},
					textStyle: {
						color: resolvedColors.text,
						fontSize: isMobile ? 11 : 12,
						fontFamily: resolvedColors.fontFamily
					}
				},
				label: {
					show: true,
					formatter: function (params: TreemapFormatterParams) {
						if ('children' in params.data && params.data.children) {
							return `{name|${params.name}}\n{count|${params.data.children.reduce((s: number, c: TreemapChild) => s + c.value, 0)}}`;
						}
						return isMobile && (params.value as number) < 2
							? ''
							: `{name|${params.name}}\n{count|${params.value}}`;
					},
					rich: {
						name: {
							fontSize: isMobile ? 11 : 13,
							fontWeight: 'bold',
							fontFamily: resolvedColors.fontFamily,
							color: resolvedColors.white,
							textShadowColor: 'rgba(0, 0, 0, 0.5)',
							textShadowBlur: 3,
							lineHeight: isMobile ? 16 : 20,
							overflow: 'truncate',
							ellipsis: '…'
						},
						count: {
							fontSize: isMobile ? 10 : 12,
							fontFamily: resolvedColors.fontFamily,
							color: 'rgba(255, 255, 255, 0.85)',
							textShadowColor: 'rgba(0, 0, 0, 0.5)',
							textShadowBlur: 2,
							lineHeight: isMobile ? 14 : 18
						}
					},
					position: 'insideTopLeft',
					padding: [4, 6]
				},
				upperLabel: {
					show: true,
					height: isMobile ? 24 : 30,
					// Suppress the label on the root node — it would otherwise render a
					// faded, redundant "Publication Venues" banner on the card background
					// (the section heading above already says that). The root has a
					// `treePathInfo` of length 1; category tiles (Journals, Book
					// Publishers) have length ≥ 2.
					formatter: (params: TreemapFormatterParams) => {
						const path = params.treePathInfo;
						if (!path || path.length <= 1) return '';
						return params.name;
					},
					color: '#ffffff',
					fontWeight: 'bold',
					fontSize: isMobile ? 12 : 14,
					fontFamily: resolvedColors.fontFamily,
					// Combined stroke + shadow keeps the label readable on either the
					// teal or the orange category tile.
					textBorderColor: 'rgba(0, 0, 0, 0.45)',
					textBorderWidth: 3,
					textShadowColor: 'rgba(0, 0, 0, 0.55)',
					textShadowBlur: 4,
					overflow: 'truncate',
					ellipsis: '…'
				},
				itemStyle: {
					borderColor: resolvedColors.surface,
					borderWidth: isMobile ? 1 : 2,
					gapWidth: isMobile ? 1 : 2,
					borderRadius: 4
				},
				emphasis: {
					upperLabel: {
						show: true,
						color: resolvedColors.white,
						fontWeight: 'bold'
					},
					itemStyle: {
						borderColor: resolvedColors.white,
						borderWidth: 2
					}
				},
				levels: [
					{
						// Root level (categories like "Journals", "Publishers")
						itemStyle: {
							borderColor: resolvedColors.border,
							borderWidth: isMobile ? 2 : 3,
							gapWidth: isMobile ? 2 : 3
						},
						upperLabel: {
							show: true
						}
					},
					{
						// Leaf level (individual venues) - inherit parent color
						itemStyle: {
							borderColor: resolvedColors.surface,
							borderWidth: 1,
							gapWidth: 1
						}
					}
				],
				data: coloredData,
				colorMappingBy: 'id'
			}
		],
		aria: getAriaConfig(showDecal),
		backgroundColor: 'transparent'
	});

	// Use the ECharts hook for lifecycle management
	const echartsInstance = useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => data.length > 0
	});
</script>

<div
	class="echarts-container scroll-reveal-scale"
	bind:this={outerEl}
	style={resolvedHeight > 0 ? `width:${resolvedWidth}px;height:${resolvedHeight}px` : ''}
>
	<ChartToolbar chart={echartsInstance.chart} bind:showDecal filename={title || 'treemap'} />
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
