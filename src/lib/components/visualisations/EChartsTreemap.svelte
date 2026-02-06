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
			'color-mix(in srgb, var(--color-primary) 70%, var(--color-accent))',
			'color-mix(in srgb, var(--color-highlight) 80%, var(--color-success))'
		]
	}: {
		data?: TreemapNode[];
		title?: string;
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
			// Children will inherit parent color through colorMappingBy
			children: node.children.map((child) => ({
				...child,
				itemStyle: {
					color: resolvedColors.chartColors[index % resolvedColors.chartColors.length]
				}
			}))
		}))
	);

	// Chart options
	const chartOption = $derived({
		title: {
			show: false
		},
		tooltip: {
			...getEChartsTooltipStyle(resolvedColors),
			formatter: function (params: any) {
				if (params.data.children) {
					// Category node (parent)
					const categoryTotal = params.data.children.reduce(
						(sum: number, child: any) => sum + child.value,
						0
					);
					const percentage = ((categoryTotal / totalPublications) * 100).toFixed(1);
					return `<strong>${params.name}</strong><br/>Publications: ${categoryTotal} (${percentage}%)`;
				} else {
					// Venue node (leaf)
					const percentage = ((params.value / totalPublications) * 100).toFixed(1);
					let tooltip = `<strong>${params.name}</strong><br/>Publications: ${params.value} (${percentage}%)`;
					if (params.data.publications && params.data.publications.length <= 5) {
						tooltip += '<br/><br/><em>Titles:</em>';
						params.data.publications.forEach((pub: string) => {
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
				height: isMobile ? '85%' : '90%',
				top: isMobile ? '8%' : '5%',
				nodeClick: 'zoomToNode',
				breadcrumb: {
					show: true,
					top: isMobile ? 0 : 'auto',
					bottom: isMobile ? 'auto' : 5,
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
					formatter: function (params: any) {
						if (params.data.children) {
							return `{name|${params.name}}\n{count|${params.data.children.reduce((s: number, c: any) => s + c.value, 0)}}`;
						}
						return isMobile && params.value < 2
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
							lineHeight: isMobile ? 16 : 20
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
					height: 30,
					formatter: '{b}',
					color: resolvedColors.white,
					fontWeight: 'bold',
					fontSize: isMobile ? 12 : 14,
					fontFamily: resolvedColors.fontFamily,
					textShadowColor: 'rgba(0, 0, 0, 0.6)',
					textShadowBlur: 4
				},
				itemStyle: {
					borderColor: resolvedColors.surface,
					borderWidth: 2,
					gapWidth: 2,
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
							borderWidth: 3,
							gapWidth: 3
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
		backgroundColor: 'transparent'
	});

	// Use the ECharts hook for lifecycle management
	useECharts({
		getContainer: () => chartContainer,
		getOption: () => chartOption,
		hasData: () => data.length > 0
	});
</script>

<div class="echarts-container scroll-reveal-scale">
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 500px;
		display: block;
		position: relative;
		font-family: var(--font-family-sans);
	}

	.chart {
		width: 100%;
		height: 100%;
	}

	@media (--sm-down) {
		.echarts-container {
			height: 450px;
		}
	}

	@media (--xs-down) {
		.echarts-container {
			height: 400px;
		}
	}
</style>
