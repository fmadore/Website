<!--
ECharts Stacked Bar Chart component
-->
<script lang="ts">
	import type * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	// Props - keeping the same interface as your D3 component for easy replacement
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		keys = [] as string[],
		xAxisLabel = '',
		yAxisLabel = '',
		colors = [
			'var(--color-primary)', // Blog post - terracotta
			'var(--color-highlight)', // Book - gold/amber
			'var(--color-accent)', // Book chapter - gold
			'var(--color-success)', // Bulletin article - green
			'var(--sys-color-terracotta-400)', // Conference proceedings - light terracotta
			'var(--color-secondary)', // Encyclopedia entry - neutral gray
			'var(--sys-color-terracotta-600)', // Journal article - medium terracotta
			'var(--sys-color-amber-400)', // Master's thesis - amber variant
			'var(--color-danger)', // PhD dissertation - red
			'var(--sys-color-gold-600)', // Research report - dark gold
			'var(--color-primary-dark)' // Special issue - darkest terracotta
		]
	}: {
		data?: DataItem[];
		keys?: string[];
		xAxisLabel?: string;
		yAxisLabel?: string;
		colors?: string[];
	} = $props();

	// State management
	let chartContainer: HTMLDivElement;
	let chart: echarts.ECharts | null = $state(null);
	let echartsLib: typeof echarts | null = null;
	let isChartReady = $state(false);

	// Use Svelte's reactive window width instead of manual event listener
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
		resolvedSeriesColors: colors.map((color) => resolveColor(color)),
		fontFamily: getCSSVariableValue('--font-family-sans') || 'system-ui, sans-serif',
		currentTheme: getTheme()
	});

	// Chart data transformation
	const chartCategories = $derived(
		data.map((d) => String((d as any).year || (d as any).name || (d as any).x))
	);

	const seriesData = $derived(
		keys.map((key, index) => ({
			name: key,
			type: 'bar',
			stack: 'total',
			data: data.map((d) => (d as any)[key] || 0),
			itemStyle: {
				color:
					resolvedColors.resolvedSeriesColors[index % resolvedColors.resolvedSeriesColors.length],
				borderRadius: [4, 4, 0, 0]
			},
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: resolvedColors.primary
				}
			}
		}))
	); // Chart options - reactive to all dependencies
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
				'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: var(--shadow-lg);',
			axisPointer: {
				type: 'shadow'
			},
			formatter: function (params: any) {
				// Filter out series with value 0
				const nonZeroParams = params.filter((param: any) => param.value > 0);

				if (nonZeroParams.length === 0) {
					return `${params[0].axisValueLabel}<br/>No publications`;
				}

				let result = `${nonZeroParams[0].axisValueLabel}<br/>`;

				// Calculate total for the year
				const total = nonZeroParams.reduce((sum: number, param: any) => sum + param.value, 0);

				// Add each non-zero publication type
				nonZeroParams.forEach((param: any) => {
					result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
				});

				// Add total
				result += `<strong>Total: ${total}</strong>`;

				return result;
			}
		},
		legend: {
			orient: 'horizontal',
			left: 'center',
			top: 'top',
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily
			},
			itemGap: isMobile ? 8 : 12,
			itemWidth: isMobile ? 10 : 14,
			itemHeight: isMobile ? 10 : 14
		},
		grid: {
			left: isMobile ? 32 : 64,
			right: 24,
			top: isMobile ? 80 : 64, // More space on mobile for legend
			bottom: xAxisLabel ? 80 : 48,
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
				fontSize: isMobile ? 10 : 12,
				fontFamily: resolvedColors.fontFamily,
				interval: isMobile ? 'auto' : 0, // Auto interval on mobile to prevent overlapping
				rotate: isMobile ? 45 : 0 // Rotate labels on mobile if needed
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
		series: seriesData,
		backgroundColor: 'transparent',
		animationDuration: 1000,
		animationEasing: 'elasticOut' as any
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
		if (isChartReady && chart && !chart.isDisposed() && data.length > 0) {
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
