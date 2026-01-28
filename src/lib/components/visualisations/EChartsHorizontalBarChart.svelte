<!--
ECharts Horizontal Bar Chart component
-->
<script lang="ts">
	import type * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	// Props - keeping the same interface as your D3 component for easy replacement
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		xAccessor,
		yAccessor,
		xAxisLabel = '',
		yAxisLabel = '',
		barColor = 'var(--color-primary)',
		maxValue
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => number;
		yAccessor: (d: DataItem) => string;
		xAxisLabel?: string;
		yAxisLabel?: string;
		barColor?: string;
		maxValue?: number;
	} = $props();

	// State management
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = $state(null);
	let echartsLib: typeof echarts | null = null;
	let isChartReady = $state(false);

	// Use Svelte's reactive window width
	const isMobile = $derived((innerWidth.current ?? 1024) < 768);

	// Utility functions for CSS variable resolution
	function getCSSVariableValue(variableName: string): string {
		if (typeof window === 'undefined') return '';
		const computedStyle = getComputedStyle(document.documentElement);
		const value = computedStyle.getPropertyValue(variableName).trim();
		return value;
	}

	function resolveColor(color: string): string {
		if (color.startsWith('var(')) {
			const varName = color.slice(4, -1).trim();
			const val = getCSSVariableValue(varName);
			return val || color;
		}
		return color;
	}

	// Reactive color resolution
	// Fallbacks match design system v2.0 values from variables.css (warm earth tones)
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary') || '#9a4419',
		text: getCSSVariableValue('--color-text') || '#2d2820',
		textLight: getCSSVariableValue('--color-text-light') || '#7a7267',
		border: getCSSVariableValue('--color-border') || '#e8e4df',
		surface: getCSSVariableValue('--color-surface') || '#faf9f7',
		surfaceRgb: getCSSVariableValue('--color-surface-rgb') || '250, 249, 247',
		primaryDark: getCSSVariableValue('--color-primary-dark') || '#7a3516',
		barColor: resolveColor(barColor),
		fontFamily: getCSSVariableValue('--font-family-sans') || 'system-ui, sans-serif',
		currentTheme: getTheme()
	});

	// Chart data transformation - reverse order so highest values appear at top
	const chartData = $derived(
		data
			.map((d) => ({
				name: String(yAccessor(d)),
				value: xAccessor(d)
			}))
			.reverse()
	);
	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		tooltip: {
			trigger: 'axis',
			backgroundColor: `color-mix(in srgb, ${resolvedColors.surface} 90%, transparent)`,
			textStyle: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: resolvedColors.fontFamily
			},
			borderRadius: 8,
			borderColor: resolvedColors.border,
			borderWidth: 1,
			padding: [10, 14],
			extraCssText:
				'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: var(--shadow-lg);'
		},
		grid: {
			left: isMobile ? '120px' : '150px',
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
			interval: 1,
			minInterval: 1,
			max: maxValue,
			axisLine: {
				lineStyle: {
					color: resolvedColors.border
				}
			},
			axisTick: {
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
			}
		},
		yAxis: {
			type: 'category',
			data: chartData.map((d) => d.name),
			name: yAxisLabel,
			nameLocation: 'middle',
			nameGap: 120,
			nameTextStyle: {
				color: resolvedColors.text,
				fontSize: 14,
				fontFamily: resolvedColors.fontFamily
			},
			axisLabel: {
				color: resolvedColors.text,
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily,
				width: isMobile ? 100 : 130,
				overflow: 'truncate'
			},
			axisLine: {
				lineStyle: {
					color: resolvedColors.border
				}
			},
			axisTick: {
				lineStyle: {
					color: resolvedColors.border
				}
			}
		},
		series: [
			{
				name: xAxisLabel || 'Value',
				type: 'bar',
				data: chartData.map((d) => d.value),
				itemStyle: {
					color: resolvedColors.barColor,
					borderRadius: [0, 4, 4, 0]
				},
				emphasis: {
					itemStyle: {
						color: resolvedColors.primaryDark,
						shadowColor: resolvedColors.primary,
						shadowBlur: 10
					}
				},
				animationDuration: 1000,
				animationEasing: 'elasticOut' as any
			}
		],
		backgroundColor: 'transparent'
	});

	// Effect for initialization and cleanup
	$effect(() => {
		let mounted = true;
		let resizeObserver: ResizeObserver | undefined;

		// Load echarts library and initialize chart
		(async () => {
			if (!echartsLib) {
				try {
					const echartsModule = await import('echarts');
					if (mounted) {
						echartsLib = echartsModule;
					}
				} catch (error) {
					console.error('Failed to load ECharts:', error);
					return;
				}
			}

			// Initialize chart only when container is available and chart doesn't exist
			if (chartContainer && !chart && echartsLib) {
				try {
					chart = echartsLib.init(chartContainer);

					// Setup resize observer after chart is created
					resizeObserver = new ResizeObserver(() => {
						if (chart && !chart.isDisposed()) {
							chart.resize();
						}
					});
					resizeObserver.observe(chartContainer);
					isChartReady = true;
				} catch (error) {
					console.error('Failed to initialize ECharts:', error);
					return;
				}
			}
		})();

		return () => {
			mounted = false;
			isChartReady = false;
			resizeObserver?.disconnect();
			if (chart && !chart.isDisposed()) {
				chart.dispose();
				chart = null;
			}
		};
	});

	// Separate effect for updating chart when options change
	$effect(() => {
		if (isChartReady && chart && !chart.isDisposed() && chartData.length > 0) {
			try {
				chart.setOption(chartOption, true);
			} catch (error) {
				console.error('Failed to update chart options:', error);
			}
		}
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
