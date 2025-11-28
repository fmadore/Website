<!--
ECharts Bar Chart - A much simpler alternative to the custom D3 implementation
-->
<script lang="ts">
	import type * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { innerWidth } from 'svelte/reactivity/window';

	// Props - keeping the same interface as your D3 component for easy replacement
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		xAccessor,
		yAccessor,
		xAxisLabel = '',
		yAxisLabel = '',
		barColor = 'var(--color-primary)'
	}: {
		data?: DataItem[];
		xAccessor: (d: DataItem) => string | number;
		yAccessor: (d: DataItem) => number;
		xAxisLabel?: string;
		yAxisLabel?: string;
		barColor?: string;
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
			// Extract variable name from var(--variable-name)
			const varName = color.slice(4, -1).trim();
			const val = getCSSVariableValue(varName);
			return val || color; // Return original if var not found
		}
		return color; // Return as-is if not a CSS variable
	}

	// Reactive color resolution - updates when theme changes
	// Fallbacks match design system v2.0 values from variables.css
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary') || '#1d4ed8',
		text: getCSSVariableValue('--color-text') || '#1e293b',
		textLight: getCSSVariableValue('--color-text-light') || '#64748b',
		border: getCSSVariableValue('--color-border') || '#e2e8f0',
		surface: getCSSVariableValue('--color-surface') || '#f8fafc',
		surfaceRgb: getCSSVariableValue('--color-surface-rgb') || '248, 250, 252',
		primaryDark: getCSSVariableValue('--color-primary-dark') || '#1e3a5f',
		barColor: resolveColor(barColor),
		fontFamily: getCSSVariableValue('--font-family-sans') || 'system-ui, sans-serif',
		// Include theme to make this reactive to theme changes
		currentTheme: getTheme()
	});

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
			backgroundColor: `rgba(${resolvedColors.surfaceRgb}, 0.9)`,
			textStyle: {
				color: resolvedColors.text,
				fontSize: 12,
				fontFamily: resolvedColors.fontFamily
			},
			borderRadius: 8,
			borderColor: resolvedColors.border,
			borderWidth: 1,
			padding: [10, 14],
			extraCssText: 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: var(--shadow-lg);'
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
		series: [
			{
				name: yAxisLabel || 'Value',
				type: 'bar',
				data: chartData.map((d) => d.value),
				itemStyle: {
					color: resolvedColors.barColor,
					borderRadius: [4, 4, 0, 0]
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
		backgroundColor: 'transparent' // Let the container handle background
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

<div
	class="echarts-container"
	use:scrollAnimate={{
		delay: 200,
		animationClass: 'scale-in',
		rootMargin: '100px',
		threshold: 0.1
	}}
>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 350px;
		display: block;
		position: relative;
		/* Remove background, border, and styling - let parent handle it */
		font-family: var(--font-family-sans);
		/* Initial state for scroll animation */
		opacity: 0;
		transform: scale(0.9);
		transition: all var(--duration-slow) var(--ease-out);
	}

	.chart {
		width: 100%;
		height: 100%;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.echarts-container {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}
	}
</style>
