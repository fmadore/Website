<!--
ECharts Doughnut/Pie Chart - A doughnut chart for visualizing categorical data
-->
<script lang="ts">
	import type * as echarts from 'echarts';
	import { getTheme } from '$lib/stores/themeStore.svelte';
	import { scrollAnimate } from '$lib/utils/scrollAnimations';
	import { innerWidth } from 'svelte/reactivity/window';

	// Props - keeping interface simple for doughnut chart
	type DataItem = $$Generic;
	let {
		data = [] as DataItem[],
		nameAccessor,
		valueAccessor,
		title = '',
		showLabels = true,
		radius = ['40%', '70%'], // Inner and outer radius for doughnut
		colors = [
			'var(--color-primary)',
			'var(--color-accent)',
			'var(--color-highlight)',
			'var(--color-success)',
			'var(--color-secondary)',
			'rgba(var(--color-primary-rgb), 0.8)',
			'rgba(var(--color-highlight-rgb), 0.8)',
			'rgba(var(--color-success-rgb), 0.8)',
			'rgba(var(--color-primary-rgb), 0.6)',
			'rgba(var(--color-highlight-rgb), 0.6)',
			'rgba(var(--color-success-rgb), 0.6)',
			'rgba(var(--color-primary-rgb), 0.4)',
			'rgba(var(--color-highlight-rgb), 0.4)',
			'rgba(var(--color-success-rgb), 0.4)'
		]
	}: {
		data?: DataItem[];
		nameAccessor: (d: DataItem) => string;
		valueAccessor: (d: DataItem) => number;
		title?: string;
		showLabels?: boolean;
		radius?: [string, string];
		colors?: string[];
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
		if (color.startsWith('rgba(var(')) {
			const rgbaMatch = color.match(/rgba\(var\(([^)]+)\),\s*([^)]+)\)/);
			if (rgbaMatch) {
				const rgbVarName = rgbaMatch[1];
				const opacity = rgbaMatch[2];
				const rgbValue = getCSSVariableValue(rgbVarName) || '0, 0, 0';
				return `rgba(${rgbValue}, ${opacity})`;
			}
		}
		return color;
	}

	// Reactive color resolution
	// Fallbacks match design system v2.0 values from variables.css
	const resolvedColors = $derived({
		primary: getCSSVariableValue('--color-primary') || '#1d4ed8',
		text: getCSSVariableValue('--color-text') || '#1e293b',
		textLight: getCSSVariableValue('--color-text-light') || '#64748b',
		border: getCSSVariableValue('--color-border') || '#e2e8f0',
		surface: getCSSVariableValue('--color-surface') || '#f8fafc',
		surfaceRgb: getCSSVariableValue('--color-surface-rgb') || '248, 250, 252',
		accent: getCSSVariableValue('--color-accent') || '#14b8a6',
		highlight: getCSSVariableValue('--color-highlight') || '#f59e0b',
		chartColors: colors.map((color) => resolveColor(color)),
		fontFamily: getCSSVariableValue('--font-family-sans') || 'system-ui, sans-serif',
		currentTheme: getTheme()
	});
	// Chart data transformation
	const chartData = $derived(
		data.map((d) => ({
			name: nameAccessor(d),
			value: valueAccessor(d)
		}))
	);

	// Chart options - reactive to all dependencies
	const chartOption = $derived({
		title: {
			show: false // Hide internal title to avoid duplication with external container title
		},
		tooltip: {
			trigger: 'item',
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
			extraCssText: 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: var(--shadow-lg);',
			formatter: '{a} <br/>{b}: {c} ({d}%)',
			confine: isMobile,
			position: isMobile
				? function (point: [number, number], params: any, dom: HTMLElement, rect: any, size: any) {
						const tooltipWidth = size.contentSize[0];
						const tooltipHeight = size.contentSize[1];
						const viewportWidth = size.viewSize[0];

						let x = Math.max(
							10,
							Math.min(viewportWidth - tooltipWidth - 10, point[0] - tooltipWidth / 2)
						);
						let y = point[1] - tooltipHeight - 10;

						if (y < 10) {
							y = point[1] + 20;
						}

						return [x, y];
					}
				: undefined
		},
		legend: {
			orient: 'horizontal',
			left: 'center',
			bottom: isMobile ? '5%' : '8%',
			textStyle: {
				color: resolvedColors.text,
				fontSize: isMobile ? 11 : 13,
				fontFamily: resolvedColors.fontFamily,
				fontWeight: '500'
			},
			itemGap: isMobile ? 12 : 20,
			itemWidth: isMobile ? 12 : 14,
			itemHeight: isMobile ? 12 : 14,
			padding: [5, 10],
			backgroundColor: 'transparent'
		},
		series: [
			{
				name: title || 'Data',
				type: 'pie',
				radius: radius,
				center: ['50%', isMobile ? '42%' : '44%'],
				data: chartData,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				},
				label: {
					show: showLabels,
					position: isMobile ? 'inside' : 'outside',
					color: isMobile ? '#ffffff' : resolvedColors.text,
					fontSize: isMobile ? 11 : 12,
					fontFamily: resolvedColors.fontFamily,
					fontWeight: 'bold',
					formatter: isMobile ? '{d}%' : '{b}: {d}%',
					textBorderColor: isMobile ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
					textBorderWidth: isMobile ? 2 : 0,
					textShadowColor: isMobile ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
					textShadowBlur: isMobile ? 3 : 0,
					minMargin: isMobile ? 8 : 5,
					padding: isMobile ? [2, 4] : [0, 0]
				},
				labelLine: {
					show: showLabels && !isMobile,
					length: 15,
					length2: 10,
					lineStyle: {
						color: resolvedColors.textLight,
						width: 1
					}
				},
				itemStyle: {
					borderRadius: 6,
					borderColor: resolvedColors.surface,
					borderWidth: 2
				},
				labelLayout: isMobile
					? {
							hideOverlap: true,
							moveOverlap: 'shiftY'
						}
					: undefined,
				animationType: 'scale',
				animationEasing: 'elasticOut' as any,
				animationDelay: function () {
					return Math.random() * 200;
				}
			}
		],
		color: resolvedColors.chartColors,
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

<div
	class="echarts-container"
	use:scrollAnimate={{
		delay: 350,
		animationClass: 'scale-in-center',
		rootMargin: '100px',
		threshold: 0.1
	}}
>
	<div bind:this={chartContainer} class="chart"></div>
</div>

<style>
	.echarts-container {
		width: 100%;
		height: 480px; /* Increased height to accommodate legend */
		display: block;
		position: relative;
		/* Remove background, border, and styling - let parent handle it */
		font-family: var(--font-family-sans);
		/* Initial state for scroll animation */
		opacity: 0;
		transform: scale(0.8) translateY(20px);
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

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.echarts-container {
			height: 420px; /* Increased height for mobile with legend space */
		}
	}

	@media (max-width: 480px) {
		.echarts-container {
			height: 400px; /* Adequate height for very small screens with legend */
		}
	}
</style>
